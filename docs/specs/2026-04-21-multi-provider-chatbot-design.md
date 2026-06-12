# Multi-Provider AI Chatbot — Design Spec
**Date:** 2026-04-21  
**Status:** Approved  

---

## What We're Building

A chat assistant embedded in the portfolio as a dedicated page section. Visitors can ask questions about Trupti and switch between three real hyperscaler AI providers using a Cursor-style model chip in the input bar.

---

## UI Pattern

**Cursor/Claude-style model selector in the input bar:**
- Bottom-left of the input: a clickable chip showing `● model-name · Provider · region`
- Click chip → compact picker floats above listing all 3 options
- Pick a provider → chip updates, next message routes to that provider
- Every AI response is tagged with a coloured provider badge

**Provider colour coding:**
- Azure = blue (`#0078D4`)
- AWS = orange (`#FF9900`)
- GCP = purple/blue (`#4285F4`)

---

## Page Section

Placed as section `06` after Education, before Footer.

```
sec-marker: 06 · ai.playground
heading: Chat with / my AI.
subtext: "Powered by three real hyperscaler APIs. Switch models in the input bar."
chat window (full width)
  └── messages area
  └── input bar
        └── model chip (bottom-left) + send button (bottom-right)
        └── picker popup (floats above on click)
```

---

## Providers & Models

| Provider | Model | Region | Est. Cost |
|----------|-------|--------|-----------|
| Azure OpenAI | gpt-4.1-mini | UK South | ~£0.05/mo |
| AWS Bedrock | Amazon Nova Micro | eu-west-2 (London) | ~£0.02/mo |
| GCP Vertex AI | Gemini 1.5 Flash | — | Free tier |

Default provider: **Azure** (strongest UK resume signal, shown first).

---

## Architecture

```
Frontend (Next.js)
  └── ChatSection component
        ├── messages state
        ├── selected provider state (default: azure)
        └── ModelChip + ModelPicker components

API Layer
  └── POST /api/chat
        ├── body: { message, provider }
        ├── routes to correct SDK based on provider
        │     ├── azure  → @azure/openai
        │     ├── aws    → @aws-sdk/client-bedrock-runtime
        │     └── gcp    → @google/generative-ai
        └── returns: { reply, provider, model, region }
```

Single unified API route — one endpoint, `provider` param selects the backend.

---

## System Prompt (shared across all providers)

```
You are an AI assistant on Trupti Pandya's portfolio website.
Trupti is an LLM Engineer & Generative AI Specialist based in Leicester, UK.
MSc Cloud Computing (Merit) · University of Leicester.
Skills: RAG pipelines, LangChain, LlamaIndex, prompt engineering, DeepEval, LangFuse, Python, TypeScript, Next.js, Azure, AWS.
Projects: HireAI (RAG recruitment assistant), Career Copilot (AI coaching platform).
She is actively seeking AI/ML Engineering roles in the UK. Open to remote and hybrid.

Answer questions about Trupti concisely and professionally.
Keep responses under 3 sentences unless more detail is clearly needed.
Do not answer questions unrelated to Trupti or the tech industry.
```

---

## Environment Variables

```env
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://portfolio-v2-ai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini-portfolio
AZURE_OPENAI_API_VERSION=2024-02-01

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-2

GCP_GEMINI_KEY=...
```

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/app/api/chat/route.ts` | Create — unified chat API route |
| `src/components/ChatSection.tsx` | Create — full chat UI with provider switching |
| `src/app/page.tsx` | Modify — add `<ChatSection />` before footer |
| `.env.local` | Already populated |
| `package.json` | Add 3 SDK dependencies |

---

## Out of Scope

- Chat history persistence (no DB)
- Streaming responses (standard fetch is fine for portfolio)
- Rate limiting (low traffic, not needed)
- Authentication
