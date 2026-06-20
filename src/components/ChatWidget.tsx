"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AsciiArt } from "@/components/ui/ascii-art";

type Provider = "azure" | "aws" | "gcp";

interface ProviderConfig {
  label: string;
  model: string;
  region: string;
  color: string;
  dot: string;
  tone: string;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  azure: {
    label: "Azure OpenAI",
    model: "gpt-4.1-mini",
    region: "uk-south",
    color: "#c3f260",
    dot: "rgba(195,242,96,0.9)",
    tone: "Professional",
  },
  aws: {
    label: "AWS Bedrock",
    model: "Nova Lite",
    region: "eu-west-2",
    color: "#c3f260",
    dot: "rgba(195,242,96,0.9)",
    tone: "Engineer",
  },
  gcp: {
    label: "Google Cloud",
    model: "Gemini 2.5 Flash",
    region: "europe-west2",
    color: "#c3f260",
    dot: "rgba(195,242,96,0.9)",
    tone: "Strategist",
  },
};

const ACCENT = "#c3f260";        // matches homepage var(--accent) = oklch(0.9 0.18 125)
const ACCENT_RGB = "195, 242, 96";
const STORAGE_KEY = "tp_pa_msgs";
const MAX_STORED = 4; // last 2 user+AI pairs

// Shown when the model provider is unconfigured/unreachable, so the visitor
// never sees a silent empty bubble.
const UNAVAILABLE_MSG =
  "⚠ Sorry, the assistant is unavailable right now. Please try again shortly, or email Trupti directly at pandyatrupti531@gmail.com.";

const INITIAL_MSG = {
  role: "ai" as const,
  text: "Hi — I'm Trupti's PA. Ask me anything about her background, or say \"book a call\" and I'll arrange it.",
  provider: "azure" as Provider,
};

interface Message {
  role: "user" | "ai";
  text: string;
  provider?: Provider;
  streaming?: boolean;
}

function renderText(text: string, isAi: boolean) {
  if (!isAi) return <>{text}</>;

  const emailRegex = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g;
  const urlRegex = /(https?:\/\/[^\s<>"']+?)([.,!?;:'")\]]*(?:\s|$))/g;

  type Segment = { type: "text" | "email" | "url"; value: string; trailing?: string };
  const segments: Segment[] = [];
  const combined = new RegExp(`(${emailRegex.source})|(${urlRegex.source})`, "g");

  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = combined.exec(text)) !== null) {
    if (match.index > last) segments.push({ type: "text", value: text.slice(last, match.index) });
    if (match[1]) segments.push({ type: "email", value: match[1] });
    else if (match[2]) segments.push({ type: "url", value: match[3], trailing: match[4] ?? "" });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "email") return (
          <a key={i} href={`mailto:${seg.value}?subject=Hello Trupti`}
            style={{ color: ACCENT, borderBottom: `1px solid rgba(${ACCENT_RGB},0.4)`, textDecoration: "none" }}>
            {seg.value}
          </a>
        );
        if (seg.type === "url") return (
          <span key={i}>
            <a href={seg.value} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: ACCENT, borderBottom: `1px solid rgba(${ACCENT_RGB},0.4)`, textDecoration: "none" }}>
              {seg.value}
            </a>
            {seg.trailing}
          </span>
        );
        return <span key={i}>{seg.value}</span>;
      })}
    </>
  );
}

