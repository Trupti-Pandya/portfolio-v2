import { describe, it, expect } from "vitest";
import { encodeHeader } from "./gmail";

describe("encodeHeader (RFC 2047 subject encoding)", () => {
  it("passes pure ASCII through unchanged", () => {
    expect(encodeHeader("New booking request")).toBe("New booking request");
  });

  it("encodes non-ASCII as a base64 encoded-word (the mojibake fix)", () => {
    const out = encodeHeader("✅ Booking confirmed");
    expect(out).toMatch(/^=\?UTF-8\?B\?.+\?=$/);
  });

  it("round-trips the encoded value back to the original UTF-8 string", () => {
    const subject = "✅ Café meeting — Trupti";
    const out = encodeHeader(subject);
    const b64 = out.replace(/^=\?UTF-8\?B\?/, "").replace(/\?=$/, "");
    expect(Buffer.from(b64, "base64").toString("utf-8")).toBe(subject);
  });
});
