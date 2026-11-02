"use client";

import { AsciiArt } from "@/components/ui/ascii-art";

export const PORTRAIT_SRC = "/ascii-portrait.webp";
export const PORTRAIT_ALT = "Portrait photo of Trupti Pandya, rendered in green ASCII characters";
export const PORTRAIT_COLOR = "#c3f260";

/** The site's ASCII portrait, exposed to assistive tech as one image (role=img makes the canvas presentational). */
export default function HeroPortrait({
  resolution,
  className,
}: {
  resolution: number;
  className?: string;
}) {
  return (
    <div role="img" aria-label={PORTRAIT_ALT} className={className}>
      <AsciiArt
        src={PORTRAIT_SRC}
        charset="dense"
        color={PORTRAIT_COLOR}
        animated={false}
        animationStyle="none"
        resolution={resolution}
        objectFit="cover"
        className="w-full h-full"
      />
    </div>
  );
}
