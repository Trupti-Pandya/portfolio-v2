"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

type HistoryItem = {
  command: string;
  output: ReactNode;
};

const defaultOutput = (
  <>
    <div className="t-line"><span className="t-key">name</span><span className="t-val">&quot;Trupti Pandya&quot;</span></div>
    <div className="t-line"><span className="t-key">role</span><span className="t-val">&quot;LLM Engineer&quot;</span></div>
    <div className="t-line"><span className="t-key">location</span><span className="t-val">&quot;Leicester, UK&quot;</span></div>
    <div className="t-spacer"></div>
    <div className="t-line"><span className="t-key">expertise</span><span className="t-val">[</span></div>
    <div className="t-line"><span className="t-key" style={{ paddingLeft: "20px" }}>0</span><span className="t-val">&quot;RAG Architectures&quot;</span></div>
    <div className="t-line"><span className="t-key" style={{ paddingLeft: "20px" }}>1</span><span className="t-val">&quot;Prompt Engineering&quot;</span></div>
    <div className="t-line"><span className="t-key" style={{ paddingLeft: "20px" }}>2</span><span className="t-val">&quot;LLM Evaluation&quot;</span></div>
    <div className="t-line"><span className="t-key" style={{ paddingLeft: "20px" }}>3</span><span className="t-val">&quot;Responsible AI&quot;</span></div>
    <div className="t-line"><span className="t-key"></span><span className="t-val">]</span></div>
    <div className="t-spacer"></div>
    <div className="t-line"><span className="t-key">status</span><span className="t-val" style={{ color: "var(--lime)" }}>&quot;open_to_offers&quot;</span></div>
    <div className="t-line"><span className="t-key">cert</span><span className="t-val">&quot;Databricks GenAI&quot;</span></div>
  </>
);

export default function InteractiveTerminal() {
  const [tokens, setTokens] = useState(2847);
  const [history, setHistory] = useState<HistoryItem[]>([
    { command: "query --profile trupti_pandya", output: defaultOutput },
  ]);
  const [inputVal, setInputVal] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="terminal-body" style={{ height: "400px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        
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
