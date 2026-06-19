import { NextRequest, NextResponse } from "next/server";
import { createBookingRequest, resolveBaseUrl } from "@/lib/booking";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { validateBooking } from "@/lib/api-validation";

export async function POST(req: NextRequest) {
  try {
    // Tight per-IP limit: each booking sends a real email + DB insert.
    const rl = await rateLimit("booking", clientIp(req), 3, 3600);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many booking requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }

    const { name, email, preferredTime, reason, company, notes } = await req.json() as {
      name: string;
      email: string;
      preferredTime: string;
      reason: string;
      company?: string;
      notes?: string;
    };

    const invalid = validateBooking({ name, email, preferredTime, reason, company, notes });
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    await createBookingRequest({
      name,
      email,
      preferredTime,
      reason,
      company,
      notes,
      baseUrl: resolveBaseUrl(req.nextUrl.origin),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/booking/request]", err);
    return NextResponse.json({ error: "Failed to submit booking request" }, { status: 500 });
  }
}
