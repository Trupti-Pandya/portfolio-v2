"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { AsciiArt } from "@/components/ui/ascii-art";

const HI_THERE = `  _    _ _   _______ _                   _ _
 | |  | (_) |__   __| |                 | | |
 | |__| |_     | |  | |__   ___ _ __ ___| | |
 |  __  | |    | |  | '_ \\ / _ \\ '__/ _ \\ | |
 | |  | | |    | |  | | | |  __/ | |  __/_|_|
 |_|  |_|_|    |_|  |_| |_|\\___|_|  \\___(_|_)`;

type OutputLine = { type: "label" | "value" | "error" | "link"; text: string; href?: string };

type HistoryItem = {
  command: string;
  lines: OutputLine[];
};

const COMMANDS: Record<string, OutputLine[]> = {
  help: [
    { type: "label", text: "available commands" },
    { type: "value", text: "  about      →  who I am" },
    { type: "value", text: "  skills     →  technical expertise" },
    { type: "value", text: "  projects   →  selected work" },
    { type: "value", text: "  contact    →  get in touch" },
    { type: "value", text: "  whoami     →  current user" },
    { type: "value", text: "  clear      →  clear terminal" },
  ],
  about: [
    { type: "label", text: "about.md" },
    { type: "value", text: "MSc Cloud Computing · University of Leicester · Merit" },
    { type: "value", text: "Building production-grade GenAI systems that sit at the" },
    { type: "value", text: "intersection of rigorous engineering and intuitive design." },
  ],
  skills: [
    { type: "label", text: "capabilities.json" },
    { type: "value", text: "  [LLM]      Prompt Engineering · RAG · LangChain" },
    { type: "value", text: "  [EVAL]     DeepEval · Langfuse · Hallucination Detection" },
    { type: "value", text: "  [CODE]     Python · TypeScript · React · Next.js" },
    { type: "value", text: "  [CLOUD]    Azure · AWS · Docker · CI/CD" },
    { type: "value", text: "  [DESIGN]   Figma · Adobe Suite · UX/UI" },
  ],
  projects: [
    { type: "label", text: "./projects" },
    { type: "value", text: "  01  HireAI" },
    { type: "value", text: "      RAG-powered recruitment assistant" },
    { type: "value", text: "      Next.js · TypeScript · DeepEval · Guardrails" },
    { type: "value", text: "" },
    { type: "value", text: "  02  Career Copilot" },
    { type: "value", text: "      AI-driven career coaching platform" },
    { type: "value", text: "      LLM Orchestration · Prompt Templates · Session Mgmt" },
  ],
  contact: [
    { type: "label", text: "contact.sh" },
    { type: "link", text: "  email     truptipandya21901@gmail.com", href: "mailto:truptipandya21901@gmail.com" },
    { type: "link", text: "  linkedin  linkedin.com/in/trupti-pandya", href: "https://linkedin.com/in/trupti-pandya" },
    { type: "link", text: "  github    github.com/Trupti-Pandya", href: "https://github.com/Trupti-Pandya" },
  ],
  whoami: [
    { type: "value", text: "trupti_pandya · LLM Engineer · open_to_offers=true" },
  ],
};

