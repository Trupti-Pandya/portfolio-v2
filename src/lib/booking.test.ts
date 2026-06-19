import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveBaseUrl } from "./booking";

describe("resolveBaseUrl", () => {
  const original = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });
  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = original;
  });

  it("prefers a configured non-localhost URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://truptipandya.dev";
    expect(resolveBaseUrl("http://localhost:3000")).toBe("https://truptipandya.dev");
  });

  it("strips a trailing slash from the configured URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://truptipandya.dev/";
    expect(resolveBaseUrl("http://localhost:3000")).toBe("https://truptipandya.dev");
  });

  it("falls back to the request origin when the configured URL is localhost", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    expect(resolveBaseUrl("https://preview.vercel.app")).toBe("https://preview.vercel.app");
  });

  it("falls back to the request origin when nothing is configured", () => {
    expect(resolveBaseUrl("https://truptipandya.dev")).toBe("https://truptipandya.dev");
  });

  it("strips a trailing slash from the request-origin fallback", () => {
    expect(resolveBaseUrl("https://truptipandya.dev/")).toBe("https://truptipandya.dev");
  });
});
