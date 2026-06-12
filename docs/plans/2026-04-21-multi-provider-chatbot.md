# Plan: Multi-Provider AI Chatbot
Date: 2026-04-21
Goal: Add a Cursor-style multi-provider AI chat section to the portfolio where visitors switch between Azure/AWS/GCP models via a chip in the input bar.
Architecture: Single Next.js API route (POST /api/chat) routes to the correct SDK based on `provider` param. ChatSection component manages all UI state.
Tech Stack: Next.js 16, React 19, TypeScript, @azure/openai, @aws-sdk/client-bedrock-runtime, @google/generative-ai
Dependencies: .env.local already populated with all API keys.

## File Map
| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/api/chat/route.ts` | Create | Unified API route — routes to Azure/AWS/GCP SDK |
| `src/components/ChatSection.tsx` | Create | Full chat UI: messages, model chip, picker popup |
| `src/app/page.tsx` | Modify | Import and render `<ChatSection />` before footer |
| `.env.local` | Modify | Add AZURE_OPENAI_DEPLOYMENT + AZURE_OPENAI_API_VERSION |
| `package.json` | Modify | Add 3 SDK dependencies |

---

## Tasks

### PHASE 1 — Install Dependencies

**Task 1.1 — Install the three AI SDKs**
```bash
cd /Users/shinchan/Desktop/Projects/portfolio4.0
npm install @azure/openai @aws-sdk/client-bedrock-runtime @google/generative-ai
```
Expected: package.json updated, no errors.

---

### PHASE 2 — Environment Variables

**Task 2.1 — Add missing Azure vars to `.env.local`**

Open `.env.local` and add these two lines (keep existing lines):
```env
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini-portfolio
AZURE_OPENAI_API_VERSION=2025-01-01-preview
```

Final `.env.local` should have all 7 vars:
```env
AZURE_OPENAI_KEY=<existing>
AZURE_OPENAI_ENDPOINT=https://portfolio-v2-ai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini-portfolio
AZURE_OPENAI_API_VERSION=2025-01-01-preview
GCP_GEMINI_KEY=<existing>
AWS_ACCESS_KEY_ID=<existing>
AWS_SECRET_ACCESS_KEY=<existing>
AWS_REGION=eu-west-2
```

---

### PHASE 3 — API Route

**Task 3.1 — Create `src/app/api/chat/route.ts`**

Create the file with this exact content:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "@azure/openai";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an AI assistant on Trupti Pandya's portfolio website.
Trupti is an LLM Engineer & Generative AI Specialist based in Leicester, UK.
MSc Cloud Computing (Merit) · University of Leicester · 2026.
Core skills: RAG pipelines, LangChain, LlamaIndex, prompt engineering, DeepEval, Langfuse, Python, TypeScript, Next.js, Azure OpenAI, AWS Bedrock, GCP Vertex AI.
Projects: HireAI (RAG-powered recruitment assistant — MSc dissertation), Career Copilot (AI-driven career coaching platform).
She is actively seeking AI/ML Engineering, LLM Engineer, or MLOps roles in the UK. Open to remote and hybrid. Full right to work in the UK.
Answer questions about Trupti concisely and professionally. Keep responses under 3 sentences unless more detail is clearly needed.
Do not answer questions unrelated to Trupti or the tech industry.`;

type Provider = "azure" | "aws" | "gcp";

async function callAzure(message: string): Promise<string> {
  const client = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_KEY!,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  });

  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT!,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ],
    max_tokens: 300,
  });

  return response.choices[0].message.content ?? "";
}

