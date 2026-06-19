/**
 * Pure input-validation helpers for the public API routes. Caps bound the work
 * (and therefore the model/email cost) a single request can trigger, so an
 * attacker can't inflate token usage with giant payloads.
 */

export const LIMITS = {
  maxMessages: 24, // conversation turns accepted per request
  maxMessageChars: 4000, // per-message content length
  maxNameChars: 120,
  maxEmailChars: 200,
  maxShortField: 160, // preferredTime, company
  maxLongField: 2000, // reason, notes
} as const;

export interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

/** Validate the chat payload's messages array. Returns an error string or null. */
export function validateChatMessages(messages: unknown): string | null {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "messages must be a non-empty array";
  }
  if (messages.length > LIMITS.maxMessages) {
    return `too many messages (max ${LIMITS.maxMessages})`;
  }
  for (const m of messages as IncomingMessage[]) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) {
      return "each message needs a valid role";
    }
    if (typeof m.content !== "string" || m.content.length === 0) {
      return "each message needs non-empty content";
    }
    if (m.content.length > LIMITS.maxMessageChars) {
      return `message too long (max ${LIMITS.maxMessageChars} chars)`;
    }
  }
  return null;
}

// Pragmatic email shape check — not RFC-perfect, just rejects obvious junk.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface BookingFields {
  name?: unknown;
  email?: unknown;
  preferredTime?: unknown;
  reason?: unknown;
  company?: unknown;
  notes?: unknown;
}

/** Validate a booking-request payload. Returns an error string or null. */
export function validateBooking(b: BookingFields): string | null {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(b.name);
  const email = str(b.email);
  const preferredTime = str(b.preferredTime);
  const reason = str(b.reason);

  if (!name || !email || !preferredTime || !reason) {
    return "Missing required fields";
  }
  if (name.length > LIMITS.maxNameChars) return "name too long";
  if (email.length > LIMITS.maxEmailChars || !EMAIL_RE.test(email)) {
    return "invalid email";
  }
  if (preferredTime.length > LIMITS.maxShortField) return "preferredTime too long";
  if (reason.length > LIMITS.maxLongField) return "reason too long";
  if (str(b.company).length > LIMITS.maxShortField) return "company too long";
  if (str(b.notes).length > LIMITS.maxLongField) return "notes too long";
  return null;
}
