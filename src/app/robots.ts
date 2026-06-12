import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Explicitly welcome the major AI/answer-engine crawlers. Being indexable by
 * these is the entire point of GEO/AEO — it's how you appear inside ChatGPT,
 * Gemini, Perplexity, and Google AI Overview answers. (They obey robots.txt; if
 * you DON'T list them, some default to not crawling.)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" }, // OpenAI / ChatGPT
      { userAgent: "OAI-SearchBot", allow: "/" }, // ChatGPT Search
      { userAgent: "ChatGPT-User", allow: "/" }, // ChatGPT browsing
      { userAgent: "ClaudeBot", allow: "/" }, // Anthropic / Claude
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" }, // Perplexity
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" }, // Gemini / Vertex training+grounding
      { userAgent: "Applebot-Extended", allow: "/" }, // Apple Intelligence
      { userAgent: "Bingbot", allow: "/" }, // Copilot / Bing
      { userAgent: "CCBot", allow: "/" }, // Common Crawl (feeds many models)
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
