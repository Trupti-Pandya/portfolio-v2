export const COMMANDS: { cmd: string; target: string; hint: string }[] = [
  { cmd: "about", target: "about", hint: "cat about.md" },
  { cmd: "skills", target: "skills", hint: "tree ./capabilities" },
  { cmd: "projects", target: "projects", hint: "ls ./projects" },
  { cmd: "log", target: "exp", hint: "tail experience.log" },
  { cmd: "certs", target: "certs", hint: "verify --credentials" },
  { cmd: "contact", target: "contact", hint: "./contact.sh" },
];

export type CommandResult =
  | { kind: "jump"; target: string; message: string }
  | { kind: "open"; href: string; message: string }
  | { kind: "info"; message: string };

const ALIASES: Record<string, string> = {
  whoami: "about", cat: "about", stack: "skills", tree: "skills", ls: "projects", work: "projects",
  exp: "log", experience: "log", tail: "log", verify: "certs", credentials: "certs", email: "contact", hire: "contact",
};

export function runCommand(raw: string): CommandResult {
  const word = raw.trim().toLowerCase().replace(/^\.\//, "").split(/\s+/)[0]?.replace(/\.(sh|md|log|json|pdf)$/, "") ?? "";
  if (!word) return { kind: "info", message: "type a command — try: help" };
  if (word === "help") return { kind: "info", message: `commands: ${COMMANDS.map((c) => c.cmd).join(" · ")} · cv · clear` };
  if (word === "cv" || word === "resume") return { kind: "open", href: "/Trupti_Pandya_CV.pdf", message: "opening resume.pdf ↗" };
  if (word === "clear") return { kind: "jump", target: "top", message: "cleared — back to top" };
  const name = ALIASES[word] ?? word;
  const hit = COMMANDS.find((c) => c.cmd === name);
  if (hit) return { kind: "jump", target: hit.target, message: `$ ${hit.hint}` };
  return { kind: "info", message: `command not found: ${word} — try: help` };
}
