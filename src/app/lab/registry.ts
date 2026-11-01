export type LabStatus = "ready" | "in progress" | "live";

export type LabPage = {
  href: string;
  title: string;
  blurb: string;
  status: LabStatus;
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
    title: "Concept 1",
    blurb: "Redesign concept 1.",
    status: "in progress",
  },
  {
    href: "/lab/v2",
    title: "Concept 2",
    blurb: "Redesign concept 2.",
    status: "in progress",
  },
  {
    href: "/lab/v3",
    title: "Concept 3",
    blurb: "Redesign concept 3.",
    status: "in progress",
  },
  {
    href: "/",
    title: "Current live site",
    blurb: "The portfolio as it is today, for side-by-side comparison.",
    status: "live",
  },
];
