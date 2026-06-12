# Trupti's Projects

## HireAI — MSc Dissertation Project
**Type:** RAG-powered recruitment assistant  
**Status:** Active (MSc dissertation)  
**Stack:** Python, LangChain, LlamaIndex, Azure OpenAI, DeepEval, Langfuse, vector databases

HireAI is Trupti's flagship project and MSc dissertation. It's an AI-powered recruitment assistant that uses Retrieval-Augmented Generation to match candidates to job descriptions intelligently.

**What it does:**
- Ingests CVs and job descriptions, chunks and embeds them into a vector store
- At query time, retrieves the most semantically relevant context before generating a response
- Uses DeepEval for systematic evaluation of answer quality (faithfulness, relevancy, context precision)
- Tracks all LLM calls and latencies via Langfuse for observability

**Why it matters:** HireAI demonstrates the full RAG lifecycle — not just "build a chatbot" but define metrics, evaluate rigorously, monitor in production, and iterate. This is the work that separates LLM engineers from prompt wrappers.

**Key technical decisions:**
- Chose LlamaIndex for document ingestion pipeline due to its flexible node parser
- Used hybrid retrieval (BM25 + dense embeddings) for better recall on technical terminology
- Implemented custom DeepEval test cases for recruitment-specific evaluation criteria

---

## Career Copilot — AI-Driven Career Coaching Platform
**Type:** Full-stack AI application  
**Status:** Completed  
**Stack:** TypeScript, Next.js, Python, LangChain, Azure OpenAI / GCP Vertex AI

Career Copilot is an AI-driven platform that helps users navigate career transitions. It provides personalised coaching conversations grounded in the user's actual CV and target job descriptions.

**What it does:**
- Users upload their CV and a target job description
- The system generates gap analysis, interview prep questions, and tailored advice
- Multi-turn conversation with memory of the user's profile throughout the session
- Deployed on cloud infrastructure with proper authentication and rate limiting

**Key technical decisions:**
- LangChain for conversation memory and tool orchestration
- Azure OpenAI as primary LLM with GCP Vertex as fallback
- Next.js frontend with streaming responses for a responsive feel

---

## Portfolio Website (this site)
**Type:** Personal portfolio with live multi-cloud AI demo  
**Stack:** TypeScript, Next.js 16, React 19, Azure OpenAI, AWS Bedrock, GCP Gemini

The portfolio itself is a project. The chat section makes real API calls to three separate cloud AI providers simultaneously, demonstrating practical multi-cloud AI deployment. Each provider uses a different model and region:
- Azure OpenAI: gpt-4.1-mini deployed in UK South
- AWS Bedrock: Amazon Nova Lite in eu-west-2
- Google Cloud: Gemini 2.5 Flash Lite via Generative AI API
