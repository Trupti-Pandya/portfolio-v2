/**
 * Diagnostic script to test each component of the booking system independently.
 * Run with: node --env-file=.env.local scripts/debug-booking.mjs
 */

import { neon } from "@neondatabase/serverless";
import { google } from "googleapis";

const PASS = "✅";
const FAIL = "❌";
const WARN = "⚠️";

console.log("\n========================================");
console.log("  BOOKING SYSTEM DIAGNOSTIC");
console.log("========================================\n");

// ── 1. Check environment variables ──
console.log("── Step 1: Checking environment variables ──\n");

const envChecks = [
  ["DATABASE_URL", process.env.DATABASE_URL],
  ["GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID],
  ["GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET],
  ["GOOGLE_REFRESH_TOKEN", process.env.GOOGLE_REFRESH_TOKEN],
  ["GMAIL_FROM", process.env.GMAIL_FROM],
  ["GOOGLE_CALENDAR_ID", process.env.GOOGLE_CALENDAR_ID],
  ["NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL],
];

let envOk = true;
for (const [name, value] of envChecks) {
  if (value && value.trim().length > 0) {
    const masked = value.length > 10 ? value.slice(0, 8) + "..." + value.slice(-4) : value;
    console.log(`  ${PASS} ${name} = ${masked}`);
  } else {
    console.log(`  ${FAIL} ${name} is MISSING or EMPTY`);
    envOk = false;
  }
}

if (!envOk) {
  console.log(`\n${FAIL} Some environment variables are missing. Fix them before proceeding.\n`);
  process.exit(1);
}
console.log(`\n${PASS} All environment variables are set.\n`);

// ── 2. Test Neon database connection ──
console.log("── Step 2: Testing Neon database connection ──\n");

try {
  const sql = neon(process.env.DATABASE_URL);
  const result = await sql`SELECT NOW() as current_time`;
  console.log(`  ${PASS} Connected to Neon successfully. Server time: ${result[0].current_time}`);

  // Check if table exists
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'pending_bookings'
  `;
  if (tables.length > 0) {
    console.log(`  ${PASS} Table 'pending_bookings' exists.`);

    // Check row count
    const count = await sql`SELECT COUNT(*) as cnt FROM pending_bookings`;
    console.log(`  📊 Current bookings in table: ${count[0].cnt}`);

    // Show recent bookings
    const recent = await sql`SELECT token, visitor_name, visitor_email, status, created_at FROM pending_bookings ORDER BY created_at DESC LIMIT 3`;
    if (recent.length > 0) {
      console.log(`  📋 Recent bookings:`);
      for (const row of recent) {
        console.log(`     - ${row.visitor_name} (${row.visitor_email}) — status: ${row.status} — ${row.created_at}`);
      }
    }
  } else {
    console.log(`  ${FAIL} Table 'pending_bookings' does NOT exist! You need to create it in the Neon SQL Editor.`);
  }
} catch (err) {
  console.log(`  ${FAIL} Neon connection failed: ${err.message}`);
}

console.log();

// ── 3. Test Google OAuth credentials ──
console.log("── Step 3: Testing Google OAuth credentials ──\n");

let oauthClient;
try {
  oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauthClient.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  // Try to get a fresh access token
  const { token } = await oauthClient.getAccessToken();
  if (token) {
    console.log(`  ${PASS} OAuth access token obtained successfully (token starts with: ${token.slice(0, 12)}...)`);
  } else {
    console.log(`  ${FAIL} Failed to obtain access token — returned null.`);
  }
} catch (err) {
  console.log(`  ${FAIL} OAuth authentication failed: ${err.message}`);
  if (err.message.includes("invalid_grant")) {
    console.log(`  ${WARN} HINT: Your refresh token has expired or was revoked. Re-generate it on the OAuth Playground.`);
  } else if (err.message.includes("unauthorized_client")) {
    console.log(`  ${WARN} HINT: The Client ID/Secret do not match the ones used to generate the refresh token.`);
  } else if (err.message.includes("invalid_client")) {
    console.log(`  ${WARN} HINT: The Client ID or Client Secret is incorrect.`);
  }
  console.log();
  process.exit(1);
}

console.log();

// ── 4. Test Gmail API ──
console.log("── Step 4: Testing Gmail API (sending a test email) ──\n");

try {
  const gmail = google.gmail({ version: "v1", auth: oauthClient });

  // Identify the authorised account via the userinfo endpoint. (We do NOT call
  // gmail.users.getProfile here — that needs a read scope the app doesn't use;
  // the app only holds gmail.send, so getProfile would 403 even when sending works.)
  try {
    const me = await google.oauth2("v2").userinfo.get({ auth: oauthClient });
    console.log(`  ${PASS} Authorised as: ${me.data.email}`);
    if (me.data.email !== process.env.GMAIL_FROM) {
      console.log(`  ${WARN} WARNING: GMAIL_FROM (${process.env.GMAIL_FROM}) does not match authorised email (${me.data.email}).`);
      console.log(`  ${WARN} Emails will be sent FROM ${me.data.email}, not ${process.env.GMAIL_FROM}.`);
    }
  } catch {
    console.log(`  ${WARN} Could not read account identity (userinfo). Continuing to the real send test.`);
  }

  // Send a real test email to yourself — this is the actual operation the app uses
  const testSubject = `🧪 Portfolio Booking Test — ${new Date().toLocaleTimeString()}`;
  const testHtml = `<div style="font-family:sans-serif;padding:20px;background:#0a0a0d;color:#b8ff57;border:1px solid rgba(184,255,87,0.18)">
    <h2>Test email from your portfolio booking system</h2>
    <p style="color:#ccc">If you're reading this, your Gmail API integration is working correctly!</p>
    <p style="color:rgba(255,255,255,0.3);font-size:11px">Sent at ${new Date().toISOString()}</p>
  </div>`;

  const raw = Buffer.from(
    `From: ${process.env.GMAIL_FROM}\r\nTo: ${process.env.GMAIL_FROM}\r\nSubject: ${testSubject}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${testHtml}`
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
  console.log(`  ${PASS} Test email sent successfully to ${process.env.GMAIL_FROM}!`);
  console.log(`  📬 Check your inbox for subject: "${testSubject}"`);
} catch (err) {
  console.log(`  ${FAIL} Gmail API failed: ${err.message}`);
  if (err.code === 403) {
    console.log(`  ${WARN} HINT: The Gmail API may not be enabled. Go to Google Cloud Console → APIs & Services → Library → search "Gmail API" → Enable.`);
  } else if (err.code === 401) {
    console.log(`  ${WARN} HINT: Authentication failed. Your refresh token may be invalid or expired.`);
  }
  if (err.errors) {
    for (const e of err.errors) {
      console.log(`     Detail: ${e.message} (reason: ${e.reason})`);
    }
  }
}

console.log();

// ── 5. Test Google Calendar API ──
console.log("── Step 5: Testing Google Calendar API ──\n");

try {
  const calendar = google.calendar({ version: "v3", auth: oauthClient });
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

  // Insert a real (then immediately delete) event with a Meet link — this is the
  // exact operation the approval route performs. We avoid calendars.get because
  // it needs a read scope the app doesn't request (app only holds calendar.events).
  const start = new Date(Date.now() + 86400000);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const ev = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    requestBody: {
      summary: "🧪 Booking diagnostic — auto-deleted",
      start: { dateTime: start.toISOString(), timeZone: "Europe/London" },
      end: { dateTime: end.toISOString(), timeZone: "Europe/London" },
      conferenceData: { createRequest: { requestId: `diag-${Date.now()}` } },
    },
  });
  const meet = ev.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri;
  console.log(`  ${PASS} Calendar event created on "${calendarId}" with Meet link: ${meet ?? "(none)"}`);
  await calendar.events.delete({ calendarId, eventId: ev.data.id });
  console.log(`  ${PASS} Test event deleted.`);
} catch (err) {
  console.log(`  ${FAIL} Calendar API failed: ${err.message}`);
  if (err.code === 403) {
    console.log(`  ${WARN} HINT: The Google Calendar API may not be enabled. Go to Google Cloud Console → APIs & Services → Library → search "Google Calendar API" → Enable.`);
  }
  if (err.errors) {
    for (const e of err.errors) {
      console.log(`     Detail: ${e.message} (reason: ${e.reason})`);
    }
  }
}

console.log("\n========================================");
console.log("  DIAGNOSTIC COMPLETE");
console.log("========================================\n");
