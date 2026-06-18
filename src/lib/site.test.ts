import { describe, it, expect } from "vitest";
import { SITE_URL, PROFILE, PROJECTS } from "./site";

describe("SITE_URL", () => {
  it("is an absolute https URL", () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
    expect(() => new URL(SITE_URL)).not.toThrow();
  });

  it("has no trailing slash (canonical URLs are built by appending paths)", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });
});

describe("PROFILE", () => {
  it("has the core identity fields populated", () => {
    for (const key of ["name", "jobTitle", "description", "email"] as const) {
      expect(PROFILE[key].length).toBeGreaterThan(0);
    }
  });

  it("uses a valid contact email", () => {
    expect(PROFILE.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("exposes a non-empty expertise list for keywords/JSON-LD", () => {
    expect(PROFILE.expertise.length).toBeGreaterThan(5);
  });
});

describe("PROJECTS", () => {
  it("lists projects with the fields the JSON-LD/llms.txt need", () => {
    expect(PROJECTS.length).toBeGreaterThan(0);
    for (const p of PROJECTS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(20);
      expect(p.keywords.length).toBeGreaterThan(0);
      expect(p.url).toMatch(/^https:\/\/github\.com\/Trupti-Pandya\//);
    }
  });

  it("has unique project URLs", () => {
    const urls = PROJECTS.map((p) => p.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
