import { ImageResponse } from "next/og";
import { PROFILE } from "@/lib/site";

// Static social-share card. "Terminal Boot" design matching the site's hero:
// near-black bg, lime accent, mono prompt. Replace by dropping a /public/og.png
// and pointing metadata.openGraph.images at it if you generate your own.
export const alt = `${PROFILE.name} — ${PROFILE.jobTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#060608";
const INK = "#f0ede6";
const ACCENT = "#b4e84a";
const MUTED = "#8e8e9a";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "monospace",
          color: INK,
          position: "relative",
        }}
      >
        {/* top: terminal label */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTED }}>
          <span>sys/trupti_pandya.llm</span>
          <span style={{ color: ACCENT }}>● ● ●</span>
        </div>

        {/* center: prompt + name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 26, color: MUTED }}>initialising portfolio.exe</span>
          <div style={{ display: "flex", alignItems: "center", fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>
            <span style={{ color: ACCENT, marginRight: 24 }}>›</span>
            <span>{PROFILE.name}</span>
            <span style={{ width: 36, height: 84, background: ACCENT, marginLeft: 20 }} />
          </div>
          <span style={{ fontSize: 36, color: INK }}>{PROFILE.jobTitle}</span>
        </div>

        {/* bottom: tags + url + monogram */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24 }}>
          <span style={{ color: MUTED }}>RAG · Prompt Engineering · Vector DB · Responsible AI</span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ color: ACCENT }}>truptipandya.dev</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                background: ACCENT,
                color: BG,
                fontWeight: 700,
                fontSize: 26,
                borderRadius: 8,
              }}
            >
              TP
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