async function callAWS(message: string): Promise<string> {
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const body = JSON.stringify({
    messages: [
      {
        role: "user",
        content: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${message}` }],
      },
    ],
    inferenceConfig: { maxTokens: 300 },
  });

  const command = new InvokeModelCommand({
    modelId: "amazon.nova-micro-v1:0",
    body,
    contentType: "application/json",
    accept: "application/json",
  });

  const raw = await client.send(command);
  const decoded = JSON.parse(new TextDecoder().decode(raw.body));
  return decoded.output?.message?.content?.[0]?.text ?? "";
}

async function callGCP(message: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GCP_GEMINI_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(message);
  return result.response.text();
}

const handlers: Record<Provider, (msg: string) => Promise<string>> = {
  azure: callAzure,
  aws: callAWS,
  gcp: callGCP,
};

export async function POST(req: NextRequest) {
  try {
    const { message, provider } = await req.json() as { message: string; provider: Provider };

    if (!message || !provider) {
      return NextResponse.json({ error: "Missing message or provider" }, { status: 400 });
    }

    if (!handlers[provider]) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const reply = await handlers[provider](message);
    return NextResponse.json({ reply, provider });

  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
```

**Task 3.2 — Smoke test the API route**
```bash
npm run dev
```
Then in a new terminal:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Is Trupti available for hire?","provider":"azure"}'
```
Expected: `{"reply":"...","provider":"azure"}` with a real response.

Test GCP (free, instant):
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are Trupti skills?","provider":"gcp"}'
```

Test AWS:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me about HireAI","provider":"aws"}'
```

---

### PHASE 4 — ChatSection Component

**Task 4.1 — Create `src/components/ChatSection.tsx`**

```typescript
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
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  azure: {
    label: "Azure OpenAI",
    model: "gpt-4.1-mini",
    region: "uk-south",
    color: "#0078D4",
    dot: "rgba(0,120,212,0.9)",
    cost: "~£0.05/mo",
  },
  aws: {
    label: "AWS Bedrock",
    model: "Nova Micro",
    region: "eu-west-2",
    color: "#FF9900",
    dot: "rgba(255,153,0,0.9)",
    cost: "~£0.02/mo",
  },
  gcp: {
    label: "Google Cloud",
    model: "Gemini 1.5 Flash",
    region: "vertex-ai",
    color: "#4285F4",
    dot: "rgba(66,133,244,0.9)",
    cost: "Free",
  },
};

interface Message {
  role: "user" | "ai";
  text: string;
  provider?: Provider;
}

export default function ChatSection() {
  const [provider, setProvider] = useState<Provider>("azure");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! I'm Trupti's AI assistant. Ask me anything about her skills, projects, or experience — or switch models using the chip below.",
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
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, provider }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply || data.error || "No response.", provider },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Connection error. Please try again.", provider },
      ]);
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
      {/* Section marker */}
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
        Switch models in the input bar. Each response is labelled with its provider and region.
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
            // ai.assistant · multi-provider
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--mono)", fontSize: "9px", color: "rgba(184,255,87,0.3)" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#28c840", boxShadow: "0 0 4px #28c840", display: "inline-block" }} />
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
                {/* Avatar */}
                <div style={{
                  width: 22, height: 22, flexShrink: 0,
                  border: "1px solid rgba(184,255,87,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--mono)", fontSize: "8px",
                  color: "rgba(184,255,87,0.5)",
                }}>
                  {msg.role === "user" ? "U" : "AI"}
                </div>

                {/* Bubble */}
                <div style={{ maxWidth: "78%" }}>
                  {msg.role === "ai" && msgCfg && (
                    <div style={{
                      display: "inline-block",
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
                    </div>
                  )}
                  <div style={{
                    fontFamily: "var(--mono)",
                    fontSize: "12px",
                    lineHeight: 1.75,
                    padding: "8px 11px",
                    border: "1px solid",
                    borderColor: msg.role === "user"
                      ? "rgba(184,255,87,0.22)"
                      : "rgba(184,255,87,0.08)",
                    background: msg.role === "user"
                      ? "rgba(184,255,87,0.06)"
                      : "rgba(255,255,255,0.015)",
                    color: msg.role === "user"
                      ? "#b8ff57"
                      : "rgba(184,255,87,0.72)",
                  }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
              <div style={{
                width: 22, height: 22, flexShrink: 0,
                border: "1px solid rgba(184,255,87,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: "8px", color: "rgba(184,255,87,0.5)",
              }}>AI</div>
              <div style={{
                fontFamily: "var(--mono)", fontSize: "12px",
                padding: "8px 11px",
                border: "1px solid rgba(184,255,87,0.08)",
                color: "rgba(184,255,87,0.35)",
              }}>
                {cfg.label} is thinking
                <span style={{ animation: "ellipsis 1.2s steps(3,end) infinite" }}>...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          borderTop: "1px solid rgba(184,255,87,0.15)",
          flexShrink: 0,
          position: "relative",
        }}>
          {/* Picker popup */}
          {pickerOpen && (
            <div ref={pickerRef} style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: "12px",
              width: "280px",
              background: "#13131a",
              border: "1px solid rgba(184,255,87,0.22)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.7)",
              zIndex: 10,
            }}>
              <div style={{
                padding: "8px 12px",
                borderBottom: "1px solid rgba(184,255,87,0.1)",
                fontFamily: "var(--mono)",
                fontSize: "9px",
                letterSpacing: "0.2em",
                color: "rgba(184,255,87,0.3)",
                textTransform: "uppercase",
              }}>
                // select model
              </div>
              {(Object.entries(PROVIDERS) as [Provider, ProviderConfig][]).map(([key, p]) => (
                <div
                  key={key}
                  onClick={() => selectProvider(key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(184,255,87,0.05)",
                    background: provider === key ? "rgba(184,255,87,0.05)" : "transparent",
                    transition: "background 0.1s",
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: p.dot,
                    boxShadow: `0 0 5px ${p.dot}`,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "#b8ff57", marginBottom: "1px" }}>
                      {p.model}
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
              placeholder="ask anything about Trupti..."
              disabled={loading}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#b8ff57",
                fontFamily: "var(--mono)",
                fontSize: "13px",
                resize: "none",
                lineHeight: 1.6,
                caretColor: "#b8ff57",
                paddingTop: "2px",
                opacity: loading ? 0.5 : 1,
              }}
            />
          </div>

          {/* Bottom bar: chip + send */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 12px 10px",
          }}>
            {/* Model chip */}
            <button
              onClick={() => setPickerOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 9px 3px 7px",
                border: `1px solid ${pickerOpen ? "rgba(184,255,87,0.3)" : "rgba(184,255,87,0.18)"}`,
                background: pickerOpen ? "rgba(184,255,87,0.07)" : "rgba(184,255,87,0.03)",
                cursor: "pointer",
                fontFamily: "var(--mono)",
                fontSize: "10px",
                color: "rgba(184,255,87,0.6)",
                letterSpacing: "0.05em",
                transition: "all 0.15s",
              }}
              aria-label="Select AI provider"
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: cfg.dot,
                boxShadow: `0 0 4px ${cfg.dot}`,
              }} />
              <span style={{ color: "#b8ff57" }}>{cfg.model}</span>
              <span style={{ color: "rgba(184,255,87,0.3)", margin: "0 2px" }}>·</span>
              <span style={{ color: cfg.color, fontSize: "9px" }}>{cfg.label}</span>
              <span style={{ color: "rgba(184,255,87,0.3)", margin: "0 2px" }}>·</span>
              <span style={{ color: "rgba(184,255,87,0.3)", fontSize: "9px" }}>{cfg.region}</span>
              <span style={{ fontSize: "8px", color: "rgba(184,255,87,0.3)", marginLeft: "2px" }}>
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
                flexShrink: 0,
                transition: "all 0.15s",
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
        fontFamily: "var(--mono)",
        fontSize: "9px",
        color: "rgba(184,255,87,0.2)",
        marginTop: "8px",
        letterSpacing: "0.1em",
        textAlign: "right",
      }}>
        click the model chip to switch between Azure · AWS · GCP
      </p>

      <style>{`
        @keyframes ellipsis {
          0%   { content: '.'; }
          33%  { content: '..'; }
          66%  { content: '...'; }
        }
        div[style*="scrollbar-width"]::-webkit-scrollbar { display: none; }
        #chat textarea::placeholder { color: rgba(184,255,87,0.2); }
        #chat button:hover:not(:disabled) { opacity: 0.9; }
      `}</style>
    </div>
  );
}
```

---

### PHASE 5 — Wire into Page

**Task 5.1 — Add ChatSection to `src/app/page.tsx`**

Add the import at the top of the file (after existing imports):
```typescript
import ChatSection from "../components/ChatSection";
```

Find the footer div (search for `className="footer"`) and insert ChatSection + divider before it:
```tsx
      <div className="divider">
        <span className="divider-tag">//</span>
      </div>

      <ChatSection />

      {/* ── FOOTER ── */}
      <div className="footer">
