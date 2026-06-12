/**
 * Single source of truth for site-wide identity, SEO, and structured data.
 *
 * Canonical domain: search engines must not see the same content on two domains
 * (truptipandya.dev AND truptipandya.com) as separate — that splits ranking
 * authority. We pick ONE canonical here; the other 301-redirects into it
 * (see next.config.ts). To make .com primary later, change SITE_URL below (or
 * set NEXT_PUBLIC_SITE_URL) and flip the redirect direction in next.config.ts.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://truptipandya.dev"
).replace(/\/$/, "");

export const PROFILE = {
  name: "Trupti Pandya",
  firstName: "Trupti",
  lastName: "Pandya",
  jobTitle: "LLM Engineer & Generative AI Specialist",
  headline: "Junior AI Engineer @ Zenithive · MSc Cloud Computing · Leicester, UK",
  description:
    "Trupti Pandya is an LLM Engineer & Generative AI Specialist building production-grade GenAI products — RAG pipelines, evaluation loops, and responsible-AI systems — at the intersection of rigorous engineering and intuitive design.",
  email: "pandyatrupti531@gmail.com",
  locality: "Leicester",
  country: "United Kingdom",
  employer: "Zenithive",
  alumniOf: "University of Leicester",
  github: "https://github.com/Trupti-Pandya",
  linkedin: "https://linkedin.com/in/trupti-pandya",
  /** knowsAbout — feeds JSON-LD + keywords; the vocabulary LLMs associate with her. */
  expertise: [
    "Large Language Models",
    "Generative AI",
    "Prompt Engineering",
    "Retrieval-Augmented Generation (RAG)",
    "Vector Databases",
    "Semantic Search",
    "LangChain",
    "LlamaIndex",
    "LLM Evaluation",
    "Responsible AI",
    "Hallucination Detection",
    "Python",
    "TypeScript",
    "Next.js",
    "FastAPI",
    "Azure",
    "AWS",
  ],
} as const;

export type Project = {
  name: string;
  url: string;
  description: string;
  date: string;
  keywords: string[];
};

export const PROJECTS: Project[] = [
  {
    name: "HireAI",
    url: "https://github.com/Trupti-Pandya/HireAI",
    description:
      "An AI recruitment assistant that ingests CVs and job descriptions, generates semantic embeddings, and performs retrieval-augmented candidate-to-role matching with output guardrails for auditable, grounded answers. MSc dissertation project.",
    date: "2025",
    keywords: ["RAG", "Vector DB", "DeepEval", "Next.js", "Guardrails"],
  },
  {
    name: "Career Copilot",
    url: "https://github.com/Trupti-Pandya/Career-copilot",
    description:
      "An AI-driven career coaching platform using LLM orchestration to deliver personalised skill assessments, learning roadmaps, and job-fit recommendations through multi-turn conversational flows.",
    date: "2025",
    keywords: ["LLM Orchestration", "Prompt Templates", "Next.js", "TypeScript"],
  },
  {
    name: "NurseChat",
    url: "https://github.com/Trupti-Pandya/Nursechat",
    description:
      "A medical screening assistant that guides patients through structured triage and recommends hospital wards using RAG-powered clinical guidance, with human-in-the-loop nurse oversight in a safety-critical workflow.",
    date: "2026",
    keywords: ["RAG", "FAISS", "Healthcare AI", "Responsible AI", "Python"],
  },
  {
    name: "AI Forensic Investigation Assistant",
    url: "https://github.com/Trupti-Pandya/AI-Forensic-Investigation-Assistant",
    description:
      "A GenAI-powered digital forensics tool where investigators query evidence files in natural language and receive RAG-grounded answers with timeline reconstruction, anomaly detection, and per-case isolated FAISS indexes preventing cross-case data leakage.",
    date: "2026",
    keywords: ["RAG", "FastAPI", "FAISS", "OpenAI", "Anomaly Detection"],
  },
];
