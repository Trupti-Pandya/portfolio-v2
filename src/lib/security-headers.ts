/**
 * Response headers applied to every route via next.config.ts headers().
 *
 * The CSP is sent as Content-Security-Policy-Report-Only: browsers log
 * violations to the console but block nothing. Watch for violations before
 * switching the key to Content-Security-Policy.
 *
 * What the site loads (keep in sync when adding a third party):
 * - Next.js inline bootstrap/RSC scripts and inline style attributes
 *   ('unsafe-inline' until a nonce is wired through middleware).
 * - Vercel Speed Insights: /_vercel/speed-insights/* in production,
 *   va.vercel-scripts.com outside Vercel.
 * - Google Fonts stylesheet (fonts.googleapis.com) and font files
 *   (fonts.gstatic.com); next/font files are self-hosted.
 * - Images are all local (/public), plus data: and blob: from canvas work.
 * - The chat widget calls same-origin /api/* routes only.
 * - JSON-LD <script type="application/ld+json"> is a data block, not run.
 */

export function contentSecurityPolicy(isDev: boolean): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
      "https://va.vercel-scripts.com",
    ],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "blob:"],
    "connect-src": ["'self'", "https://va.vercel-scripts.com", ...(isDev ? ["ws:"] : [])],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "frame-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
  "serial=()",
  "bluetooth=()",
  "magnetometer=()",
  "gyroscope=()",
  "accelerometer=()",
  "browsing-topics=()",
].join(", ");

export function securityHeaders(isDev: boolean): { key: string; value: string }[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
    { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy(isDev) },
  ];
}
