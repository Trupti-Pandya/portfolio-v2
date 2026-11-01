import type { Metadata } from "next";
import styles from "./audit.module.css";

export const metadata: Metadata = {
  title: "Site audit",
};

type Severity = "high" | "med" | "low";

type Finding = {
  id: string;
  severity: Severity;
  area: string;
  title: string;
  evidence: string;
  fix: string;
};

type Score = { label: string; mobile: string; desktop: string; verdict: "good" | "fair" | "poor" };

const AUDITED = "1 Nov 2026";
const URL_AUDITED = "https://www.truptipandya.dev/";

const SCORES: Score[] = [
  { label: "Performance", mobile: "40", desktop: "92", verdict: "poor" },
  { label: "Accessibility", mobile: "100", desktop: "100", verdict: "fair" },
  { label: "Best practices", mobile: "100", desktop: "100", verdict: "good" },
  { label: "SEO", mobile: "100", desktop: "100", verdict: "fair" },
];

const VITALS: { metric: string; mobile: string; desktop: string; target: string }[] = [
  { metric: "Largest paint (LCP)", mobile: "7.4 s", desktop: "1.6 s", target: "≤ 2.5 s" },
  { metric: "Blocking time (TBT)", mobile: "3,040 ms", desktop: "120 ms", target: "≤ 200 ms" },
  { metric: "Layout shift (CLS)", mobile: "0", desktop: "0.021", target: "≤ 0.1" },
  { metric: "First paint (FCP)", mobile: "3.2 s", desktop: "0.9 s", target: "≤ 1.8 s" },
  { metric: "Interactive (TTI)", mobile: "9.1 s", desktop: "1.7 s", target: "≤ 3.8 s" },
  { metric: "Page weight", mobile: "1,681 KiB", desktop: "1,681 KiB", target: "< 500 KiB" },
];

const CHECKS: { label: string; value: string; verdict: "good" | "fair" | "poor" }[] = [
  { label: "Broken links", value: "0 of 14 checked", verdict: "good" },
  { label: "Console errors on load", value: "0 (1 warning when chat opens)", verdict: "good" },
  { label: "Security headers", value: "1 of 6 (HSTS only)", verdict: "poor" },
  { label: "Canonical host", value: "Points at apex, site serves www", verdict: "poor" },
  { label: "Structured data (JSON-LD)", value: "Person, ProfilePage, WebSite, ItemList", verdict: "good" },
  { label: "Reduced-motion support", value: "Yes (globals.css)", verdict: "good" },
];

const TOP5 = ["perf-ascii", "canonical", "sec-headers", "touch-text", "landmarks"];

