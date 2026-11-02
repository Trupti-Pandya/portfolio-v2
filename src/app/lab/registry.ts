export type LabStatus = "ready" | "in progress" | "live";

export type LabPage = {
  href: string;
  title: string;
  blurb: string;
  status: LabStatus;
  /** Concept pages that support fullscreen preview (?preview=1). */
  preview?: boolean;
};

export const LAB_PAGES: LabPage[] = [
  {
    href: "/lab/audit",
    title: "UI + website audit",
    blurb:
      "Scorecard, top 5 issues and every finding with evidence and a fix: performance, SEO, accessibility, security, mobile.",
    status: "ready",
  },
  {
    href: "/lab/v1",
    title: "Concept 1 — Refined Signal",
    blurb:
      "The live layout tightened for phones: thumb-reach bottom tab bar, tap-to-expand project impact, 2-up credentials grid.",
    status: "ready",
    preview: true,
  },
  {
    href: "/lab/v2",
    title: "Concept 2 — Editorial Bento",
    blurb:
      "Magazine masthead and rounded bento grid leading with impact numbers, plus a swipeable credentials strip.",
    status: "ready",
    preview: true,
  },
  {
    href: "/lab/v3",
    title: "Concept 3 — Agent Shell",
    blurb:
      "The whole page as one agent terminal session: collapsible tool-call sections and a working command bar.",
    status: "ready",
    preview: true,
  },
  {
    href: "/",
    title: "Current live site",
    blurb: "The portfolio as it is today, for side-by-side comparison.",
    status: "live",
  },
];