export default function InteractiveTerminal() {
  const [tokens, setTokens] = useState(2847);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [focused, setFocused] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => prev + Math.floor(Math.random() * 12) - 3);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (historyBoxRef.current) {
      historyBoxRef.current.scrollTop = historyBoxRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    setCmdHistory(prev => [trimmed, ...prev]);
    setCmdHistoryIdx(-1);

    if (trimmed === "clear") {
      setHistory([]);
      return;
    }

    const lines: OutputLine[] = COMMANDS[trimmed] ?? [
      { type: "error", text: `command not found: ${trimmed}` },
      { type: "value", text: "type 'help' to list available commands" },
    ];

    setHistory(prev => [...prev, { command: trimmed, lines }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cmdHistoryIdx + 1, cmdHistory.length - 1);
      setCmdHistoryIdx(next);
      setInputVal(cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(cmdHistoryIdx - 1, -1);
      setCmdHistoryIdx(next);
      setInputVal(next === -1 ? "" : cmdHistory[next] ?? "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = Object.keys(COMMANDS).find(c => c.startsWith(inputVal.toLowerCase()));
      if (match) setInputVal(match);
    }
  };

  return (
    <div
      className="terminal-box"
      onClick={() => inputRef.current?.focus()}
      style={{ cursor: "text" }}
    >
      {/* Title bar */}
      <div className="token-counter" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "rgba(184,255,87,0.5)", letterSpacing: "0.1em" }}>
          trupti@portfolio:~$
        </span>
        <span>tokens: {tokens.toLocaleString()}</span>
      </div>

      {/* Terminal body */}
      <div className="terminal-body" style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* ASCII background */}
        <AsciiArt
          src="/image.png"
          charset="dense"
          color="#b8ff57"
          animationStyle="matrix"
          animated={true}
          animateOnView={true}
          resolution={400}
          objectFit="cover"
          className="absolute inset-0 w-full h-full"
        />

        {/* Dark gradient fade at bottom for readability */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "65%",
          background: "linear-gradient(to top, rgba(6,6,8,0.97) 40%, rgba(6,6,8,0.6) 80%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Foreground UI */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "18px" }}>

          {/* Top-left: Hi There + hint */}
          <div style={{ maxWidth: "54%" }}>
            <pre style={{
              fontFamily: "var(--mono)",
              fontSize: "7.5px",
              lineHeight: "1.45",
              color: "#b8ff57",
              textShadow: "0 0 14px #b8ff57, 0 0 30px rgba(184,255,87,0.3)",
              margin: 0,
              whiteSpace: "pre",
            }}>
              {HI_THERE}
            </pre>
            <div style={{
              marginTop: "10px",
              fontFamily: "var(--mono)",
              fontSize: "10px",
              color: "rgba(184,255,87,0.55)",
              lineHeight: 1.9,
              borderLeft: "1px solid rgba(184,255,87,0.3)",
              paddingLeft: "10px",
            }}>
              <span>interactive terminal · type </span>
              <span style={{ color: "#b8ff57", textShadow: "0 0 6px #b8ff57" }}>help</span>
              <span> to explore</span>
              <br />
              <span style={{ opacity: 0.5 }}>↑↓ history · tab autocomplete</span>
            </div>
          </div>

          {/* Bottom: history + input */}
          <div>
            {/* Chat history */}
            {history.length > 0 && (
              <div
                ref={historyBoxRef}
                style={{
                  maxHeight: "160px",
                  overflowY: "auto",
                  marginBottom: "8px",
                  paddingRight: "4px",
                  scrollbarWidth: "none",
                }}
              >
                {history.map((item, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    {/* Command line */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "rgba(184,255,87,0.4)" }}>❯</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "#b8ff57", letterSpacing: "0.05em" }}>{item.command}</span>
                    </div>
                    {/* Output lines */}
                    <div style={{ paddingLeft: "16px", borderLeft: "1px solid rgba(184,255,87,0.15)" }}>
                      {item.lines.map((line, j) => (
                        <div key={j} style={{ fontFamily: "var(--mono)", fontSize: "10.5px", lineHeight: 1.7 }}>
                          {line.type === "label" && (
                            <span style={{ color: "#b8ff57", opacity: 0.9, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "9px" }}>
                              ── {line.text} ──
                            </span>
                          )}
                          {line.type === "value" && (
                            <span style={{ color: "rgba(184,255,87,0.65)", whiteSpace: "pre" }}>{line.text}</span>
                          )}
                          {line.type === "error" && (
                            <span style={{ color: "#ff6b6b" }}>✗ {line.text}</span>
                          )}
                          {line.type === "link" && (
                            <a
                              href={line.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#b8ff57", textDecoration: "none", borderBottom: "1px solid rgba(184,255,87,0.3)" }}
                              onClick={e => e.stopPropagation()}
                            >
                              {line.text}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            )}

            {/* Input bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderTop: `1px solid ${focused ? "rgba(184,255,87,0.5)" : "rgba(184,255,87,0.15)"}`,
              paddingTop: "10px",
              transition: "border-color 0.2s",
              boxShadow: focused ? "0 -4px 20px rgba(184,255,87,0.06)" : "none",
            }}>
              <span style={{
                fontFamily: "var(--mono)",
                fontSize: "12px",
                color: "#b8ff57",
                textShadow: focused ? "0 0 8px #b8ff57" : "none",
                transition: "text-shadow 0.2s",
                flexShrink: 0,
              }}>❯</span>
              <form
                onSubmit={(e) => { e.preventDefault(); handleCommand(inputVal); setInputVal(""); }}
                style={{ flex: 1, display: "flex", alignItems: "center" }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="enter command..."
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#b8ff57",
                    fontFamily: "var(--mono)",
                    fontSize: "12px",
                    width: "100%",
                    outline: "none",
                    caretColor: "#b8ff57",
                    letterSpacing: "0.04em",
                  }}
                  autoComplete="off"
                  spellCheck="false"
                />
              </form>
              {!inputVal && (
                <span className="blink" style={{ flexShrink: 0 }} />
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        div[style*="scrollbar-width"]::-webkit-scrollbar { display: none; }
        input::placeholder { color: rgba(184,255,87,0.2); }
      `}</style>
    </div>
  );
}
