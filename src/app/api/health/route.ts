import { NextResponse } from "next/server";
import { rateLimitBackend } from "@/lib/rate-limit";

/**
 * Lightweight liveness + config probe for the smoke test. Reports only booleans
 * about which integrations are configured — never the secret values themselves.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      time: new Date().toISOString(),
      rateLimitBackend,
      providers: {
        azure: !!process.env.AZURE_OPENAI_KEY,
        aws: !!process.env.AWS_ACCESS_KEY_ID,
        gcp: !!process.env.GCP_GEMINI_KEY,
      },
      services: {
        database: !!process.env.DATABASE_URL,
        supabase: !!process.env.SUPABASE_URL,
        gmail: !!process.env.GOOGLE_REFRESH_TOKEN,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
