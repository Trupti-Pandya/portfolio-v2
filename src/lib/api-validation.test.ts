import { describe, it, expect } from "vitest";
import { validateChatMessages, validateBooking, LIMITS } from "./api-validation";

describe("validateChatMessages", () => {
  it("accepts a normal conversation", () => {
    expect(validateChatMessages([{ role: "user", content: "hi" }])).toBeNull();
  });

  it("rejects empty / non-array", () => {
    expect(validateChatMessages([])).toMatch(/non-empty/);
    expect(validateChatMessages("nope")).toMatch(/non-empty/);
  });

  it("rejects too many messages", () => {
    const many = Array.from({ length: LIMITS.maxMessages + 1 }, () => ({ role: "user" as const, content: "x" }));
    expect(validateChatMessages(many)).toMatch(/too many/);
  });

  it("rejects an over-long message (token-cost inflation)", () => {
    const big = [{ role: "user" as const, content: "a".repeat(LIMITS.maxMessageChars + 1) }];
    expect(validateChatMessages(big)).toMatch(/too long/);
  });

  it("rejects an invalid role", () => {
    expect(validateChatMessages([{ role: "system", content: "x" }])).toMatch(/valid role/);
  });
});

describe("validateBooking", () => {
  const ok = { name: "Ada", email: "ada@example.com", preferredTime: "Mon 3pm", reason: "chat" };

  it("accepts a valid booking", () => {
    expect(validateBooking(ok)).toBeNull();
  });

  it("requires the core fields", () => {
    expect(validateBooking({ ...ok, name: "" })).toMatch(/Missing required/);
  });

  it("rejects a malformed email", () => {
    expect(validateBooking({ ...ok, email: "not-an-email" })).toMatch(/invalid email/);
  });

  it("rejects over-long fields", () => {
    expect(validateBooking({ ...ok, reason: "x".repeat(LIMITS.maxLongField + 1) })).toMatch(/reason too long/);
  });
});