const FINDINGS: Finding[] = [
  {
    id: "perf-ascii",
    severity: "high",
    area: "Performance",
    title: "Mobile performance is 40/100: the page takes 9 s to become usable on a phone",
    evidence:
      "Lighthouse mobile: LCP 7.4 s, TBT 3,040 ms, Time to Interactive 9.1 s. One JavaScript chunk spends 3.3 s of main-thread time. The hero and the chat background both load /image.png (2048×1385 PNG, 1,312 KiB = 78% of the whole page) and turn it into ASCII art in the browser (InteractiveTerminal.tsx:211, ChatWidget.tsx:396). The ASCII conversion is the likely cause of the blocking time; a performance profile would confirm it.",
    fix:
      "Generate the ASCII art once at build time and ship it as static text or SVG, or at least ship a small WebP (about 250 px wide on mobile, under 60 KiB). Only build the chat background when the chat is opened.",
  },
  {
    id: "canonical",
    severity: "high",
    area: "SEO",
    title: "Canonical URL, sitemap, Open Graph and JSON-LD all point at a URL that redirects",
    evidence:
      "Live <link rel=canonical> is https://truptipandya.dev, og:url and og:image use the apex, sitemap.xml and robots.txt (Sitemap and Host lines) use the apex. Vercel answers the apex with HTTP 308 to https://www.truptipandya.dev/. Source: src/lib/site.ts defaults SITE_URL to the apex.",
    fix:
      "Pick one host. Simplest: set NEXT_PUBLIC_SITE_URL=https://www.truptipandya.dev in Vercel (or change the default in site.ts) and update the e2e canonical test. Alternatively make the apex primary in Vercel Domains. Do not add host redirects in next.config (that caused a redirect loop before).",
  },
  {
    id: "sec-headers",
    severity: "high",
    area: "Security",
    title: "Only one of six standard security headers is sent",
    evidence:
      "Response headers for / include Strict-Transport-Security (max-age 2 years, no includeSubDomains). Missing: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options or frame-ancestors, Referrer-Policy, Permissions-Policy. The page can be framed by any site.",
    fix:
      "Add a headers() block in next.config.ts (headers only, no redirects) with X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy (camera=(), microphone=(), geolocation=()), frame-ancestors 'none', then a Content-Security-Policy, first in report-only mode.",
  },
  {
    id: "touch-text",
    severity: "med",
    area: "Mobile UI",
    title: "Touch targets under 44 px and 161 pieces of text under 12 px at 390 px wide",
    evidence:
      "Measured at 390×844: menu button 34×33, chat button 145×40, chat Send 26×26, AI provider selector 176×23, chat text box 21 px tall. 161 text elements render at 9 to 11 px (stat labels, card meta lines, 'Verify ↗', chat header).",
    fix:
      "Give every tappable control at least 44×44 px (padding, not a bigger icon). Set a 12 px floor for mono labels and 14 px for anything a visitor needs to read.",
  },
  {
    id: "landmarks",
    severity: "med",
    area: "Accessibility",
    title: "No main, header or footer landmarks and no skip link",
    evidence:
      "The live DOM has one <nav> and zero <main>, <header> or <footer> elements, and no 'skip to content' link. Lighthouse scores accessibility 100 because it does not require these, but screen-reader users cannot jump to the content.",
    fix:
      "Wrap page content in <main id=\"main\">, the top bar in <header>, the contact block in <footer>, and add a visually hidden skip link as the first focusable element.",
  },
  {
    id: "chat-a11y",
    severity: "med",
    area: "Chat widget",
    title: "Chat input has no label, and the open button is hidden from screen readers while focused",
    evidence:
      "The chat textarea has only a placeholder, no <label> or aria-label. Opening the chat logs a browser warning: 'Blocked aria-hidden on an element because its descendant retained focus' on .chat-fab. Escape does close the dialog (good). The header text truncates to 'gpt-4.1-mini · …' at 390 px, and the 9 px '// pa.assistant' label at 40% opacity measures about 3.2:1 contrast (AA needs 4.5:1).",
    fix:
      "Add aria-label=\"Message\" to the textarea. Move focus into the dialog before hiding the button, and use the inert attribute instead of aria-hidden. Raise the header label to 12 px and full opacity.",
  },
  {
    id: "fonts",
    severity: "med",
    area: "Performance",
    title: "Fonts are loaded twice and the Google Fonts stylesheet blocks rendering",
    evidence:
      "layout.tsx:82 adds a Google Fonts <link> for Playfair Display, Space Grotesk and JetBrains Mono, while next/font also self-hosts Space Grotesk. The browser shows both copies of Space Grotesk. Lighthouse flags render-blocking CSS and a missing preconnect (about 80 ms on desktop).",
    fix:
      "Load all three families through next/font/google (self-hosted, no extra request) and remove the <link> tag.",
  },
  {
    id: "sitemap",
    severity: "med",
    area: "SEO",
    title: "Sitemap lists in-page anchors as separate pages",
    evidence:
      "sitemap.xml lists /#about, /#skills, /#projects, /#contact as their own URLs. Search engines drop the part after #, so these are duplicates of /.",
    fix: "List only the home page (and the CV PDF if it should be indexed).",
  },
  {
    id: "credentials",
    severity: "med",
    area: "Credentials wall",
    title: "Credentials wall takes about 800 px of scrolling on a phone",
    evidence:
      "At 390 px each of the 5 badges is a full-width card 354×142 px, one per row. The whole card is the link (good, opens in a new tab with noopener).",
    fix:
      "Use a 2-column compact grid on mobile (badge above a short name), or a horizontal scroll strip, so the wall fits in about one screen.",
  },
  {
    id: "tablet-hero",
    severity: "low",
    area: "Tablet layout",
    title: "Tablet portrait hero leaves a large empty band above the name",
    evidence:
      "At 820×1180 the hero is centred in the full viewport height, leaving about 420 px of empty space above 'Trupti Pandya' while the ASCII portrait sits behind the buttons.",
    fix: "Cap the hero height on tablets (for example min(100vh, 900px)) or align its content to the top third.",
  },
  {
    id: "fab-overlap",
    severity: "low",
    area: "Mobile UI",
    title: "Floating chat button covers content at the bottom right",
    evidence:
      "On mobile the 'Chat with AI' button overlaps the SCROLL indicator on the hero and the text of the last visible card while scrolling.",
    fix: "Add bottom padding to the page equal to the button height, or shrink it to an icon button once the visitor scrolls.",
  },
  {
    id: "reticle",
    severity: "low",
    area: "Motion",
    title: "Custom crosshair cursor can sit over controls on narrow desktop windows",
    evidence:
      "The 'X:0297 Y:0808' reticle stayed over the chat Send button after a click in a 390 px desktop window. It is hidden on touch devices (hover: none), so phones are not affected.",
    fix: "Hide the reticle while the chat dialog is open and below 1024 px.",
  },
  {
    id: "contrast",
    severity: "low",
    area: "Color",
    title: "Contrast passes overall; two small exceptions",
    evidence:
      "Lighthouse color-contrast passes on mobile and desktop; body text #f0ede6 on #060608 is about 18:1. Exceptions: the chat header label (see chat finding) and the large year numerals on education cards (#2f2f38 on #0b0b0f, about 1.5:1). The numerals are decorative.",
    fix: "Mark the year numerals aria-hidden so they are clearly decorative, and fix the chat label.",
  },
  {
    id: "js-waste",
    severity: "low",
    area: "Performance",
    title: "58 KiB of unused JavaScript and 14 KiB of legacy polyfills",
    evidence: "Lighthouse unused-javascript and legacy-javascript audits, both form factors.",
    fix: "Lazy-load the chat widget and terminal with next/dynamic; set a modern browserslist.",
  },
  {
    id: "robots-host",
    severity: "low",
    area: "SEO",
    title: "robots.txt uses a non-standard Host line",
    evidence: "robots.txt ends with 'Host: https://truptipandya.dev'. Only Yandex reads Host, and it names the redirecting apex.",
    fix: "Drop the Host line; keep Sitemap pointing at the chosen canonical host.",
  },
  {
    id: "lab-jsonld",
    severity: "low",
    area: "SEO",
    title: "Site-wide JSON-LD is injected on every route, including /lab",
    evidence: "StructuredData sits in the root layout, so preview pages carry the Person schema too. /lab is noindex, so the impact is small.",
    fix: "Render StructuredData from the home page only if more public routes are added.",
  },
];

