import { getGmailClient } from "./google-auth";

function toBase64Url(str: string) {
  return Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// RFC 2047 encoded-word so non-ASCII (emoji, accents) render correctly in the
// Subject header instead of becoming mojibake like "Ã¢ÂœÂ…".
function encodeHeader(value: string) {
  // Pure ASCII needs no encoding.
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}

function buildRawEmail({
  to,
  from,
  subject,
  html,
}: {
  to: string;
  from: string;
  subject: string;
  html: string;
}) {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(html, "utf-8").toString("base64"),
  ].join("\r\n");
  return toBase64Url(message);
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const gmail = getGmailClient();
  const address = process.env.GMAIL_FROM ?? "pandyatrupti531@gmail.com";
  // Friendly, ASCII-safe display name so the inbox shows a real sender.
  const from = `Trupti Pandya <${address}>`;
  const raw = buildRawEmail({ to, from, subject, html });
  await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
}

/* ──────────────────────────────────────────────────────────────────────────
   Shared email theme — clean, on-brand (terminal/lime), and email-client safe.
   Tables + inline styles only; no fl/grid (Gmail strips them).
   ────────────────────────────────────────────────────────────────────────── */

const ACCENT = "#c3f260";
const BG = "#060608";
const CARD = "#0c0c11";
const BORDER = "rgba(195,242,96,0.18)";
const MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function shell(opts: { preheader?: string; eyebrow: string; body: string }) {
  const { preheader = "", eyebrow, body } = opts;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};">
  <span style="display:none;font-size:1px;color:${BG};opacity:0;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- brand -->
        <tr><td style="padding:0 4px 18px;">
          <span style="font-family:${MONO};font-size:11px;letter-spacing:0.32em;color:${ACCENT};text-transform:uppercase;">TRUPTI&nbsp;PANDYA</span>
          <span style="font-family:${MONO};font-size:11px;letter-spacing:0.14em;color:rgba(255,255,255,0.32);"> &nbsp;//&nbsp;${eyebrow}</span>
        </td></tr>
        <!-- card -->
        <tr><td style="background:${CARD};border:1px solid ${BORDER};border-top:2px solid ${ACCENT};padding:34px 32px;">
          ${body}
        </td></tr>
        <!-- footer -->
        <tr><td style="padding:18px 4px 0;">
          <p style="margin:0;font-family:${MONO};font-size:11px;line-height:1.6;color:rgba(255,255,255,0.28);">
            Sent by Trupti&rsquo;s portfolio AI assistant.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-family:${MONO};font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(195,242,96,0.55);vertical-align:top;width:130px;white-space:nowrap;">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-family:${SANS};font-size:15px;color:#ffffff;vertical-align:top;">${value}</td>
  </tr>`;
}

// A bulletproof, table-based button that renders consistently across clients.
function button(href: string, label: string, opts: { filled?: boolean } = {}) {
  const filled = opts.filled !== false;
  const bg = filled ? ACCENT : "transparent";
  const color = filled ? "#060608" : ACCENT;
  const border = filled ? ACCENT : "rgba(195,242,96,0.45)";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-block;"><tr><td style="background:${bg};border:1px solid ${border};">
    <a href="${href}" style="display:inline-block;padding:12px 26px;font-family:${MONO};font-size:13px;font-weight:600;letter-spacing:0.04em;color:${color};text-decoration:none;">${label}</a>
  </td></tr></table>`;
}

export async function sendBookingRequestToTrupti({
  visitorName,
  visitorEmail,
  preferredTime,
  reason,
  approveUrl,
  declineUrl,
}: {
  visitorName: string;
  visitorEmail: string;
  preferredTime: string;
  reason: string;
  approveUrl: string;
  declineUrl: string;
}) {
  const body = `
    <h1 style="margin:0 0 6px;font-family:${SANS};font-size:21px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;">New call request</h1>
    <p style="margin:0 0 24px;font-family:${SANS};font-size:15px;line-height:1.55;color:rgba(255,255,255,0.6);">Someone reached out through your portfolio assistant to schedule a call.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      ${detailRow("Name", visitorName)}
      ${detailRow("Email", `<a href="mailto:${visitorEmail}" style="color:${ACCENT};text-decoration:none;">${visitorEmail}</a>`)}
      ${detailRow("Requested", preferredTime)}
      ${detailRow("Reason", reason)}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:12px;">${button(approveUrl, "✓ Approve")}</td>
      <td>${button(declineUrl, "✕ Decline", { filled: false })}</td>
    </tr></table>
    <p style="margin:22px 0 0;font-family:${MONO};font-size:11px;color:rgba(255,255,255,0.3);">These approval links are single-use.</p>
  `;
  await sendEmail({
    to: process.env.GMAIL_FROM ?? "pandyatrupti531@gmail.com",
    subject: `New call request from ${visitorName}`,
    html: shell({ eyebrow: "BOOKING", preheader: `${visitorName} wants to schedule a call — ${preferredTime}`, body }),
  });
}

export async function sendBookingConfirmationToVisitor({
  visitorName,
  visitorEmail,
  meetLink,
  eventTime,
}: {
  visitorName: string;
  visitorEmail: string;
  meetLink: string;
  eventTime: string;
}) {
  const body = `
    <div style="font-family:${MONO};font-size:11px;letter-spacing:0.14em;color:${ACCENT};text-transform:uppercase;margin:0 0 10px;">&#10003;&nbsp;Confirmed</div>
    <h1 style="margin:0 0 6px;font-family:${SANS};font-size:21px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;">Your call is confirmed</h1>
    <p style="margin:0 0 24px;font-family:${SANS};font-size:15px;line-height:1.55;color:rgba(255,255,255,0.6);">Hi ${visitorName}, Trupti has approved your request. Here are the details:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      ${detailRow("When", eventTime)}
      ${detailRow("Google Meet", `<a href="${meetLink}" style="color:${ACCENT};text-decoration:none;word-break:break-all;">${meetLink}</a>`)}
    </table>
    ${button(meetLink, "Join Google Meet")}
    <p style="margin:22px 0 0;font-family:${MONO};font-size:11px;line-height:1.6;color:rgba(255,255,255,0.3);">A Google Calendar invite is on its way to this address. Looking forward to speaking with you.</p>
  `;
  await sendEmail({
    to: visitorEmail,
    subject: "Your call with Trupti Pandya is confirmed",
    html: shell({ eyebrow: "BOOKING", preheader: `Confirmed for ${eventTime}`, body }),
  });
}

export async function sendBookingDeclineToVisitor({
  visitorName,
  visitorEmail,
}: {
  visitorName: string;
  visitorEmail: string;
}) {
  const body = `
    <h1 style="margin:0 0 6px;font-family:${SANS};font-size:21px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;">About your call request</h1>
    <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.6;color:rgba(255,255,255,0.72);">Hi ${visitorName}, thank you for reaching out.</p>
    <p style="margin:0 0 24px;font-family:${SANS};font-size:15px;line-height:1.6;color:rgba(255,255,255,0.72);">Unfortunately Trupti isn&rsquo;t able to take a call at the requested time. You&rsquo;re very welcome to email her directly to find a slot that works for you both.</p>
    ${button("mailto:truptipandya21901@gmail.com?subject=Hello%20Trupti", "Email Trupti")}
  `;
  await sendEmail({
    to: visitorEmail,
    subject: "Re: Your call request with Trupti Pandya",
    html: shell({ eyebrow: "BOOKING", preheader: "A note about your call request", body }),
  });
}
