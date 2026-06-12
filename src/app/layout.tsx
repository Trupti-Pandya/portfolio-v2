import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Trupti Pandya",
  description: "LLM Engineer & Generative AI Specialist portfolio.",
  icons: {
    // Cover every browser: .ico (Safari, which ignores SVG and auto-requests
    // /favicon.ico), crisp SVG (Chrome/Firefox), and explicit small PNGs.
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/icon.svg?v=3", type: "image/svg+xml" },
      { url: "/icon-32.png?v=3", type: "image/png", sizes: "32x32" },
      { url: "/icon-16.png?v=3", type: "image/png", sizes: "16x16" },
      { url: "/icon-192.png?v=3", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png?v=3", sizes: "180x180" }],
    shortcut: [{ url: "/favicon.ico?v=3" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", spaceGrotesk.variable)}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