const SEVERITY_LABEL: Record<Severity, string> = { high: "High", med: "Medium", low: "Low" };

function FindingCard({ f }: { f: Finding }) {
  return (
    <article className={styles.finding} id={f.id}>
      <div className={styles.findingHead}>
        <span className={styles.sev} data-sev={f.severity}>
          {SEVERITY_LABEL[f.severity]}
        </span>
        <span className={styles.area}>{f.area}</span>
      </div>
      <h3 className={styles.findingTitle}>{f.title}</h3>
      <p className={styles.label}>Evidence</p>
      <p className={styles.body}>{f.evidence}</p>
      <p className={styles.label}>Fix</p>
      <p className={styles.body}>{f.fix}</p>
    </article>
  );
}

export default function AuditPage() {
  const top = TOP5.map((id) => FINDINGS.find((f) => f.id === id)).filter(
    (f): f is Finding => Boolean(f),
  );
  const counts = (["high", "med", "low"] as Severity[]).map((s) => ({
    s,
    n: FINDINGS.filter((f) => f.severity === s).length,
  }));

  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Site audit</h1>
      <p className={styles.meta}>
        {URL_AUDITED} · audited {AUDITED} · Lighthouse 12, Playwright at 390 px and 820 px. Report only:
        nothing on the live site was changed.
      </p>

      <section aria-labelledby="scorecard">
        <h2 id="scorecard" className={styles.h2}>
          Scorecard
        </h2>
        <div className={styles.scores}>
          {SCORES.map((s) => (
            <div key={s.label} className={styles.score} data-verdict={s.verdict}>
              <span className={styles.scoreLabel}>{s.label}</span>
              <span className={styles.scoreNums}>
                <span>
                  <b>{s.mobile}</b> mobile
                </span>
                <span>
                  <b>{s.desktop}</b> desktop
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className={styles.note}>
          Accessibility and SEO score 100 in Lighthouse but still have real issues below (landmarks,
          canonical host). Lab data from one run on a simulated phone; field data from Vercel Speed
          Insights was not available to this audit.
        </p>

        <ul className={styles.checks}>
          {CHECKS.map((c) => (
            <li key={c.label} className={styles.check} data-verdict={c.verdict}>
              <span className={styles.checkLabel}>{c.label}</span>
              <span className={styles.checkValue}>{c.value}</span>
            </li>
          ))}
        </ul>

        <p className={styles.counts}>
          {counts.map(({ s, n }) => (
            <span key={s} className={styles.sev} data-sev={s}>
              {n} {SEVERITY_LABEL[s]}
            </span>
          ))}
        </p>
      </section>

      <section aria-labelledby="top5">
        <h2 id="top5" className={styles.h2}>
          Top 5 to fix first
        </h2>
        <ol className={styles.top5}>
          {top.map((f) => (
            <li key={f.id}>
              <a href={`#${f.id}`} className={styles.topLink}>
                <span className={styles.sev} data-sev={f.severity}>
                  {SEVERITY_LABEL[f.severity]}
                </span>
                <span>{f.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="vitals">
        <h2 id="vitals" className={styles.h2}>
          Core Web Vitals (lab)
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col">Mobile</th>
                <th scope="col">Desktop</th>
                <th scope="col">Good</th>
              </tr>
            </thead>
            <tbody>
              {VITALS.map((v) => (
                <tr key={v.metric}>
                  <th scope="row">{v.metric}</th>
                  <td>{v.mobile}</td>
                  <td>{v.desktop}</td>
                  <td>{v.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="findings">
        <h2 id="findings" className={styles.h2}>
          All findings ({FINDINGS.length})
        </h2>
        <div className={styles.findings}>
          {FINDINGS.map((f) => (
            <FindingCard key={f.id} f={f} />
          ))}
        </div>
      </section>
    </main>
  );
}
