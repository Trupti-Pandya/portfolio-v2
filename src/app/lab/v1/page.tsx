import type { Metadata } from "next";
import V1 from "./V1";

export const metadata: Metadata = {
  title: "Lab v1 — Refined Signal",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <V1 />;
}
