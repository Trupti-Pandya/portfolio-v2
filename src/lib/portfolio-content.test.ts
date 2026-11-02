import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { CREDENTIALS, PROJECTS, SKILLS, EXPERIENCE, CONTACTS, EDUCATION } from "./portfolio-content";

const PUBLIC_DIR = join(process.cwd(), "public");

describe("portfolio content", () => {
  it("carries the full credentials wall, including both Nebius badges", () => {
    expect(CREDENTIALS).toHaveLength(5);
    const names = CREDENTIALS.map((c) => c.name);
    expect(names).toContain("Nebius AI Leader Certification");
    expect(names).toContain("Nebius Agentic AI Builder Certification");
  });

  it("points every credential at an https verify URL and an existing image", () => {
    for (const c of CREDENTIALS) {
      expect(c.verifyUrl.startsWith("https://")).toBe(true);
      expect(existsSync(join(PUBLIC_DIR, c.img))).toBe(true);
    }
  });

  it("keeps the live site's projects, skills, roles, degrees and contacts", () => {
    expect(PROJECTS.map((p) => p.name)).toEqual([
      "HireAI",
      "Career Copilot",
      "NurseChat",
      "AI Forensic Assistant",
    ]);
    expect(SKILLS).toHaveLength(6);
    expect(EXPERIENCE.map((e) => e.company)).toEqual(["Zenithive", "LinearLoop"]);
    expect(EDUCATION).toHaveLength(2);
    expect(CONTACTS.map((c) => c.key)).toEqual(["email", "linkedin", "github"]);
  });
});
