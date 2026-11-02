// Single source of portfolio copy: the homepage and every /lab concept render from it.

export const PROFILE = {
  first: "Trupti",
  last: "Pandya",
  role: "LLM Engineer & Generative AI Specialist",
  line: "Junior AI Engineer @ Zenithive · MSc Cloud Computing · Leicester, UK",
  status: "AVAILABLE · 26Q2",
  cv: "/Trupti_Pandya_CV.pdf",
};

export const STATS = [
  { num: "04", label: "shipped RAG products" },
  { num: "06", label: "stack domains" },
  { num: "∞", label: "eval loops run" },
];

export const ABOUT = {
  headline: ["Builder of", "intelligent", "systems."],
  tags: ["RAG", "Evals", "Responsible AI", "UX"],
  pullquote:
    "Shipping production-grade GenAI products at the intersection of rigorous engineering and intuitive design.",
  body: [
    "MSc Cloud Computing graduate from the University of Leicester — I don't just build LLM wrappers. I architect systems: RAG pipelines with measurable retrieval precision, evaluation loops that catch hallucinations, and UX layers that make AI accessible to the people who need it.",
    "My design background is the unfair advantage — it means I speak both the language of engineers and the language of users.",
  ],
  signature: "— T.P., Leicester, 26Q2",
};

export type Skill = {
  id: string;
  label: string;
  title: string;
  chips: string[];
  bars: [string, number][];
};

export const SKILLS: Skill[] = [
  {
    id: "llm", label: "LLM & GenAI", title: "LLM & Generative AI",
    chips: ["Prompt Engineering", "RAG Pipelines", "LangChain", "LlamaIndex", "Tool Calling", "Guardrails", "Context Window Design", "Output Validation"],
    bars: [["Prompt Engineering", 92], ["RAG Architecture", 88], ["LangChain", 80], ["LlamaIndex", 75]],
  },
  {
    id: "vector", label: "Vector & Retrieval", title: "Vector & Retrieval",
    chips: ["Pinecone", "Chroma", "FAISS", "Semantic Search", "Embedding Pipelines", "Chunking Strategies"],
    bars: [["Pinecone", 85], ["Semantic Search", 88], ["Chroma / FAISS", 78]],
  },
  {
    id: "eval", label: "Evaluation", title: "Evaluation & Responsible AI",
    chips: ["DeepEval", "Langfuse", "Bias Detection", "Hallucination Detection", "HITL Review", "Safety Guardrails", "Model Transparency"],
    bars: [["DeepEval", 82], ["Hallucination Detection", 87], ["Responsible AI Design", 90]],
  },
  {
    id: "code", label: "Languages", title: "Languages & Frameworks",
    chips: ["Python", "TypeScript", "JavaScript", "React", "Next.js", "REST APIs"],
    bars: [["Python", 90], ["TypeScript", 82], ["React / Next.js", 78]],
  },
  {
    id: "cloud", label: "Cloud & Infra", title: "Cloud & Infrastructure",
    chips: ["Azure", "AWS", "Docker", "CI/CD", "Static Web Apps", "CDN"],
    bars: [["Azure", 80], ["AWS Fundamentals", 65], ["CI/CD Pipelines", 72]],
  },
  {
    id: "design", label: "Design", title: "Design & Prototyping",
    chips: ["Figma", "Adobe Photoshop", "Illustrator", "UX/UI", "End-to-end Prototyping", "Component Libraries"],
    bars: [["Figma", 88], ["UX/UI Design", 83], ["Adobe Suite", 75]],
  },
];

export type Project = {
  num: string;
  label: string;
  name: string;
  href: string;
  desc: string;
  impact: string;
  stack: string[];
};

