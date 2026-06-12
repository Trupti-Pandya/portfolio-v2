import { NextRequest, NextResponse } from "next/server";
import { createBookingRequest, resolveBaseUrl } from "@/lib/booking";

export async function POST(req: NextRequest) {
  try {
    const { name, email, preferredTime, reason } = await req.json() as {
      name: string;
      email: string;
      preferredTime: string;
      reason: string;
    };

    if (!name || !email || !preferredTime || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await createBookingRequest({
      name,
      email,
      preferredTime,
      reason,
      baseUrl: resolveBaseUrl(req.nextUrl.origin),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/booking/request]", err);
    return NextResponse.json({ error: "Failed to submit booking request" }, { status: 500 });
  }
}
