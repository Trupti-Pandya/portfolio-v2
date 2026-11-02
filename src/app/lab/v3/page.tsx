import type { Metadata } from "next";
import V3 from "./V3";
import PreviewExit from "../_preview/PreviewExit";
import { isPreview, type LabSearchParams } from "../_preview/preview";

export const metadata: Metadata = {
  title: "Lab v3 — Agent Shell",
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }: { searchParams: LabSearchParams }) {
  if (await isPreview(searchParams)) {
    return (
      <>
        <PreviewExit />
        <V3 preview />
      </>
    );
  }
  return <V3 />;
}