export const PROJECTS: Project[] = [
  {
    num: "01",
    label: "MSc Dissertation · 2025",
    name: "HireAI",
    href: "https://github.com/Trupti-Pandya/HireAI",
    desc: "An AI recruitment assistant that ingests CVs and job descriptions, generates semantic embeddings, and performs retrieval-augmented candidate-to-role matching. Multi-stage prompt pipeline with context design and output guardrails for auditable, grounded answers.",
    impact: "End-to-end RAG product demonstrating prompt engineering, vector retrieval, and responsible AI practices — aligned with enterprise LLM deployment.",
    stack: ["Next.js", "TypeScript", "RAG", "Vector DB", "DeepEval", "Auth", "Guardrails"],
  },
  {
    num: "02",
    label: "Full Stack GenAI · 2025",
    name: "Career Copilot",
    href: "https://github.com/Trupti-Pandya/Career-copilot",
    desc: "AI-driven career coaching platform using LLM orchestration to deliver personalised skill assessments, learning roadmaps, and job-fit recommendations. Multi-turn conversational flows with structured context management.",
    impact: "Demonstrates ability to orchestrate LLM workflows, apply responsible AI design, and communicate AI capabilities through intuitive UX.",
    stack: ["Next.js", "TypeScript", "LLM Orchestration", "Prompt Templates", "Session Mgmt"],
  },
  {
    num: "03",
    label: "Healthcare AI · 2026",
    name: "NurseChat",
    href: "https://github.com/Trupti-Pandya/Nursechat",
    desc: "Medical screening assistant chatbot that guides patients through structured triage questions and recommends appropriate hospital wards. RAG-powered retrieval surfaces hospital-specific clinical guidance, while nurses retain full oversight and authority to override any suggestion.",
    impact: "Responsible AI in a high-stakes healthcare context — grounded responses, human-in-the-loop control, and domain-specific RAG in a safety-critical workflow where accuracy and auditability are non-negotiable.",
    stack: ["Python", "RAG", "FAISS", "LLM", "Healthcare AI", "Responsible AI", "Streamlit"],
  },
  {
    num: "04",
    label: "GenAI · Security · 2026",
    name: "AI Forensic Assistant",
    href: "https://github.com/Trupti-Pandya/AI-Forensic-Investigation-Assistant",
    desc: "GenAI-powered digital forensics tool — investigators upload evidence files (logs, reports, metadata), ask natural-language questions, and receive RAG-grounded answers with automated timeline reconstruction, anomaly detection, and downloadable structured reports. Per-case isolated FAISS indexes prevent cross-case data leakage.",
    impact: "End-to-end RAG system with explainable findings, per-case conversation memory, and structured report generation — advanced prompt engineering in a domain demanding accuracy, citation, and full auditability.",
    stack: ["Python", "FastAPI", "RAG", "FAISS", "OpenAI", "Streamlit", "Anomaly Detection"],
  },
];

export type Role = {
  role: string;
  company: string;
  location: string;
  year: string;
  period: string;
  tags: string[];
  bullets: string[];
};

export const EXPERIENCE: Role[] = [
  {
    role: "Junior AI Engineer · Remote",
    company: "Zenithive",
    location: "Ahmedabad, India",
    year: "2026",
    period: "Oct 2025 – Apr 2026",
    tags: ["LangChain", "RAG", "FastAPI", "AWS", "Python"],
    bullets: [
      "Built and maintained production RAG pipelines (LangChain, Pinecone) for a multi-tenant document Q&A product — processing 1M+ tokens per ingestion run; iterated system prompts for GPT-4o and Claude 3.5 Sonnet, improving answer accuracy by 18% via DeepEval benchmarks across 200+ labelled queries.",
      "Engineered FastAPI LLM inference endpoints (auth, rate limiting, streaming) consumed by a Next.js frontend — reduced mean response latency by ~40% through async processing and context window optimisation; deployed to AWS ECS and Lambda via Docker and GitHub Actions CI/CD.",
      "Integrated FAISS and Chroma vector search with metadata filtering for hybrid retrieval; tuned cosine similarity thresholds to cut low-confidence retrievals by ~30%; achieved 74% pytest coverage across AI service modules.",
      "Used Cursor and Claude Code for autonomous refactoring of legacy prompt chains; prototyped dashboard UI with v0.dev — cutting build time by ~35%.",
    ],
  },
  {
    role: "UI/UX Intern",
    company: "LinearLoop",
    location: "Ahmedabad, India",
    year: "2023",
    period: "Jun 2023 – Aug 2023",
    tags: ["Figma", "Prototyping", "Design Systems"],
    bullets: [
      "Designed and prototyped user interfaces for client-facing web applications, developing strong intuition for human-centred product design — directly applicable to communicating AI system outputs.",
      "Collaborated with engineering teams to translate design requirements into functional specifications, building cross-functional communication skills relevant to LLM and product teams.",
      "Produced design assets in Figma, Adobe Photoshop, and Illustrator — contributed to a 25% reduction in design iteration cycles by establishing reusable component libraries.",
    ],
  },
];

