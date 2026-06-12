import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Single-page site, but the on-page sections are crawlable anchors worth
 * surfacing. Home is highest priority; section anchors help engines deep-link
 * to the relevant part of the page in answers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/#about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/#skills`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/#projects`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/#contact`, lastModified, changeFrequency: "yearly", priority: 0.6 },
  ];
}
