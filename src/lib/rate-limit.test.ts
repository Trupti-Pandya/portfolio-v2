import { describe, it, expect } from "vitest";
import { rateLimit, rateLimitBackend, clientIp } from "./rate-limit";

// No Upstash env in the test runner, so this exercises the in-memory fallback.
describe("rateLimit (in-memory fallback)", () => {
  it("uses the memory backend when Upstash is not configured", () => {
    expect(rateLimitBackend).toBe("memory");
  });

  it("allows up to the max, then blocks within the window", async () => {
    const ip = `ip-${Math.random()}`;
    const r1 = await rateLimit("unit", ip, 3, 60);
    const r2 = await rateLimit("unit", ip, 3, 60);
    const r3 = await rateLimit("unit", ip, 3, 60);
    const r4 = await rateLimit("unit", ip, 3, 60);
    expect([r1.success, r2.success, r3.success]).toEqual([true, true, true]);
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("tracks identifiers independently", async () => {
    const a = await rateLimit("unit", `a-${Math.random()}`, 1, 60);
    const b = await rateLimit("unit", `b-${Math.random()}`, 1, 60);
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
  });
});

describe("clientIp", () => {
  it("takes the first IP from x-forwarded-for", () => {
    const req = new Request("https://x.test", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to 'unknown' with no proxy headers", () => {
    expect(clientIp(new Request("https://x.test"))).toBe("unknown");
  });
});
