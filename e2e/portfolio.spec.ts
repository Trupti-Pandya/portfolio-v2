import { test, expect } from "@playwright/test";

const SITE = "https://truptipandya.dev";

test.describe("homepage", () => {
  test("loads with the correct title and hero name", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Trupti Pandya/);
    await expect(page.locator("h1")).toContainText("Trupti");
  });

  test("renders the key sections as anchors", async ({ page }) => {
    await page.goto("/");
    for (const id of ["about", "skills", "projects", "contact"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("exposes SEO metadata: canonical, OG, and JSON-LD", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", SITE);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Trupti Pandya/,
    );
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(ld).toBeTruthy();
    const graph = JSON.parse(ld!);
    const types = (graph["@graph"] ?? []).map((n: { "@type": string }) => n["@type"]);
    expect(types).toContain("Person");
    expect(types).toContain("WebSite");
  });

  test("opens the AI chat widget", async ({ page }) => {
    await page.goto("/");
    // The always-present in-panel launcher (the floating FAB is aria-hidden
    // until the user scrolls). The modal is portalled and sits at opacity 0
    // in the DOM when closed, so assert on its data-open flag, not visibility.
    const modal = page.locator(".chat-modal");
    await expect(modal).toHaveAttribute("data-open", "false");
    await page.locator(".chat-launcher").click();
    await expect(modal).toHaveAttribute("data-open", "true");
  });
});

test.describe("GEO/SEO endpoints", () => {
  test("robots.txt allows AI crawlers and points to the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("GPTBot");
    expect(body).toContain("PerplexityBot");
    expect(body).toMatch(/Sitemap:\s*https:\/\/truptipandya\.dev\/sitemap\.xml/);
  });

  test("sitemap.xml is valid XML for the canonical domain", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("xml");
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain(SITE);
  });

  test("llms.txt is served for generative engines", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Trupti Pandya");
  });

  test("opengraph-image renders as a PNG", async ({ request }) => {
    const res = await request.get("/opengraph-image");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });

  test("favicon assets are reachable", async ({ request }) => {
    for (const path of ["/favicon.ico", "/icon.svg", "/icon-192.png"]) {
      const res = await request.get(path);
      expect(res.status(), `${path} should be 200`).toBe(200);
    }
  });
});
