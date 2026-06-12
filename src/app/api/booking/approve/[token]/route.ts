import { NextRequest } from "next/server";
import { getCalendarClient } from "@/lib/google-auth";
import { sendBookingConfirmationToVisitor } from "@/lib/gmail";
import { getDb } from "@/lib/db";
import { resultPage } from "@/lib/booking-page";

function htmlPage(title: string, body: string, accent = "#c3f260") {
  return new Response(resultPage(title, body, accent), {
    headers: { "Content-Type": "text/html" },
  });
}

function parseEventTime(raw: string): { start: string; end: string } {
  // Best-effort parse — default to 24h from now if unparseable
  const parsed = new Date(raw);
  const start = isNaN(parsed.getTime()) ? new Date(Date.now() + 86400000) : parsed;
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const sql = getDb();
    if (!sql) {
      return htmlPage("Configuration Error", "<p>Database connection is not configured.</p>");
    }

    const results = await sql`
      SELECT visitor_name, visitor_email, preferred_time, reason, status
      FROM pending_bookings
      WHERE token = ${token}
      LIMIT 1
    `;

    const booking = results[0] as {
      visitor_name: string;
      visitor_email: string;
      preferred_time: string;
      reason: string;
      status: string;
    } | undefined;

    if (!booking) {
      return htmlPage("Not found", "<p>This booking request could not be found. It may have already been handled.</p>", "#ff8b6b");
    }

    if (booking.status !== "pending") {
      return htmlPage("Already handled", `<p>This request has already been <strong style="color:#fff">${booking.status}</strong>.</p>`, "#ff8b6b");
    }

    // Create Google Calendar event with Meet link
    const calendar = getCalendarClient();
    const { start, end } = parseEventTime(booking.preferred_time);

    const event = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Call with ${booking.visitor_name} — Trupti Pandya`,
        description: `Reason: ${booking.reason}\n\nBooked via portfolio assistant.`,
        start: { dateTime: start, timeZone: "Europe/London" },
        end: { dateTime: end, timeZone: "Europe/London" },
        attendees: [
          { email: booking.visitor_email },
          { email: process.env.GMAIL_FROM ?? "pandyatrupti531@gmail.com" },
        ],
        conferenceData: {
          createRequest: { requestId: token },
        },
      },
    });

    const meetLink =
      event.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ??
      event.data.htmlLink ??
      "";

    const eventTime = new Date(start).toLocaleString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    });

    // Email confirmation to visitor
    await sendBookingConfirmationToVisitor({
      visitorName: booking.visitor_name,
      visitorEmail: booking.visitor_email,
      meetLink,
      eventTime,
    });

    // Mark as approved in Neon
    await sql`
      UPDATE pending_bookings
      SET status = 'approved'
      WHERE token = ${token}
    `;

    return htmlPage(
      "Approved",
      `<div class="mark">&#10003;</div>
       <p>A calendar invite has been created and a confirmation was emailed to <strong style="color:#fff">${booking.visitor_email}</strong>.</p>
       ${meetLink ? `<p style="margin-top:18px"><a href="${meetLink}" target="_blank" rel="noopener">Open the Google Meet link &rarr;</a></p>` : ""}`
    );
  } catch (err) {
    console.error("[/api/booking/approve]", err);
    return htmlPage("Something went wrong", "<p>We couldn&rsquo;t complete the approval. Please try the link again, or contact Trupti directly.</p>", "#ff8b6b");
  }
}