export const IMPACT_METRICS = [
  { value: "1M+", label: "tokens per ingestion run" },
  { value: "+18%", label: "answer accuracy (DeepEval)" },
  { value: "−40%", label: "mean response latency" },
  { value: "−30%", label: "low-confidence retrievals" },
];

export const EDUCATION = [
  {
    tick: "MSc",
    degree: "Cloud Computing",
    uni: "University of Leicester, UK",
    period: "Sep 2024 – Jan 2026 · Merit",
    modules: "Cloud Architecture & Deployment · Distributed Systems · AI on Cloud · Cybersecurity · Big Data Infrastructure",
  },
  {
    tick: "BE",
    degree: "Information Technology",
    uni: "Kadi Sarva Vishwavidyalaya, India",
    period: "Jun 2020 – May 2024",
    modules: "Artificial Intelligence · Machine Learning · Database Systems · Web Technologies · Software Engineering",
  },
];

export type Credential = { img: string; name: string; issuer: string; verifyUrl: string; isNew?: boolean };

export const CREDENTIALS: Credential[] = [
  {
    img: "/e025dc93-9e1f-45dd-9793-92ee174175db.png",
    name: "Generative AI Fundamentals",
    issuer: "Databricks",
    verifyUrl: "https://credentials.databricks.com/9be6b0e2-0f56-4357-b9e9-4674eaf44bdc",
  },
  {
    img: "/ai-skills-fest-2026.png",
    name: "AI Skills Fest 2026",
    issuer: "Microsoft",
    verifyUrl: "https://www.credly.com/badges/05480688-6840-4753-8108-79cb62144901/public_url",
  },
  {
    img: "/agentic-ai-hackathon-2026.png",
    name: "Agentic AI Hackathon — AI Agent Master",
    issuer: "Microsoft Foundry",
    verifyUrl: "https://info.microsoft.com/rs/157-GQE-382/images/EN-WBNR-SlideDeck-SREVM91934-badge.pdf?version=0",
  },
  {
    img: "/nebius-ai-leader-2026.png",
    name: "Nebius AI Leader Certification",
    issuer: "Nebius Academy",
    verifyUrl: "https://www.credly.com/badges/6b5bb4de-d820-4738-b9f2-b5ba0fa890c3/public_url",
    isNew: true,
  },
  {
    img: "/nebius-agentic-ai-builder-2026.png",
    name: "Nebius Agentic AI Builder Certification",
    issuer: "Nebius Academy",
    verifyUrl: "https://www.credly.com/badges/72adb26a-7119-47c9-9a75-001da78ea895/public_url",
    isNew: true,
  },
];

export const CONTACT = {
  headline: ["Let's build", "something", "remarkable."],
  sub: "Open to AI/ML Engineer, MLOps, AI Infrastructure, and AI Product roles. Based in Leicester, UK — open to remote and hybrid arrangements globally.",
  facts: [
    ["response_time", "< 24h"],
    ["timezone", "GMT · flexible"],
    ["notice_period", "immediate"],
  ] as [string, string][],
};

export const CONTACTS = [
  { key: "email", value: "pandyatrupti531@gmail.com", href: "mailto:pandyatrupti531@gmail.com", cmd: "open ./email" },
  { key: "linkedin", value: "linkedin.com/in/trupti-pandya", href: "https://linkedin.com/in/trupti-pandya", cmd: "open ./linkedin" },
  { key: "github", value: "github.com/Trupti-Pandya", href: "https://github.com/Trupti-Pandya", cmd: "open ./github" },
];

export const CHAT_MOCK = [
  { from: "user", text: "What has Trupti shipped with RAG?" },
  { from: "bot", text: "Four RAG products — HireAI, Career Copilot, NurseChat and an AI Forensic Assistant — plus production pipelines at Zenithive that lifted answer accuracy 18%." },
] as const;

export const CHAT_PROMPTS = ["Book a call", "Show projects", "Download CV"];
