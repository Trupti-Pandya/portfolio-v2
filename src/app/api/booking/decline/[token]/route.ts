import { NextRequest } from "next/server";
import { sendBookingDeclineToVisitor } from "@/lib/gmail";
import { getDb } from "@/lib/db";
import { resultPage } from "@/lib/booking-page";

function htmlPage(title: string, body: string, accent = "#c3f260") {
  return new Response(resultPage(title, body, accent), {
    headers: { "Content-Type": "text/html" },
  });
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
      SELECT visitor_name, visitor_email, status
      FROM pending_bookings
      WHERE token = ${token}
      LIMIT 1
    `;

    const booking = results[0] as {
      visitor_name: string;
      visitor_email: string;
      status: string;
    } | undefined;

    if (!booking) {
      return htmlPage("Not found", "<p>This booking request could not be found.</p>", "#ff8b6b");
    }

    if (booking.status !== "pending") {
      return htmlPage("Already handled", `<p>This request has already been <strong style="color:#fff">${booking.status}</strong>.</p>`, "#ff8b6b");
    }

    await sendBookingDeclineToVisitor({
      visitorName: booking.visitor_name,
      visitorEmail: booking.visitor_email,
    });

    await sql`
      UPDATE pending_bookings
      SET status = 'declined'
      WHERE token = ${token}
    `;

    return htmlPage(
      "Declined",
      `<p>A polite decline note has been emailed to <strong style="color:#fff">${booking.visitor_email}</strong>.</p>`
    );
  } catch (err) {
    console.error("[/api/booking/decline]", err);
    return htmlPage("Something went wrong", "<p>We couldn&rsquo;t complete this action. Please try the link again.</p>", "#ff8b6b");
  }
}
