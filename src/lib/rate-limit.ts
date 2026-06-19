import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-IP rate limiting with two backends:
 *  - Upstash Redis (distributed, correct across Vercel's serverless instances)
 *    when UPSTASH_REDIS_REST_URL/TOKEN are set.
 *  - An in-memory sliding window fallback otherwise. Best-effort only: each
 *    serverless instance keeps its own counters, so a determined attacker can
 *    partially evade it — but it still throttles casual abuse with zero setup.
 *
 * Add the two Upstash env vars to upgrade to robust limiting (no code change).
 */
const hasUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);
const redis = hasUpstash ? Redis.fromEnv() : null;

export const rateLimitBackend = hasUpstash ? "upstash" : "memory";

const upstashLimiters = new Map<string, Ratelimit>();
function upstashLimiter(name: string, max: number, windowSec: number): Ratelimit {
  let l = upstashLimiters.get(name);
  if (!l) {
    l = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
      prefix: `rl:${name}`,
      analytics: false,
    });
    upstashLimiters.set(name, l);
  }
  return l;
}

// In-memory sliding window: key -> request timestamps within the window.
const memoryHits = new Map<string, number[]>();
function memoryLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (memoryHits.get(key) ?? []).filter((t) => now - t < windowMs);
  const success = recent.length < max;
  if (success) recent.push(now);
  memoryHits.set(key, recent);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (memoryHits.size > 5000) {
    for (const [k, v] of memoryHits) {
      if (v.every((t) => now - t >= windowMs)) memoryHits.delete(k);
    }
  }
  return { success, remaining: Math.max(0, max - recent.length) };
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

/** Check (and consume) one unit against the named limit for this identifier. */
export async function rateLimit(
  name: string,
  identifier: string,
  max: number,
  windowSec: number,
): Promise<RateLimitResult> {
  if (hasUpstash) {
    const r = await upstashLimiter(name, max, windowSec).limit(identifier);
    return { success: r.success, remaining: r.remaining };
  }
  return memoryLimit(`${name}:${identifier}`, max, windowSec * 1000);
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
