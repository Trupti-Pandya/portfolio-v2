import type { Metadata } from "next";
import V3 from "./V3";

export const metadata: Metadata = {
  title: "Lab v3 — Agent Shell",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <V3 />;
}
