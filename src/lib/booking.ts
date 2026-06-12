import { randomUUID } from "crypto";
import { sendBookingRequestToTrupti } from "@/lib/gmail";
import { getDb } from "@/lib/db";

export interface BookingRequestInput {
  name: string;
  email: string;
  preferredTime: string;
  reason: string;
  /** Public origin of the deployment, used to build approve/decline links. */
  baseUrl: string;
}

/**
 * Persist a pending booking and email Trupti the approve/decline links.
 * Called directly by both the chat stream and the /api/booking/request route,
 * so there is no fragile server-to-server HTTP hop.
 */
export async function createBookingRequest({
  name,
  email,
  preferredTime,
  reason,
  baseUrl,
}: BookingRequestInput): Promise<void> {
  const token = randomUUID();
  const approveUrl = `${baseUrl}/api/booking/approve/${token}`;
  const declineUrl = `${baseUrl}/api/booking/decline/${token}`;

  const sql = getDb();
  if (sql) {
    await sql`
      INSERT INTO pending_bookings (id, token, visitor_name, visitor_email, preferred_time, reason, status)
      VALUES (${randomUUID()}, ${token}, ${name}, ${email}, ${preferredTime}, ${reason}, 'pending')
    `;
  }

  await sendBookingRequestToTrupti({
    visitorName: name,
    visitorEmail: email,
    preferredTime,
    reason,
    approveUrl,
    declineUrl,
  });
}

/**
 * Resolve the public base URL for building emailed links. Prefers an explicitly
 * configured non-localhost NEXT_PUBLIC_APP_URL; otherwise falls back to the
 * origin of the incoming request (correct on Vercel and in local dev alike).
 */
export function resolveBaseUrl(requestOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured && !configured.includes("localhost")) {
    return configured.replace(/\/$/, "");
  }
  return requestOrigin.replace(/\/$/, "");
}
