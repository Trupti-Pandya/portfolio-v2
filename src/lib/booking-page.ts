/**
 * Branded HTML result page shown after Trupti clicks Approve / Decline.
 * Mirrors the portfolio's terminal/lime aesthetic.
 */
const BG = "#060608";
const CARD = "#0c0c11";
const MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function resultPage(title: string, body: string, accent = "#c3f260"): string {
  const accentSoft = "rgba(195,242,96,0.18)";
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;background:
      radial-gradient(900px 500px at 50% -10%, rgba(195,242,96,0.06), transparent 70%), ${BG};
    color:#fff;font-family:${SANS};
    display:flex;align-items:center;justify-content:center;padding:24px;}
  .wrap{width:100%;max-width:460px}
  .brand{font-family:${MONO};font-size:11px;letter-spacing:0.32em;color:${accent};
    text-transform:uppercase;margin:0 0 16px;padding-left:2px}
  .brand span{color:rgba(255,255,255,0.32);letter-spacing:0.14em}
  .card{background:${CARD};border:1px solid ${accentSoft};border-top:2px solid ${accent};
    padding:38px 34px;text-align:center}
  .mark{width:46px;height:46px;line-height:46px;margin:0 auto 18px;border:1px solid ${accent};
    color:${accent};font-size:20px;border-radius:50%}
  h1{margin:0 0 10px;font-size:22px;font-weight:600;letter-spacing:-0.01em}
  p{margin:0 0 8px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.62)}
  a{color:${accent}}
  .foot{margin:16px 2px 0;font-family:${MONO};font-size:11px;color:rgba(255,255,255,0.28);text-align:center}
</style></head>
<body><div class="wrap">
  <div class="brand">TRUPTI&nbsp;PANDYA <span>// PORTFOLIO ASSISTANT</span></div>
  <div class="card">
    <h1>${title}</h1>
    ${body}
  </div>
  <p class="foot">You can safely close this tab.</p>
</div></body></html>`;
}
