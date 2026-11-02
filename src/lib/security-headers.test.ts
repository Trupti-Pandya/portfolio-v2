import { describe, it, expect } from "vitest";
import { securityHeaders, contentSecurityPolicy } from "./security-headers";

const byKey = (isDev: boolean) =>
  Object.fromEntries(securityHeaders(isDev).map((h) => [h.key, h.value]));

describe("securityHeaders", () => {
  it("sends the standard hardening headers", () => {
    const h = byKey(false);
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Permissions-Policy"]).toMatch(/camera=\(\)/);
    expect(h["Permissions-Policy"]).toMatch(/microphone=\(\)/);
    expect(h["Permissions-Policy"]).toMatch(/geolocation=\(\)/);
  });

  it("ships CSP in report-only mode, never enforcing", () => {
    const h = byKey(false);
    expect(h["Content-Security-Policy-Report-Only"]).toBe(contentSecurityPolicy(false));
    expect(h["Content-Security-Policy"]).toBeUndefined();
  });
});

describe("contentSecurityPolicy", () => {
  const directives = (isDev: boolean) =>
    Object.fromEntries(
      contentSecurityPolicy(isDev)
        .split(";")
        .map((d) => d.trim().split(/\s+/))
        .map(([name, ...values]) => [name, values]),
    );

  it("allows what the homepage loads", () => {
    const d = directives(false);
    expect(d["script-src"]).toEqual(
      expect.arrayContaining(["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com"]),
    );
    expect(d["style-src"]).toEqual(
      expect.arrayContaining(["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"]),
    );
    expect(d["font-src"]).toEqual(expect.arrayContaining(["'self'", "https://fonts.gstatic.com"]));
    expect(d["connect-src"]).toContain("'self'");
    expect(d["img-src"]).toEqual(expect.arrayContaining(["'self'", "data:", "blob:"]));
  });

  it("locks down framing, plugins, base URI and form targets", () => {
    const d = directives(false);
    expect(d["frame-ancestors"]).toEqual(["'none'"]);
    expect(d["object-src"]).toEqual(["'none'"]);
    expect(d["base-uri"]).toEqual(["'self'"]);
    expect(d["form-action"]).toEqual(["'self'"]);
  });

  it("allows eval only in development (webpack dev runtime)", () => {
    expect(directives(false)["script-src"]).not.toContain("'unsafe-eval'");
    expect(directives(true)["script-src"]).toContain("'unsafe-eval'");
  });
});
