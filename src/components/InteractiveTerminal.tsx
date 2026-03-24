"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

const ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
const HI_THERE = `  _    _ _   _______ _                   _ _
 | |  | (_) |__   __| |                 | | |
 | |__| |_     | |  | |__   ___ _ __ ___| | |
 |  __  | |    | |  | '_ \\ / _ \\ '__/ _ \\ | |
 | |  | | |    | |  | | | |  __/ | |  __/_|_|
 |_|  |_|_|    |_|  |_| |_|\\___|_|  \\___(_|_)`;

function imageToAscii(img: HTMLImageElement, cols: number, rows: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  let result = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      result += ASCII_CHARS[Math.floor((brightness / 255) * (ASCII_CHARS.length - 1))];
    }
    result += "\n";
  }
  return result;
}

type HistoryItem = {
  command: string;
  output: ReactNode;
};

export default function InteractiveTerminal() {
  const [tokens, setTokens] = useState(2847);
  const [asciiImage, setAsciiImage] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [inputVal, setInputVal] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const asciiContainerRef = useRef<HTMLDivElement>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);

  const CHAR_W = 6.5;   // px per char at font-size 10px monospace
  const CHAR_H = 11.0;  // px per line at line-height 1.1
  const ASPECT = 0.48;  // char width/height ratio — corrects vertical squish

  const regenerate = (width: number, height: number) => {
    if (!loadedImgRef.current) return;
    const img = loadedImgRef.current;
    const cols = Math.floor(width / CHAR_W);
    // Correct for char aspect ratio so image isn't vertically stretched
    const rows = Math.floor(cols * (img.naturalHeight / img.naturalWidth) * ASPECT);
    if (cols < 10 || rows < 5) return;
    setAsciiImage(imageToAscii(img, cols, rows));
  };

  useEffect(() => {
    const img = new Image();
    img.src = "/image.png";
    img.onload = () => {
      loadedImgRef.current = img;
      if (asciiContainerRef.current) {
        const { offsetWidth, offsetHeight } = asciiContainerRef.current;
        regenerate(offsetWidth, offsetHeight);
      }
    };
  }, []);

  useEffect(() => {
    const container = asciiContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        regenerate(width, height);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => prev + Math.floor(Math.random() * 12) - 3);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = endRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    
    let output: ReactNode = null;
    const lowerCmd = trimmed.toLowerCase();

    if (lowerCmd === "clear") {
      setHistory([]);
      return;
    } else if (lowerCmd === "help") {
      output = (
        <>
          <div className="t-line"><span className="t-val">Available commands:</span></div>
          <div className="t-line"><span className="t-key" style={{ paddingLeft: "20px" }}>about</span><span className="t-val">Show a brief introduction</span></div>
          <div className="t-line"><span className="t-key" style={{ paddingLeft: "20px" }}>skills</span><span className="t-val">List technical expertise</span></div>
          <div className="t-line"><span className="t-key" style={{ paddingLeft: "20px" }}>projects</span><span className="t-val">View selected work</span></div>
          <div className="t-line"><span className="t-key" style={{ paddingLeft: "20px" }}>contact</span><span className="t-val">Show contact information</span></div>
          <div className="t-line"><span className="t-key" style={{ paddingLeft: "20px" }}>clear</span><span className="t-val">Clear terminal output</span></div>
        </>
      );
    } else if (lowerCmd === "about") {
      output = <div className="t-line"><span className="t-val">MSc Cloud Computing graduate from the University of Leicester — shipping production-grade GenAI products.</span></div>;
    } else if (lowerCmd === "skills") {
      output = (
        <>
          <div className="t-line"><span className="t-key">Languages</span><span className="t-val">Python, TypeScript, JavaScript</span></div>
          <div className="t-line"><span className="t-key">Frameworks</span><span className="t-val">React, Next.js</span></div>
          <div className="t-line"><span className="t-key">AI/LLM</span><span className="t-val">Prompt Engineering, RAG Pipelines, LangChain, Tool Calling</span></div>
        </>
      );
    } else if (lowerCmd === "projects") {
      output = (
        <>
          <div className="t-line"><span className="t-key">01</span><span className="t-val">HireAI - AI recruitment assistant (RAG, Next.js, DeepEval)</span></div>
          <div className="t-line"><span className="t-key">02</span><span className="t-val">Career Copilot - AI-driven career coaching platform</span></div>
        </>
      );
    } else if (lowerCmd === "contact") {
      output = (
        <>
          <div className="t-line"><span className="t-key">Email</span><span className="t-val"><a href="mailto:truptipandya21901@gmail.com" style={{ color: "var(--lime)", textDecoration: "underline" }}>truptipandya21901@gmail.com</a></span></div>
          <div className="t-line"><span className="t-key">LinkedIn</span><span className="t-val"><a href="https://linkedin.com/in/trupti-pandya" target="_blank" rel="noopener noreferrer" style={{ color: "var(--lime)", textDecoration: "underline" }}>linkedin.com/in/trupti-pandya</a></span></div>
        </>
      );
    } else {
      output = <div className="t-line"><span className="t-val" style={{ color: "#ff6b6b" }}>Command not found: {trimmed}. Type &apos;help&apos; for a list of commands.</span></div>;
    }

    setHistory(prev => [...prev, { command: trimmed, output }]);
  };

  return (
    <div className="terminal-box" onClick={() => inputRef.current?.focus()}>
      <div className="token-counter">tokens: {tokens.toLocaleString()}</div>
      <div className="terminal-body" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* ASCII image — fills available terminal space responsively */}
        <div ref={asciiContainerRef} style={{ flex: 1, overflow: "hidden", minHeight: 0, maxWidth: "100%" }}>
          {asciiImage && (
            <pre style={{
              fontSize: "10px",
              lineHeight: "1.1",
              color: "var(--lime)",
              margin: 0,
              whiteSpace: "pre",
              opacity: 0.9,
            }}>
              {asciiImage}
            </pre>
          )}
        </div>

        {history.map((item, i) => (
          <div key={i} style={{ marginBottom: "16px" }}>
            <div className="t-cmd" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              <span>$ </span>{item.command}
            </div>
            {item.output && <div style={{ marginTop: "8px" }}>{item.output}</div>}
          </div>
        ))}
        
        <div className="t-cmd" style={{ marginTop: history.length > 0 ? "8px" : 0, paddingTop: 0, borderTop: "none", display: "flex", alignItems: "center" }}>
          <span>$ </span>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleCommand(inputVal);
              setInputVal("");
            }}
            style={{ width: "100%", display: "flex", alignItems: "center" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--lime)",
                fontFamily: "var(--mono)",
                fontSize: "13px",
                width: "100%",
                outline: "none",
                marginLeft: "8px"
              }}
              autoComplete="off"
              spellCheck="false"
            />
          </form>
          <span className="blink" style={{ display: inputVal ? "none" : "inline-block" }}></span>
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}
