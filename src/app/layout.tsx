import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { SITE_URL, PROFILE } from "@/lib/site";
import StructuredData from "@/components/StructuredData";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

const title = `${PROFILE.name} — ${PROFILE.jobTitle}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s — ${PROFILE.name}`,
  },
  description: PROFILE.description,
  applicationName: `${PROFILE.name} Portfolio`,
  authors: [{ name: PROFILE.name, url: SITE_URL }],
  creator: PROFILE.name,
  publisher: PROFILE.name,
  keywords: [
    PROFILE.name,
    "LLM Engineer",
    "Generative AI Engineer",
    "AI Engineer portfolio",
    ...PROFILE.expertise,
  ],
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    siteName: `${PROFILE.name} — Portfolio`,
    title,
    description: PROFILE.description,
    url: SITE_URL,
    locale: "en_GB",
    firstName: PROFILE.firstName,
    lastName: PROFILE.lastName,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: PROFILE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    // Cover every browser: .ico (Safari, which ignores SVG and auto-requests
    // /favicon.ico), crisp SVG (Chrome/Firefox), and explicit small PNGs.
    icon: [
      { url: "/favicon.ico?v=5", sizes: "any" },
      { url: "/icon.svg?v=5", type: "image/svg+xml" },
      { url: "/icon-32.png?v=5", type: "image/png", sizes: "32x32" },
      { url: "/icon-16.png?v=5", type: "image/png", sizes: "16x16" },
      { url: "/icon-192.png?v=5", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png?v=5", sizes: "180x180" }],
    shortcut: [{ url: "/favicon.ico?v=5" }],
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
        <StructuredData />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