```

Also update the nav links array from:
```tsx
{["about", "skills", "projects", "exp", "contact"].map((id) => (
```
to:
```tsx
{["about", "skills", "projects", "exp", "chat", "contact"].map((id) => (
```

---

### PHASE 6 — Verify

**Task 6.1 — Run dev server and test all three providers**
```bash
npm run dev
```
Open `http://localhost:3000`, scroll to the `ai.playground` section.

Checklist:
- [ ] Section renders with correct heading and subtext
- [ ] Default provider chip shows `gpt-4.1-mini · Azure OpenAI · uk-south`
- [ ] Click chip → picker opens with all 3 options
- [ ] Click AWS → chip updates to `Nova Micro · AWS Bedrock · eu-west-2`
- [ ] Click GCP → chip updates to `Gemini 1.5 Flash · Google Cloud · vertex-ai`
- [ ] Type a message, press Enter → loading state shows
- [ ] Response appears with correct provider badge
- [ ] Switch provider mid-conversation → next response tagged with new provider
- [ ] Send button activates only when input has text
- [ ] Picker closes when clicking outside

**Task 6.2 — Build check**
```bash
npm run build
```
Expected: no TypeScript errors, build succeeds.

---

### PHASE 7 — Deploy

**Task 7.1 — Add env vars to Vercel**
```
Vercel Dashboard → Project → Settings → Environment Variables
Add all 8 vars:
  AZURE_OPENAI_KEY
  AZURE_OPENAI_ENDPOINT
  AZURE_OPENAI_DEPLOYMENT
  AZURE_OPENAI_API_VERSION
  GCP_GEMINI_KEY
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_REGION
```

**Task 7.2 — Push to deploy**
```bash
git add src/app/api/chat/route.ts src/components/ChatSection.tsx src/app/page.tsx .env.local
git commit -m "feat: add multi-provider AI chatbot with Azure/AWS/GCP switching"
git push
```

---

## Known Gotchas

1. **Azure deployment name** — must exactly match what was deployed in Azure AI Foundry. Double-check in `oai.azure.com → Deployments`.
2. **AWS Nova Micro model ID** — `amazon.nova-micro-v1:0` is the exact Bedrock model ID. If it fails, check the Bedrock console for the available model ID in `eu-west-2`.
3. **API version** — if Azure returns a 404, try `2024-12-01-preview` instead of `2025-01-01-preview`.
4. **Never commit `.env.local`** — it's in `.gitignore` by default in Next.js. Vercel env vars are set separately.
