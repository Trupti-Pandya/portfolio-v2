"use client";

import { useState, useRef, useEffect } from "react";

type Provider = "azure" | "aws" | "gcp";

interface ProviderConfig {
  label: string;
  model: string;
  region: string;
  color: string;
  dot: string;
  cost: string;
  tone: string;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  azure: {
    label: "Azure OpenAI",
    model: "gpt-4.1-mini",
    region: "uk-south",
    color: "#0078D4",
    dot: "rgba(0,120,212,0.9)",
    cost: "~£0.05/mo",
    tone: "Professional",
  },
  aws: {
    label: "AWS Bedrock",
    model: "Nova Lite",
    region: "eu-west-2",
    color: "#FF9900",
    dot: "rgba(255,153,0,0.9)",
    cost: "~£0.03/mo",
    tone: "Engineer",
  },
  gcp: {
    label: "Google Cloud",
    model: "Gemini 2.5 Flash Lite",
    region: "generative-ai",
    color: "#4285F4",
    dot: "rgba(66,133,244,0.9)",
    cost: "Free",
    tone: "Strategist",
  },
};

interface Message {
  role: "user" | "ai";
  text: string;
  provider?: Provider;
  streaming?: boolean;
}

// Converts email addresses to mailto: links and URLs to anchor tags
function renderText(text: string, isAi: boolean) {
  if (!isAi) return <>{text}</>;

  const emailRegex = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g;
  const urlRegex = /(https?:\/\/[^\s<>"']+?)([.,!?;:'")\]]*(?:\s|$))/g;

  // Tokenise into segments: plain text, emails, URLs
  type Segment = { type: "text" | "email" | "url"; value: string; trailing?: string };
  const segments: Segment[] = [];

  const combined = new RegExp(
    `(${emailRegex.source})|(${urlRegex.source})`,
    "g"
  );

  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = combined.exec(text)) !== null) {
    if (match.index > last) segments.push({ type: "text", value: text.slice(last, match.index) });
    if (match[1]) {
      // email
      segments.push({ type: "email", value: match[1] });
    } else if (match[2]) {
      // url
      segments.push({ type: "url", value: match[3], trailing: match[4] ?? "" });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "email") {
          return (
            <a
              key={i}
              href={`mailto:${seg.value}?subject=Hello Trupti`}
              style={{ color: "#b8ff57", borderBottom: "1px solid rgba(184,255,87,0.5)", textDecoration: "none" }}
            >
              {seg.value}
            </a>
          );
        }
        if (seg.type === "url") {
          return (
            <span key={i}>
              <a
                href={seg.value}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: "#b8ff57", borderBottom: "1px solid rgba(184,255,87,0.5)", textDecoration: "none" }}
              >
                {seg.value}
              </a>
              {seg.trailing}
            </span>
          );
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </>
  );
}