export default function ChatWidget() {
  const [provider, setProvider] = useState<Provider>("azure");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [fabBottom, setFabBottom] = useState(24);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [viewportTop, setViewportTop] = useState(0);
  // tracks whether we've loaded from storage (avoids overwriting storage on initial render)
  const hydratedRef = useRef(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ── responsive ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── restore last messages from localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: Message[] = JSON.parse(raw);
      const clean = parsed.filter(m => !m.streaming);
      // only restore if there's actual conversation beyond the initial greeting
      if (clean.length > 1) setMessages(clean);
    } catch { /* ignore corrupt storage */ }
    hydratedRef.current = true;
  }, []);

  /* ── persist messages to localStorage ── */
  useEffect(() => {
    if (!hydratedRef.current) return;
    const clean = messages.filter(m => !m.streaming);
    // don't persist if it's only the initial greeting
    if (clean.length <= 1) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean.slice(-MAX_STORED)));
    } catch { /* storage unavailable */ }
  }, [messages]);

  /* ── scroll chat to bottom on new messages ── */
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  /* ── track visualViewport so the modal fits above the keyboard on mobile ── */
  useEffect(() => {
    if (!chatOpen) { setViewportHeight(null); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      setViewportHeight(vv.height);
      setViewportTop(vv.offsetTop);
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
      });
    };
    onResize();
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, [chatOpen]);

  /* ── close picker on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  const closeChat = () => setChatOpen(false);
  const clearHistory = () => { setMessages([INITIAL_MSG]); localStorage.removeItem(STORAGE_KEY); };

  /* ── portal mount flag (avoids SSR document access) ── */
  useEffect(() => setMounted(true), []);

  /* ── floating bubble appears once the hero is scrolled past; it stays
        visible but parks just above the footer instead of overlapping it ── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.innerWidth < 1024 || window.scrollY > window.innerHeight * 0.7);
      const base = window.innerWidth < 768 ? 16 : 24; // matches .chat-fab CSS
      const footer = document.querySelector(".footer");
      if (footer) {
        const top = footer.getBoundingClientRect().top;
        // once the footer enters view, lift the bubble to sit 16px above it
        const liftedBottom = window.innerHeight - top + 16;
        setFabBottom(Math.max(base, liftedBottom));
      } else {
        setFabBottom(base);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ── global "/" opens the chat · Esc closes it ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (e.key === "/" && !chatOpen && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setChatOpen(true);
      } else if (e.key === "Escape" && chatOpen) {
        setChatOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  /* ── lock page scroll + focus the input while the modal is open ── */
  useEffect(() => {
    if (!chatOpen) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, [chatOpen]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    // Keep the caret in the input so the visitor can keep typing without
    // having to click back into the field after each message.
    inputRef.current?.focus();
    const userMsg: Message = { role: "user", text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);
    setMessages(prev => [...prev, { role: "ai", text: "", provider, streaming: true }]);

    const apiMessages = updatedMessages
      .filter(m => !(m.role === "ai" && m.text.startsWith("Hi — I'm Trupti")))
      .map(m => ({ role: m.role === "user" ? "user" : "assistant" as const, content: m.text }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, provider }),
      });
      if (res.status === 429) {
        setMessages(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.streaming) next[next.length - 1] = { role: "ai", text: "⚠ You're sending messages a little too quickly. Please wait a moment and try again.", provider };
          return next;
        });
        return;
      }
      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let bookingFailed = false;
      let streamError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.chunk) {
              accumulated += payload.chunk;
              setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.streaming) next[next.length - 1] = { ...last, text: accumulated };
                return next;
              });
            }
            if (payload.error) streamError = true;
            if (payload.booking === "failed") bookingFailed = true;
          } catch { /* partial line */ }
        }
      }
      // Never leave an empty bubble: if the stream errored (e.g. the model
      // provider is unconfigured/unreachable) or produced no text at all, show
      // an honest unavailable message instead of a blank box.
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.streaming) {
          next[next.length - 1] = streamError || !accumulated.trim()
            ? { role: "ai", text: UNAVAILABLE_MSG, provider }
            : { ...last, streaming: false };
        }
        return next;
      });

      // Surface a booking failure rather than letting the visitor believe the
      // request went through when it didn't.
      if (bookingFailed) {
        setMessages(prev => [
          ...prev,
          {
            role: "ai",
            text: "⚠ I wasn't able to submit that request to Trupti just now. Please email her directly at pandyatrupti531@gmail.com and she'll get back to you.",
            provider,
          },
        ]);
      }
    } catch {
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.streaming) next[next.length - 1] = { role: "ai", text: "Connection error. Please try again.", provider };
        return next;
      });
    } finally {
      setLoading(false);
      // Defensive: ensure the field is ready for the next message.
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const cfg = PROVIDERS[provider];
  // how many real conversation messages exist beyond the initial greeting
  const hasHistory = messages.filter(m => !m.streaming).length > 1;

  return (
    <>
    <div className="terminal-box" style={{ cursor: "default", flex: 1 }}>

      {/* ── Full background ASCII art — always visible, never changes ── */}
      <div
        className="ascii-bg-wrap"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          aspectRatio: "1 / 1",
          overflow: "hidden",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <AsciiArt
          src="/image.png"
          charset="dense"
          color={ACCENT}
          animated={false}
          animationStyle="none"
          resolution={isMobile ? 250 : 500}
          objectFit="cover"
          className="w-full h-full"
        />
      </div>

      {/* Bottom gradient for input legibility */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "22%",
        background: "linear-gradient(to top, rgba(6,6,8,0.9) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Foreground */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>

        {/* Greeting — always visible */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "18px 18px 0",
          overflow: "hidden",
        }}>
          <pre className="terminal-figlet" style={{ color: ACCENT, textShadow: `0 0 14px ${ACCENT}, 0 0 30px rgba(${ACCENT_RGB},0.3)` }}>
            {`  _    _ _   _______ _                   _ _\n | |  | (_) |__   __| |                 | | |\n | |__| |_     | |  | |__   ___ _ __ ___| | |\n |  __  | |    | |  | '_ \\ / _ \\ '__/ _ \\ | |\n | |  | | |    | |  | | | |  __/ | |  __/_|_|\n |_|  |_|_|    |_|  |_| |_|\\___|_|  \\___(_|_)`}
          </pre>
          <div className="terminal-hint" style={{ color: `rgba(${ACCENT_RGB},0.55)`, borderLeftColor: `rgba(${ACCENT_RGB},0.3)` }}>
            <span>ask my PA anything · or </span>
            <span style={{ color: ACCENT, textShadow: `0 0 6px ${ACCENT}` }}>book a call</span>
            <br />
            {hasHistory
              ? <span style={{ opacity: 0.5 }}>your last conversation is saved ·{" "}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={clearHistory}
                    onKeyDown={e => e.key === "Enter" && clearHistory()}
                    style={{ color: ACCENT, cursor: "pointer", textDecoration: "underline" }}>
                    clear
                  </span>
                </span>
              : <span style={{ opacity: 0.5 }}>open the chat to switch models &amp; tone</span>
            }
          </div>
        </div>

        {/* Launcher — replaces the old in-panel input bar; opens the chat modal */}
        <button
          type="button"
          className="chat-launcher"
          onClick={() => setChatOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={chatOpen}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: "var(--mono)", fontSize: "13px", color: `rgba(${ACCENT_RGB},0.6)`, minWidth: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 5px ${ACCENT}`, flexShrink: 0 }} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>ask about Trupti, or say &apos;book a call&apos;…</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "var(--mono)", fontSize: "11px", color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.4)`, padding: "6px 11px", letterSpacing: "0.05em", flexShrink: 0 }}>
            ▸ Chat with AI
          </span>
        </button>
      </div>

      <style>{`
        @keyframes chatPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .chat-ellipsis { display:inline-block;overflow:hidden;vertical-align:bottom;animation:chatDots 1.2s steps(4,end) infinite;width:0 }
        @keyframes chatDots { 0%{width:0} 25%{width:0.5em} 50%{width:1em} 75%{width:1.5em} 100%{width:0} }
        .terminal-figlet { font-family:var(--mono);font-size:9px;line-height:1.45;margin:0;white-space:pre;transform-origin:top left; }
        .terminal-hint { margin-top:12px;font-family:var(--mono);font-size:12px;line-height:1.9;border-left:1px solid;padding-left:10px; }
        textarea::placeholder { color: rgba(${ACCENT_RGB}, 0.35) !important; }
        div[style*="overflow-y"]::-webkit-scrollbar { display:none }
        @media (max-width:1024px) { .terminal-figlet { font-size:7.5px } }
        @media (max-width:768px) { .terminal-figlet { font-size:5.5px;line-height:1.4 } .terminal-hint { font-size:10px;margin-top:8px } }
        @media (max-width:480px) { .terminal-figlet { font-size:4px;line-height:1.35 } .terminal-hint { display:none } }

        /* ── on-demand chat: launcher, floating bubble, modal ── */
        .chat-launcher { margin-top:auto;width:100%;border:none;border-top:1px solid rgba(${ACCENT_RGB},0.14);
          background:rgba(6,6,8,0.92);display:flex;align-items:center;justify-content:space-between;gap:10px;
          padding:14px;cursor:pointer;text-align:left;transition:background .15s }
        .chat-launcher:hover { background:rgba(${ACCENT_RGB},0.06) }
        .chat-fab { position:fixed;right:24px;bottom:24px;z-index:880;display:inline-flex;align-items:center;gap:9px;
          background:${ACCENT};color:#060608;font-family:var(--mono);font-weight:600;font-size:12px;
          letter-spacing:0.04em;border:none;border-radius:0;padding:12px 16px;cursor:pointer;
          box-shadow:0 0 0 1px rgba(${ACCENT_RGB},0.45), 0 0 22px rgba(${ACCENT_RGB},0.28), 0 10px 30px rgba(0,0,0,0.55);
          opacity:0;transform:translateY(14px);pointer-events:none;
          transition:opacity .28s ease, transform .28s ease, box-shadow .18s ease }
        .chat-fab[data-show="true"] { opacity:1;transform:translateY(0);pointer-events:auto }
        .chat-fab[data-show="true"]:hover { transform:translateY(-2px);box-shadow:0 0 0 1px rgba(${ACCENT_RGB},0.7), 0 0 30px rgba(${ACCENT_RGB},0.45), 0 12px 34px rgba(0,0,0,0.6) }
        .chat-fab svg { display:block }
        .chat-scrim { position:fixed;inset:0;z-index:900;background:rgba(6,6,8,0.55);
          backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
          opacity:0;pointer-events:none;transition:opacity .3s }
        .chat-scrim[data-open="true"] { opacity:1;pointer-events:auto }
        .chat-modal { position:fixed;top:50%;left:50%;z-index:901;width:min(560px,92vw);height:min(620px,86vh);
          background:#0a0a0d;border:1px solid rgba(${ACCENT_RGB},0.25);box-shadow:0 24px 80px rgba(0,0,0,0.7);
          display:flex;flex-direction:column;overflow:hidden;opacity:0;pointer-events:none;
          transform:translate(-50%,-46%) scale(0.985);transition:opacity .32s ease, transform .32s ease }
        .chat-modal[data-open="true"] { opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1) }
        .chat-x { width:30px;height:30px;border:1px solid rgba(${ACCENT_RGB},0.3);background:rgba(${ACCENT_RGB},0.05);color:${ACCENT};
          font-size:14px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;
          flex-shrink:0;transition:background .15s }
        .chat-x:hover { background:rgba(${ACCENT_RGB},0.12) }
        @media (max-width:1024px) {
          .chat-modal { width:100vw;top:0;left:0;border:none;
            transform:none !important;
            padding-top:env(safe-area-inset-top, 0px) }
          .chat-modal[data-open="true"] { transform:none !important }
          .chat-fab { right:16px;bottom:16px;font-size:12px;padding:11px 15px }
          .chat-x { width:44px;height:44px;font-size:18px;border-color:rgba(${ACCENT_RGB},0.4);background:rgba(${ACCENT_RGB},0.08) }
        }
      `}</style>
    </div>

    {/* ── Floating bubble + chat modal — portalled to body so the hero transform doesn't anchor them ── */}
    {mounted && createPortal(
      <>
        <button
          type="button"
          className="chat-fab"
          data-show={scrolled && !chatOpen}
          style={{ bottom: fabBottom }}
          onClick={() => setChatOpen(true)}
          aria-label="Open chat with AI"
          aria-hidden={!(scrolled && !chatOpen)}
          tabIndex={scrolled && !chatOpen ? 0 : -1}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#060608" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z" />
          </svg>
          Chat with AI
        </button>

        <div className="chat-scrim" data-open={chatOpen} onClick={closeChat} aria-hidden="true" />

        <div className="chat-modal" data-open={chatOpen} role="dialog" aria-modal="true" aria-label="Chat with Trupti's AI assistant"
          style={isMobile && viewportHeight != null ? { height: viewportHeight, top: viewportTop } : undefined}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px 10px 14px", borderBottom: `1px solid rgba(${ACCENT_RGB},0.12)`, flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 4px ${ACCENT}`, display: "inline-block", animation: "chatPulse 2s ease-in-out infinite", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: `rgba(${ACCENT_RGB},0.4)`, letterSpacing: "0.12em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {"// "}pa.assistant · {cfg.model} · {cfg.label}
              </span>
              <span style={{
                fontFamily: "var(--mono)", fontSize: "7px", padding: "1px 4px",
                border: `1px solid ${cfg.color}55`, color: cfg.color, background: `${cfg.color}15`, borderRadius: "2px", flexShrink: 0,
              }}>{cfg.tone}</span>
            </div>
            <button type="button" className="chat-x" onClick={closeChat} aria-label="Close chat">✕</button>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} style={{
            flex: 1, overflowY: "auto", padding: "14px",
            scrollbarWidth: "none", display: "flex", flexDirection: "column", gap: "10px",
          }}>
            {messages.map((msg, i) => {
              const msgCfg = msg.provider ? PROVIDERS[msg.provider] : null;
              return (
                <div key={i} style={{
                  display: "flex", gap: "7px", alignItems: "flex-start",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}>
                  <div style={{
                    width: 18, height: 18, flexShrink: 0,
                    border: `1px solid rgba(${ACCENT_RGB},0.2)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--mono)", fontSize: "7px",
                    color: `rgba(${ACCENT_RGB},0.5)`,
                    background: "rgba(6,6,8,0.5)",
                  }}>
                    {msg.role === "user" ? "U" : "AI"}
                  </div>
                  <div style={{ maxWidth: "82%" }}>
                    {msg.role === "ai" && msgCfg && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        fontFamily: "var(--mono)", fontSize: "7px",
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        padding: "1px 5px", marginBottom: "3px",
                        border: `1px solid ${msgCfg.color}44`,
                        color: msgCfg.color, background: `${msgCfg.color}15`,
                      }}>
                        {msgCfg.label}
                        <span style={{
                          padding: "0 3px", background: `${msgCfg.color}25`,
                          border: `1px solid ${msgCfg.color}33`, borderRadius: "2px", fontSize: "6px",
                        }}>{msgCfg.tone}</span>
                      </div>
                    )}
                    <div style={{
                      fontFamily: "var(--mono)", fontSize: "13px", lineHeight: 1.7,
                      padding: "7px 11px",
                      border: "1px solid",
                      borderColor: msg.role === "user" ? `rgba(${ACCENT_RGB},0.25)` : `rgba(${ACCENT_RGB},0.1)`,
                      background: msg.role === "user" ? `rgba(${ACCENT_RGB},0.08)` : "rgba(255,255,255,0.04)",
                      color: msg.role === "user" ? ACCENT : "rgba(255,255,255,0.92)",
                    }}>
                      {msg.streaming && !msg.text ? (
                        <span style={{ color: `rgba(${ACCENT_RGB},0.4)` }}>
                          {cfg.label} is thinking<span className="chat-ellipsis">...</span>
                        </span>
                      ) : (
                        <>
                          {renderText(msg.text, msg.role === "ai")}
                          {msg.streaming && (
                            <span style={{
                              display: "inline-block", width: "2px", height: "11px",
                              background: ACCENT, marginLeft: "2px", verticalAlign: "middle",
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
          </div>

          {/* Input area */}
          <div style={{
            borderTop: `1px solid rgba(${ACCENT_RGB},0.18)`,
            background: "rgba(6,6,8,0.92)",
            flexShrink: 0,
            position: "relative",
          }}>
            {/* Provider picker popup */}
            {pickerOpen && (
              <div ref={pickerRef} style={{
                position: "absolute", bottom: "calc(100% + 4px)", left: "10px",
                width: "290px", background: "#0e0e14",
                border: `1px solid rgba(${ACCENT_RGB},0.22)`,
                boxShadow: "0 -8px 32px rgba(0,0,0,0.8)", zIndex: 20,
              }}>
                <div style={{
                  padding: "7px 11px", borderBottom: `1px solid rgba(${ACCENT_RGB},0.1)`,
                  fontFamily: "var(--mono)", fontSize: "8px",
                  letterSpacing: "0.2em", color: `rgba(${ACCENT_RGB},0.3)`, textTransform: "uppercase",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span>{"// select model"}</span>
                  <button
                    type="button"
                    aria-label="Close model selector"
                    onClick={() => { setPickerOpen(false); inputRef.current?.focus(); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 16, height: 16, padding: 0, cursor: "pointer",
                      background: "transparent", border: "none",
                      color: `rgba(${ACCENT_RGB},0.5)`, fontSize: "12px", lineHeight: 1,
                    }}
                  >✕</button>
                </div>
                {(Object.entries(PROVIDERS) as [Provider, ProviderConfig][]).map(([key, p]) => (
                  <div key={key} onClick={() => { setProvider(key); setPickerOpen(false); inputRef.current?.focus(); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "9px", padding: "9px 11px",
                      cursor: "pointer", borderBottom: `1px solid rgba(${ACCENT_RGB},0.06)`,
                      background: provider === key ? `rgba(${ACCENT_RGB},0.05)` : "transparent",
                    }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: p.dot, boxShadow: `0 0 6px ${p.dot}` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "#fff" }}>{p.label}</span>
                        <span style={{
                          fontFamily: "var(--mono)", fontSize: "7px", padding: "1px 4px",
                          border: `1px solid ${p.color}44`, color: p.color, background: `${p.color}15`, borderRadius: "2px",
                        }}>{p.tone}</span>
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: `rgba(${ACCENT_RGB},0.35)` }}>
                        {p.model} · {p.region}
                      </div>
                    </div>
                    {provider === key && <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: ACCENT }}>✓</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Text row */}
            <div style={{ display: "flex", alignItems: "flex-start", padding: "10px 12px 6px", gap: "7px" }}>
              {/* Not disabled while loading: keeps focus and lets the visitor
                  compose their next message while the AI is still replying.
                  Enter is gated on `loading` inside send(), so it won't double-fire. */}
              <textarea ref={inputRef} rows={1} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ask about Trupti, or say 'book a call'..."
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#fff", fontFamily: "var(--mono)", fontSize: "13px",
                  resize: "none", lineHeight: 1.55, caretColor: ACCENT,
                  paddingTop: "1px",
                }} />
            </div>

            {/* Chip + send row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 12px 9px" }}>
              <button onClick={() => setPickerOpen(v => !v)} style={{
                display: "flex", alignItems: "center", gap: "5px", padding: "3px 8px 3px 6px",
                border: `1px solid ${pickerOpen ? `rgba(${ACCENT_RGB},0.3)` : `rgba(${ACCENT_RGB},0.15)`}`,
                background: pickerOpen ? `rgba(${ACCENT_RGB},0.07)` : "transparent",
                cursor: "pointer", fontFamily: "var(--sans)", fontSize: "10px",
                color: `rgba(${ACCENT_RGB},0.5)`, letterSpacing: "0.03em", transition: "all 0.15s",
              }} aria-label="Select AI provider">
                <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }} />
                <span style={{ color: "#fff", fontWeight: 500 }}>{cfg.label}</span>
                <span style={{ color: `rgba(${ACCENT_RGB},0.25)`, margin: "0 1px" }}>·</span>
                <span style={{ fontSize: "7px", padding: "1px 4px", border: `1px solid ${cfg.color}44`, color: cfg.color, background: `${cfg.color}15`, borderRadius: "2px" }}>
                  {cfg.tone}
                </span>
                <span style={{ fontSize: "7px", color: `rgba(${ACCENT_RGB},0.25)`, marginLeft: "2px" }}>{pickerOpen ? "⌄" : "⌃"}</span>
              </button>

              <button onClick={send} disabled={!input.trim() || loading} style={{
                width: 26, height: 26,
                background: input.trim() && !loading ? ACCENT : "transparent",
                border: input.trim() && !loading ? "none" : `1px solid rgba(${ACCENT_RGB},0.18)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() && !loading ? "pointer" : "default", flexShrink: 0, transition: "all 0.15s",
              }} aria-label="Send message">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke={input.trim() && !loading ? "#060608" : `rgba(${ACCENT_RGB},0.3)`} strokeWidth="2.5">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </>,
      document.body
    )}
    </>
  );
}
