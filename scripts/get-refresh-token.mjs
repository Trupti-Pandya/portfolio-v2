/**
 * One-command Google OAuth re-authorisation.
 *
 *   node scripts/get-refresh-token.mjs
 *
 * Opens Google's consent screen, captures the authorisation code on a local
 * loopback server, exchanges it for a *refresh token*, verifies which account
 * you authorised as, and writes GOOGLE_REFRESH_TOKEN back into .env.local.
 *
 * One-time prerequisite (Google Cloud Console → your OAuth client):
 *   Add this to "Authorised redirect URIs":  http://localhost:53682/oauth2callback
 */
import { readFileSync, writeFileSync } from "fs";
import { createServer } from "http";
import { exec } from "child_process";
import { google } from "googleapis";

const ENV_PATH = new URL("../.env.local", import.meta.url);
const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const EXPECTED_ACCOUNT = "pandyatrupti531@gmail.com"; // the mailbox you chose

// Scopes the booking flow needs: send mail, manage calendar events, identify account.
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

// ── load .env.local ──
const envText = readFileSync(ENV_PATH, "utf-8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing from .env.local");
  process.exit(1);
}

const oauth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const authUrl = oauth.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // force a fresh refresh_token every time
  scope: SCOPES,
});

function writeRefreshToken(token) {
  let text = readFileSync(ENV_PATH, "utf-8");
  if (/^GOOGLE_REFRESH_TOKEN=.*$/m.test(text)) {
    text = text.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, `GOOGLE_REFRESH_TOKEN=${token}`);
  } else {
    text = text.trimEnd() + `\nGOOGLE_REFRESH_TOKEN=${token}\n`;
  }
  writeFileSync(ENV_PATH, text);
}

const server = createServer(async (req, res) => {
  if (!req.url.startsWith("/oauth2callback")) {
    res.writeHead(404).end();
    return;
  }
  const code = new URL(req.url, REDIRECT_URI).searchParams.get("code");
  const done = (msg) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<body style="font-family:sans-serif;background:#0a0a0d;color:#b8ff57;padding:40px">${msg}</body>`);
  };
  try {
    const { tokens } = await oauth.getToken(code);
    if (!tokens.refresh_token) {
      done("⚠️ No refresh token returned. Revoke the app's access at https://myaccount.google.com/permissions and run this script again.");
      console.error("\n⚠️  Google did not return a refresh_token. Revoke prior access and retry.");
      server.close();
      return;
    }

    oauth.setCredentials(tokens);
    const me = await google.oauth2("v2").userinfo.get({ auth: oauth });
    const account = me.data.email;

    writeRefreshToken(tokens.refresh_token);

    if (account?.toLowerCase() !== EXPECTED_ACCOUNT.toLowerCase()) {
      done(`⚠️ You authorised as <b>${account}</b>, but the mailbox should be <b>${EXPECTED_ACCOUNT}</b>.<br>Token was saved anyway — re-run and pick the right account, OR update GMAIL_FROM to ${account}.`);
      console.warn(`\n⚠️  Authorised as ${account}, expected ${EXPECTED_ACCOUNT}. Token saved, but accounts differ.`);
    } else {
      done("✅ Success! Refresh token saved to .env.local. You can close this tab and return to the terminal.");
      console.log(`\n✅ New refresh token saved to .env.local (account: ${account}).`);
    }
  } catch (err) {
    done("❌ Token exchange failed: " + err.message);
    console.error("\n❌ Token exchange failed:", err.message);
  } finally {
    setTimeout(() => server.close(), 500);
  }
});

server.listen(PORT, () => {
  console.log("\n  Opening Google consent screen in your browser…");
  console.log(`  If it doesn't open, paste this URL manually:\n\n  ${authUrl}\n`);
  console.log(`  ➜ Sign in as ${EXPECTED_ACCOUNT} and approve.\n`);
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${opener} "${authUrl}"`);
});