export default function ChatSection() {
  const [provider, setProvider] = useState<Provider>("azure");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! I'm Trupti's PA. Ask me about her skills, projects, or experience — or say \"I'd like to book a call\" and I'll arrange it. Switch models below to change my tone.",
      provider: "azure",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");

    // Build updated history including this new user message
    const userMsg: Message = { role: "user", text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    // Add a streaming placeholder for the AI reply
    const streamingMsg: Message = { role: "ai", text: "", provider, streaming: true };
    setMessages((prev) => [...prev, streamingMsg]);

    // Convert UI messages to API format (skip initial greeting from history)
    const apiMessages = updatedMessages
      .filter((m) => !(m.role === "ai" && m.text.startsWith("Hi! I'm Trupti")))
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant" as const, content: m.text }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, provider }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let bookingFailed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.chunk) {
              accumulated += payload.chunk;
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.streaming) next[next.length - 1] = { ...last, text: accumulated };
                return next;
              });
            }
            if (payload.booking === "failed") bookingFailed = true;
            if (payload.done || payload.error) break;
          } catch {
            // partial line — continue
          }
        }
      }

      // Finalise — remove streaming flag
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.streaming) next[next.length - 1] = { ...last, streaming: false };
        return next;
      });

      // Surface a booking failure rather than letting the visitor believe the
      // request went through when it didn't.
      if (bookingFailed) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "⚠ I wasn't able to submit that request to Trupti just now. Please email her directly at pandyatrupti531@gmail.com and she'll get back to you.",
            provider,
          },
        ]);
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.streaming) {
          next[next.length - 1] = { role: "ai", text: "Connection error. Please try again.", provider };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const selectProvider = (p: Provider) => {
    setProvider(p);
    setPickerOpen(false);
    inputRef.current?.focus();
  };

  const cfg = PROVIDERS[provider];

  return (
    <div className="section reveal" id="chat">
      <div className="sec-marker">
        <div className="sec-num">06</div>
        <div className="sec-line" />
        <div className="sec-label">ai.playground</div>
      </div>

      <h2 className="display-h glitch-hover" style={{ marginBottom: "12px" }}>
        Chat with
        <br />
        <em>my AI.</em>
      </h2>

      <p style={{
        fontFamily: "var(--mono)",
        fontSize: "12px",
        color: "rgba(184,255,87,0.4)",
        marginBottom: "24px",
        lineHeight: 1.8,
        letterSpacing: "0.03em",
      }}>
        Powered by three real hyperscaler APIs — Azure OpenAI, AWS Bedrock, GCP Vertex AI.
        <br />
        Switch models in the input bar. Each provider has a distinct personality.
      </p>

      {/* Chat window */}
      <div style={{
        border: "1px solid rgba(184,255,87,0.18)",
        background: "#0a0a0d",
        display: "flex",
        flexDirection: "column",
        height: "480px",
        position: "relative",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 14px",
          borderBottom: "1px solid rgba(184,255,87,0.12)",
          background: "rgba(184,255,87,0.02)",
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "rgba(184,255,87,0.3)", letterSpacing: "0.15em" }}>
            {"// ai.assistant · multi-provider"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--mono)", fontSize: "9px", color: "rgba(184,255,87,0.3)" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#28c840", boxShadow: "0 0 4px #28c840", display: "inline-block", animation: "chatPulse 2s ease-in-out infinite" }} />
            {cfg.model} · {cfg.label} · {cfg.region}
          </span>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 16px 12px",
          scrollbarWidth: "none",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}>
          {messages.map((msg, i) => {
            const msgCfg = msg.provider ? PROVIDERS[msg.provider] : null;
            return (
              <div key={i} style={{
                display: "flex",
                gap: "9px",
                alignItems: "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}>
                <div style={{
                  width: 22, height: 22, flexShrink: 0,
                  border: "1px solid rgba(184,255,87,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--mono)", fontSize: "8px",
                  color: "rgba(184,255,87,0.5)",
                }}>
                  {msg.role === "user" ? "U" : "AI"}
                </div>
                <div style={{ maxWidth: "78%" }}>
                  {msg.role === "ai" && msgCfg && (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "var(--mono)",
                      fontSize: "8px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "1px 6px",
                      marginBottom: "5px",
                      border: `1px solid ${msgCfg.color}44`,
                      color: msgCfg.color,
                      background: `${msgCfg.color}11`,
                    }}>
                      {msgCfg.model} · {msgCfg.label}
                      <span style={{
                        padding: "0 4px",
                        background: `${msgCfg.color}22`,
                        border: `1px solid ${msgCfg.color}33`,
                        borderRadius: "2px",
                        fontSize: "7px",
                        opacity: 0.8,
                      }}>
                        {msgCfg.tone}
                      </span>
                    </div>
                  )}
                  <div style={{
                    fontFamily: "var(--mono)",
                    fontSize: "12px",
                    lineHeight: 1.75,
                    padding: "8px 11px",
                    border: "1px solid",
                    borderColor: msg.role === "user" ? "rgba(184,255,87,0.22)" : "rgba(184,255,87,0.08)",
                    background: msg.role === "user" ? "rgba(184,255,87,0.06)" : "rgba(255,255,255,0.015)",
                    color: msg.role === "user" ? "#b8ff57" : "rgba(184,255,87,0.72)",
                  }}>
                    {msg.streaming && !msg.text ? (
                      <span style={{ color: "rgba(184,255,87,0.35)" }}>
                        {cfg.label} is thinking<span className="chat-ellipsis">...</span>
                      </span>
                    ) : (
                      <>
                        {renderText(msg.text, msg.role === "ai")}
                        {msg.streaming && (
                          <span style={{
                            display: "inline-block",
                            width: "2px",
                            height: "12px",
                            background: "#b8ff57",
                            marginLeft: "2px",
                            verticalAlign: "middle",
                            animation: "chatPulse 0.8s ease-in-out infinite",
                          }} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ borderTop: "1px solid rgba(184,255,87,0.15)", flexShrink: 0, position: "relative" }}>

          {/* Picker popup */}
          {pickerOpen && (
            <div ref={pickerRef} style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: "12px",
              width: "320px",
              background: "#13131a",
              border: "1px solid rgba(184,255,87,0.22)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.7)",
              zIndex: 10,
            }}>
              <div style={{
                padding: "8px 12px",
                borderBottom: "1px solid rgba(184,255,87,0.1)",
                fontFamily: "var(--mono)", fontSize: "9px",
                letterSpacing: "0.2em", color: "rgba(184,255,87,0.3)",
                textTransform: "uppercase",
              }}>
                {"// select model + persona"}
              </div>
              {(Object.entries(PROVIDERS) as [Provider, ProviderConfig][]).map(([key, p]) => (
                <div
                  key={key}
                  onClick={() => selectProvider(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 12px", cursor: "pointer",
                    borderBottom: "1px solid rgba(184,255,87,0.05)",
                    background: provider === key ? "rgba(184,255,87,0.05)" : "transparent",
                    transition: "background 0.1s",
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: p.dot, boxShadow: `0 0 5px ${p.dot}`,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "#b8ff57" }}>
                        {p.model}
                      </span>
                      <span style={{
                        fontFamily: "var(--mono)", fontSize: "8px",
                        padding: "0 4px",
                        border: `1px solid ${p.color}44`,
                        color: p.color,
                        background: `${p.color}11`,
                        borderRadius: "2px",
                      }}>
                        {p.tone}
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "rgba(184,255,87,0.4)" }}>
                      {p.label} · {p.region}
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "rgba(184,255,87,0.3)", flexShrink: 0 }}>
                    {p.cost}
                  </span>
                  {provider === key && (
                    <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "#b8ff57", flexShrink: 0 }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <div style={{ display: "flex", alignItems: "flex-start", padding: "10px 12px 6px", gap: "8px" }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ask anything about Trupti, or say 'book a call'..."
              disabled={loading}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#b8ff57", fontFamily: "var(--mono)", fontSize: "13px",
                resize: "none", lineHeight: 1.6, caretColor: "#b8ff57",
                paddingTop: "2px", opacity: loading ? 0.5 : 1,
              }}
            />
          </div>

          {/* Bottom bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "4px 12px 10px",
          }}>
            {/* Model chip */}
            <button
              onClick={() => setPickerOpen((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "3px 9px 3px 7px",
                border: `1px solid ${pickerOpen ? "rgba(184,255,87,0.3)" : "rgba(184,255,87,0.18)"}`,
                background: pickerOpen ? "rgba(184,255,87,0.07)" : "rgba(184,255,87,0.03)",
                cursor: "pointer", fontFamily: "var(--mono)", fontSize: "10px",
                color: "rgba(184,255,87,0.6)", letterSpacing: "0.05em",
                transition: "all 0.15s",
              }}
              aria-label="Select AI provider"
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}`,
              }} />
              <span style={{ color: "#b8ff57" }}>{cfg.model}</span>
              <span style={{ color: "rgba(184,255,87,0.3)", margin: "0 2px" }}>·</span>
              <span style={{ color: cfg.color, fontSize: "9px" }}>{cfg.label}</span>
              <span style={{ color: "rgba(184,255,87,0.3)", margin: "0 2px" }}>·</span>
              <span style={{
                fontSize: "8px", padding: "0 3px",
                border: `1px solid ${cfg.color}44`,
                color: cfg.color,
                background: `${cfg.color}11`,
              }}>
                {cfg.tone}
              </span>
              <span style={{ fontSize: "8px", color: "rgba(184,255,87,0.3)", marginLeft: "4px" }}>
                {pickerOpen ? "⌄" : "⌃"}
              </span>
            </button>

            {/* Send button */}
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: 28, height: 28,
                background: input.trim() && !loading ? "#b8ff57" : "transparent",
                border: input.trim() && !loading ? "none" : "1px solid rgba(184,255,87,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() && !loading ? "pointer" : "default",
                flexShrink: 0, transition: "all 0.15s",
              }}
              aria-label="Send message"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && !loading ? "#060608" : "rgba(184,255,87,0.3)"}
                strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <p style={{
        fontFamily: "var(--mono)", fontSize: "9px",
        color: "rgba(184,255,87,0.2)", marginTop: "8px",
        letterSpacing: "0.1em", textAlign: "right",
      }}>
        Azure = Professional · AWS = Engineer · GCP = Strategist
      </p>

      <style>{`
        @keyframes chatPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .chat-ellipsis { display: inline-block; overflow: hidden; vertical-align: bottom; animation: chatDots 1.2s steps(4, end) infinite; width: 0; }
        @keyframes chatDots { 0%{width:0} 25%{width:0.5em} 50%{width:1em} 75%{width:1.5em} 100%{width:0} }
        #chat div[style*="overflow-y: auto"]::-webkit-scrollbar { display: none; }
        #chat textarea::placeholder { color: rgba(184,255,87,0.2); }
      `}</style>
    </div>
  );
}
