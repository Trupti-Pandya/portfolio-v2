import type { Metadata } from "next";
import RefinedSignal, { ChatMock } from "@/components/refined-signal/RefinedSignal";
import LabBanner from "./_shared/LabBanner";
import PreviewExit from "../_preview/PreviewExit";
import { isPreview, type LabSearchParams } from "../_preview/preview";

export const metadata: Metadata = {
  title: "Lab v1 — Refined Signal",
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }: { searchParams: LabSearchParams }) {
  if (await isPreview(searchParams)) {
    return (
      <>
        <PreviewExit />
        <RefinedSignal chat={<ChatMock />} />
      </>
    );
  }
  return (
    <RefinedSignal
      chat={<ChatMock />}
      banner={
        <LabBanner
          id="v1"
          name="Refined Signal"
          changes={[
            "Same section order, tighter mobile rhythm: one column, 16px gutters, nothing hidden behind a hamburger.",
            "Thumb-reach bottom tab bar on phones replaces the top hamburger menu.",
            "Long copy (project impact, role logs) folds into tap-to-expand rows; credentials become a 2-up grid.",
          ]}
        />
      }
    />
  );
}
