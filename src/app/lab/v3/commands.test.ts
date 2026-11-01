import { describe, it, expect } from "vitest";
import { runCommand } from "./commands";

describe("v3 shell commands", () => {
  it("jumps to a section by name or alias", () => {
    expect(runCommand("projects")).toMatchObject({ kind: "jump", target: "projects" });
    expect(runCommand("  WhoAmI ")).toMatchObject({ kind: "jump", target: "about" });
    expect(runCommand("./contact.sh")).toMatchObject({ kind: "jump", target: "contact" });
    expect(runCommand("verify --credentials")).toMatchObject({ kind: "jump", target: "certs" });
  });

  it("opens the CV and lists help", () => {
    expect(runCommand("cv")).toMatchObject({ kind: "open", href: "/Trupti_Pandya_CV.pdf" });
    expect(runCommand("help").message).toContain("projects");
  });

  it("reports unknown and empty input without throwing", () => {
    expect(runCommand("rm -rf /")).toEqual({ kind: "info", message: "command not found: rm — try: help" });
    expect(runCommand("").kind).toBe("info");
  });
});
