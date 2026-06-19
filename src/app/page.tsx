"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import ChatWidget from "../components/ChatWidget";

// brand marks (outline style) rendered as faded watermarks behind each contact link
const ICON_SVG = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const CONTACT_ICONS: Record<string, React.ReactNode> = {
  email: (
    <svg viewBox="0 0 24 24" {...ICON_SVG} aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" {...ICON_SVG} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" {...ICON_SVG} aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  ),
};

const SKILLS_DATA = [
  {
    id: "llm", label: "LLM & GenAI", title: "LLM & Generative AI",
    chips: ["Prompt Engineering","RAG Pipelines","LangChain","LlamaIndex","Tool Calling","Guardrails","Context Window Design","Output Validation"],
    bars: [["Prompt Engineering", 92], ["RAG Architecture", 88], ["LangChain", 80], ["LlamaIndex", 75]] as [string, number][],
  },
  {
    id: "vector", label: "Vector & Retrieval", title: "Vector & Retrieval",
    chips: ["Pinecone","Chroma","FAISS","Semantic Search","Embedding Pipelines","Chunking Strategies"],
    bars: [["Pinecone", 85], ["Semantic Search", 88], ["Chroma / FAISS", 78]] as [string, number][],
  },
  {
    id: "eval", label: "Evaluation", title: "Evaluation & Responsible AI",
    chips: ["DeepEval","Langfuse","Bias Detection","Hallucination Detection","HITL Review","Safety Guardrails","Model Transparency"],
    bars: [["DeepEval", 82], ["Hallucination Detection", 87], ["Responsible AI Design", 90]] as [string, number][],
  },
  {
    id: "code", label: "Languages", title: "Languages & Frameworks",
    chips: ["Python","TypeScript","JavaScript","React","Next.js","REST APIs"],
    bars: [["Python", 90], ["TypeScript", 82], ["React / Next.js", 78]] as [string, number][],
  },
  {
    id: "cloud", label: "Cloud & Infra", title: "Cloud & Infrastructure",
    chips: ["Azure","AWS","Docker","CI/CD","Static Web Apps","CDN"],
    bars: [["Azure", 80], ["AWS Fundamentals", 65], ["CI/CD Pipelines", 72]] as [string, number][],
  },
  {
    id: "design", label: "Design", title: "Design & Prototyping",
    chips: ["Figma","Adobe Photoshop","Illustrator","UX/UI","End-to-end Prototyping","Component Libraries"],
    bars: [["Figma", 88], ["UX/UI Design", 83], ["Adobe Suite", 75]] as [string, number][],
  },
];

function SplitChars({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {[...text].map((c, i) => (
        <span key={i} className="hn-ch" style={{ animationDelay: `${delay + i * 0.05}s` }}>
          {c === " " ? " " : c}
        </span>
      ))}
    </>
  );
}

function SecMarker({ num, label }: { num: string; label: string }) {
  return (
    <div className="sec-marker">
      <div className="sec-num">{num}</div>
      <div className="sec-line" />
      <div className="sec-label">{label}</div>
      <div className="sec-tick" aria-hidden="true" />
    </div>
  );
}

function DisplayH({ children, style, className = "", dataText }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  dataText?: string;
}) {
  return (
    <h2 className={`display-h ${className}`} style={style} data-text={dataText ?? ""}>
      {children}
    </h2>
  );
}

function ProjNumSlot({ num }: { num: string }) {
  const digits = ["9","8","7","6","5","4","3","2","1","0"];
  const prefix = num.slice(0, -1);
  return (
    <div className="proj-num">
      <span style={{ visibility: "hidden" }}>{num}</span>
      <div className="proj-num-reel" style={{ position: "absolute", top: 0, left: 0 }}>
        {digits.map((d) => <span key={d}>{prefix}{d}</span>)}
        <span>{num}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState("llm");
  const [reticle, setReticle] = useState({ x: 0, y: 0, vis: false });
  const [navUnderline, setNavUnderline] = useState({ l: 0, w: 0, show: false });

  const navLinksRef = useRef<HTMLDivElement>(null);
  const expPeriodRef = useRef<HTMLDivElement>(null);
  const expAnimated = useRef(false);
  const expPeriodRef2 = useRef<HTMLDivElement>(null);
  const expAnimated2 = useRef(false);

  /* ── parallax for chat widget on mobile/tablet ── */
  const heroRightRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: terminalScroll } = useScroll({
    target: heroRightRef,
    offset: ["start end", "start 0.35"],
  });
  const tY = useTransform(terminalScroll, [0, 1], [120, 0]);
  const tOpacity = useTransform(terminalScroll, [0, 0.5], [0, 1]);
  const tScale = useTransform(terminalScroll, [0, 1], [0.9, 1]);

  /* ── reticle cursor ── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => setReticle({ x: e.clientX, y: e.clientY, vis: true });
    const onLeave = () => setReticle((r) => ({ ...r, vis: false }));
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    document.body.classList.add("cursor-crosshair");
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  /* ── scroll tracking: progress bar + active nav link ── */
  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(height > 0 ? top / height : 0);
      const ids = ["contact", "edu", "exp", "projects", "skills", "about"];
      let active = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) {
          active = id;
          break;
        }
      }
      setActiveSection(active);
      setMobileNavOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── nav underline slider ── */
  useEffect(() => {
    // Measures live DOM rects to position the nav underline — a legitimate
    // "sync with an external system" effect, so the synchronous setState is
    // intended here (not the cascading-render pattern the rule guards against).
    if (!navLinksRef.current || !activeSection) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNavUnderline((u) => ({ ...u, show: false }));
      return;
    }
    const link = navLinksRef.current.querySelector<HTMLAnchorElement>(`a[href="#${activeSection}"]`);
    if (!link) return;
    const linkRect = link.getBoundingClientRect();
    const parentRect = navLinksRef.current.getBoundingClientRect();
    setNavUnderline({ l: linkRect.left - parentRect.left, w: linkRect.width, show: true });
  }, [activeSection]);

  /* ── intersection observer: reveal + jitter + edu cards ── */
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in", "jitter");
          setTimeout(() => e.target.classList.remove("jitter"), 500);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

    const obs2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); obs2.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll(".edu-card").forEach((el) => obs2.observe(el));

    return () => { obs.disconnect(); obs2.disconnect(); };
  }, []);

  /* ── experience year count-up ── */
  useEffect(() => {
    const el = expPeriodRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || expAnimated.current) return;
      expAnimated.current = true;
      el.classList.add("counting");
      const from = 2020, to = 2023, dur = 1200, start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.floor(from + (to - from) * eased));
        if (p < 1) requestAnimationFrame(tick);
        else { el.textContent = String(to); setTimeout(() => el.classList.remove("counting"), 400); }
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── experience year count-up: Zenithive ── */
  useEffect(() => {
    const el = expPeriodRef2.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || expAnimated2.current) return;
      expAnimated2.current = true;
      el.classList.add("counting");
      const from = 2025, to = 2026, dur = 1200, start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.floor(from + (to - from) * eased));
        if (p < 1) requestAnimationFrame(tick);
        else { el.textContent = String(to); setTimeout(() => el.classList.remove("counting"), 400); }
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── chip pop on click ── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const chip = (e.target as HTMLElement).closest(".chip") as HTMLElement | null;
      if (!chip) return;
      chip.classList.remove("popped");
      void chip.offsetWidth;
      chip.classList.add("popped");
      setTimeout(() => chip.classList.remove("popped"), 600);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const curSkill = SKILLS_DATA.find((s) => s.id === activeSkill) ?? SKILLS_DATA[0];

  return (
    <>
      {/* atmospheric grid background */}
      <div className="grid-bg" aria-hidden="true" />

      {/* floating binary columns */}
      <div className="floating-binary" aria-hidden="true">
        <div className="binary-col" style={{ left: "2%", animationDuration: "28s", animationDelay: "0s" }}>
          01001100&thinsp;01001100&thinsp;01001101
        </div>
        <div className="binary-col" style={{ left: "98%", animationDuration: "34s", animationDelay: "-10s" }}>
          10110010&thinsp;01010010&thinsp;01000001
        </div>
      </div>

      {/* scroll progress */}
      <div className="scroll-progress-bar" style={{ transform: `scaleX(${scrollProgress})` }} />

      {/* reticle cursor */}
      <div
        className="reticle"
        style={{ left: reticle.x, top: reticle.y, opacity: reticle.vis ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className="reticle-ring" />
        <div className="reticle-coord">
          X:{String(reticle.x).padStart(4, "0")} Y:{String(reticle.y).padStart(4, "0")}
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <nav>
        <div className="nav-id">
          <span>sys/</span>trupti_pandya<span>.llm</span>
        </div>
        <button
          className={`hamburger${mobileNavOpen ? " open" : ""}`}
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>
        <div
          ref={navLinksRef}
          className={`nav-links${mobileNavOpen ? " nav-open" : ""}${navUnderline.show ? " nav-active" : ""}`}
        >
          {["about", "skills", "projects", "exp", "contact"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeSection === id ? "active" : ""}
              onClick={() => setMobileNavOpen(false)}
            >
              {id}
            </a>
          ))}
          <span
            className="nav-underline"
            style={{ left: navUnderline.l, width: navUnderline.w }}
          />
        </div>
        <div className="nav-meta">
          <span className="nav-dot" />
          AVAILABLE · 26Q2
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-bg-text" aria-hidden="true">Pandya</div>
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="hero-left">
          <div className="prompt-line">
            initialising portfolio.exe<span className="blink" />
          </div>
          <h1 className="hero-name">
            <span className="line1"><SplitChars text="Trupti" delay={0.2} /></span>
            <span className="line2"><SplitChars text="Pandya" delay={0.55} /></span>
          </h1>
          <div className="hero-title">
            LLM Engineer &amp; Generative AI Specialist
            <br />
            Junior AI Engineer @ Zenithive · MSc Cloud Computing · Leicester, UK
          </div>
          <div className="hero-stats">
            <div className="hstat">
              <div className="hstat-num">04</div>
              <div className="hstat-lbl">shipped<br />RAG products</div>
            </div>
            <div className="hstat">
              <div className="hstat-num">06</div>
              <div className="hstat-lbl">stack<br />domains</div>
            </div>
            <div className="hstat">
              <div className="hstat-num">∞</div>
              <div className="hstat-lbl">eval<br />loops run</div>
            </div>
          </div>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-lime">run --projects ›</a>
            <a href="#contact" className="btn btn-ghost">./contact.sh</a>
          </div>
          {/* scroll indicator – fades out once user scrolls */}
          <div
            className="scroll-indicator"
            aria-hidden="true"
            style={{
              opacity: scrollProgress > 0.01 ? 0 : undefined,
              transition: "opacity 0.4s ease",
              pointerEvents: scrollProgress > 0.01 ? "none" : undefined,
            }}
          >
            <span>scroll</span>
            <div className="scroll-indicator-line" />
          </div>
        </div>
        <motion.div
          ref={heroRightRef}
          className="hero-right"
          style={{ y: tY, opacity: tOpacity, scale: tScale }}
        >
          <ChatWidget />
          <div className="hero-right-meta">
            <span>PRESS / TO CHAT</span>
            <span>MULTI-CLOUD AI</span>
          </div>
        </motion.div>
      </div>

      <div className="divider"><span className="divider-tag">{"//"}</span></div>

      {/* ── ABOUT ── */}
      <div className="section reveal" id="about">
        <SecMarker num="00" label="about.md" />
        <div className="about-grid">
          <div>
            <div className="about-eyebrow">Profile</div>
            <DisplayH dataText="Builder of intelligent systems.">
              Builder of<br /><em>intelligent</em><br />systems.
            </DisplayH>
            <div className="about-tags">
              <span className="atag">RAG</span>
              <span className="atag">Evals</span>
              <span className="atag">Responsible AI</span>
              <span className="atag">UX</span>
            </div>
          </div>
          <div className="about-body">
            <p className="pullquote">
              Shipping production-grade GenAI products at the intersection of rigorous engineering and intuitive design.
            </p>
            <p>
              MSc Cloud Computing graduate from the University of Leicester — I don&apos;t just build LLM wrappers. I architect systems: RAG pipelines with measurable retrieval precision, evaluation loops that catch hallucinations, and UX layers that make AI accessible to the people who need it.
            </p>
            <p>
              My design background is the unfair advantage — it means I speak both the language of engineers and the language of users.
            </p>
            <div className="about-signature">
              <div className="sig-line" />
              <span>— T.P., Leicester, 26Q2</span>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"><span className="divider-tag">{"//"}</span></div>

      {/* ── SKILLS ── */}
      <div className="section reveal" id="skills">
        <SecMarker num="01" label="capabilities.json" />
        <DisplayH dataText="Tech stack." style={{ marginBottom: "40px" }}>
          Tech<br /><em>stack.</em>
        </DisplayH>
        <div className="skills-layout">
          <div className="skills-sidebar">
            <div className="skills-sidebar-label">modules · {SKILLS_DATA.length}</div>
            {SKILLS_DATA.map((s, idx) => (
              <div
                key={s.id}
                className={`skills-nav-item${activeSkill === s.id ? " active" : ""}`}
                onClick={() => setActiveSkill(s.id)}
              >
                <span className="ind" />
                <span className="sn-idx">{String(idx).padStart(2, "0")}</span>
                <span className="sn-label">{s.label}</span>
                <span className="sn-arrow">›</span>
              </div>
            ))}
            <div className="skills-sidebar-foot">
              <span>last_compile</span>
              <span>26Q2</span>
            </div>
          </div>
          <div className="skills-main" key={curSkill.id}>
            <div className="skill-panel-top">
              <div className="skill-panel-id">module/{curSkill.id}</div>
              <div className="skill-panel-title">{curSkill.title}</div>
            </div>
            <div className="skill-chips">
              {curSkill.chips.map((c) => (
                <span key={c} className="chip">{c}</span>
              ))}
            </div>
            <div className="skill-bar-wrap">
              {curSkill.bars.map(([lbl, pct]) => (
                <div key={lbl} className="skill-bar-item">
                  <span className="skill-bar-label">{lbl}</span>
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill" style={{ width: pct + "%" }} />
                    <div className="skill-bar-ticks" aria-hidden="true">
                      {[...Array(10)].map((_, i) => <span key={i} />)}
                    </div>
                  </div>
                  <span className="skill-bar-pct">{pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="divider"><span className="divider-tag">{"//"}</span></div>

      {/* ── PROJECTS ── */}
      <div className="section reveal" id="projects">
        <SecMarker num="02" label="./projects" />
        <div className="projects-head">
          <DisplayH style={{ marginBottom: 0 }} dataText="Selected work.">
            Selected<br /><em>work.</em>
          </DisplayH>
          <div className="projects-head-meta">
            <div><span className="ph-k">count</span><span className="ph-v">04</span></div>
            <div><span className="ph-k">range</span><span className="ph-v">2025–26</span></div>
            <div><span className="ph-k">domain</span><span className="ph-v">GenAI</span></div>
          </div>
        </div>
        <div className="projects-wrap">
          {[
            {
              num: "01",
              label: "MSc Dissertation · 2025",
              name: "HireAI",
              href: "https://github.com/Trupti-Pandya/HireAI",
              desc: "An AI recruitment assistant that ingests CVs and job descriptions, generates semantic embeddings, and performs retrieval-augmented candidate-to-role matching. Multi-stage prompt pipeline with context design and output guardrails for auditable, grounded answers.",
              impact: "End-to-end RAG product demonstrating prompt engineering, vector retrieval, and responsible AI practices — aligned with enterprise LLM deployment.",
              stack: ["Next.js","TypeScript","RAG","Vector DB","DeepEval","Auth","Guardrails"],
            },
            {
              num: "02",
              label: "Full Stack GenAI · 2025",
              name: "Career Copilot",
              href: "https://github.com/Trupti-Pandya/Career-copilot",
              desc: "AI-driven career coaching platform using LLM orchestration to deliver personalised skill assessments, learning roadmaps, and job-fit recommendations. Multi-turn conversational flows with structured context management.",
              impact: "Demonstrates ability to orchestrate LLM workflows, apply responsible AI design, and communicate AI capabilities through intuitive UX.",
              stack: ["Next.js","TypeScript","LLM Orchestration","Prompt Templates","Session Mgmt"],
            },
            {
              num: "03",
              label: "Healthcare AI · 2026",
              name: "NurseChat",
              href: "https://github.com/Trupti-Pandya/Nursechat",
              desc: "Medical screening assistant chatbot that guides patients through structured triage questions and recommends appropriate hospital wards. RAG-powered retrieval surfaces hospital-specific clinical guidance, while nurses retain full oversight and authority to override any suggestion.",
              impact: "Responsible AI in a high-stakes healthcare context — grounded responses, human-in-the-loop control, and domain-specific RAG in a safety-critical workflow where accuracy and auditability are non-negotiable.",
              stack: ["Python","RAG","FAISS","LLM","Healthcare AI","Responsible AI","Streamlit"],
            },
            {
              num: "04",
              label: "GenAI · Security · 2026",
              name: "AI Forensic Assistant",
              href: "https://github.com/Trupti-Pandya/AI-Forensic-Investigation-Assistant",
              desc: "GenAI-powered digital forensics tool — investigators upload evidence files (logs, reports, metadata), ask natural-language questions, and receive RAG-grounded answers with automated timeline reconstruction, anomaly detection, and downloadable structured reports. Per-case isolated FAISS indexes prevent cross-case data leakage.",
              impact: "End-to-end RAG system with explainable findings, per-case conversation memory, and structured report generation — advanced prompt engineering in a domain demanding accuracy, citation, and full auditability.",
              stack: ["Python","FastAPI","RAG","FAISS","OpenAI","Streamlit","Anomaly Detection"],
            },
          ].map((p) => (
            <a key={p.num} href={p.href} target="_blank" rel="noopener noreferrer" className="proj">
              <div className="proj-num-col">
                <ProjNumSlot num={p.num} />
                <div className="proj-num-rule" />
              </div>
              <div className="proj-content">
                <div className="proj-label">{p.label}</div>
                <div className="proj-name">{p.name}</div>
                <p className="proj-desc">{p.desc}</p>
                <p className="proj-impact">&ldquo;{p.impact}&rdquo;</p>
                <div className="proj-stack">
                  {p.stack.map((s) => <span key={s} className="stack-tag">{s}</span>)}
                </div>
              </div>
              <div className="proj-aside">
                <div className="proj-thumb" aria-hidden="true">
                  <div className="proj-thumb-label">{p.name.toLowerCase()}.ui</div>
                  <div className="proj-thumb-grid">
                    {[...Array(9)].map((_, i) => <span key={i} />)}
                  </div>
                </div>
                <div className="proj-arrow">→</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="divider"><span className="divider-tag">{"//"}</span></div>

      {/* ── EXPERIENCE ── */}
      <div className="section reveal" id="exp">
        <SecMarker num="03" label="experience.log" />
        <DisplayH style={{ marginBottom: "40px" }} dataText="Where I've shipped.">
          Where I&apos;ve<br /><em>shipped.</em>
        </DisplayH>
        <div style={{ display: "flex", gap: "24px", marginBottom: "40px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--c-dim)", fontFamily: "var(--font-mono)" }}>roles</span>
            <span style={{ fontSize: "13px", color: "var(--c-accent)", fontFamily: "var(--font-mono)" }}>02</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--c-dim)", fontFamily: "var(--font-mono)" }}>latest</span>
            <span style={{ fontSize: "13px", color: "var(--c-accent)", fontFamily: "var(--font-mono)" }}>AI Engineer · Zenithive</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--c-dim)", fontFamily: "var(--font-mono)" }}>range</span>
            <span style={{ fontSize: "13px", color: "var(--c-accent)", fontFamily: "var(--font-mono)" }}>2023–2026</span>
          </div>
        </div>
        <div className="exp-wrap">
          <div className="exp-left">
            <div className="exp-meta">Junior AI Engineer · Remote</div>
            <div className="exp-co">Zenithive</div>
            <div className="exp-loc">Ahmedabad, India</div>
            <div ref={expPeriodRef2} className="exp-period-big">2026</div>
            <div className="exp-tags">
              <span>LangChain</span>
              <span>RAG</span>
              <span>FastAPI</span>
              <span>AWS</span>
              <span>Python</span>
            </div>
          </div>
          <div className="exp-right">
            <div className="exp-right-label">Impact log · Oct 2025 – Apr 2026</div>
            <ul className="exp-bullets">
              <li>
                Built and maintained production RAG pipelines (LangChain, Pinecone) for a multi-tenant document Q&amp;A product — processing <strong>1M+ tokens per ingestion run</strong>; iterated system prompts for GPT-4o and Claude 3.5 Sonnet, improving answer accuracy by <strong>18%</strong> via DeepEval benchmarks across 200+ labelled queries.
              </li>
              <li>
                Engineered FastAPI LLM inference endpoints (auth, rate limiting, streaming) consumed by a Next.js frontend — reduced mean response latency by <strong>~40%</strong> through async processing and context window optimisation; deployed to AWS ECS and Lambda via Docker and GitHub Actions CI/CD.
              </li>
              <li>
                Integrated FAISS and Chroma vector search with metadata filtering for hybrid retrieval; tuned cosine similarity thresholds to cut low-confidence retrievals by <strong>~30%</strong>; achieved <strong>74% pytest coverage</strong> across AI service modules.
              </li>
              <li>
                Used Cursor and Claude Code for autonomous refactoring of legacy prompt chains; prototyped dashboard UI with v0.dev — cutting build time by <strong>~35%</strong>.
              </li>
            </ul>
          </div>
        </div>

        <div className="divider" style={{ margin: "32px 0" }}><span className="divider-tag">{"//"}</span></div>

        <div className="exp-wrap">
          <div className="exp-left">
            <div className="exp-meta">UI/UX Intern</div>
            <div className="exp-co">LinearLoop</div>
            <div className="exp-loc">Ahmedabad, India</div>
            <div ref={expPeriodRef} className="exp-period-big">2023</div>
            <div className="exp-tags">
              <span>Figma</span>
              <span>Prototyping</span>
              <span>Design Systems</span>
            </div>
          </div>
          <div className="exp-right">
            <div className="exp-right-label">Impact log · Jun 2023 – Aug 2023</div>
            <ul className="exp-bullets">
              <li>
                Designed and prototyped user interfaces for client-facing web applications, developing strong intuition for human-centred product design — directly applicable to communicating AI system outputs.
              </li>
              <li>
                Collaborated with engineering teams to translate design requirements into functional specifications, building cross-functional communication skills relevant to LLM and product teams.
              </li>
              <li>
                Produced design assets in Figma, Adobe Photoshop, and Illustrator — contributed to a <strong>25% reduction</strong> in design iteration cycles by establishing reusable component libraries.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="divider"><span className="divider-tag">{"//"}</span></div>

      {/* ── EDUCATION ── */}
      <div className="section reveal" id="edu">
        <SecMarker num="04" label="education.txt" />
        <DisplayH style={{ marginBottom: "40px" }} dataText="Academic roots.">
          Academic<br /><em>roots.</em>
        </DisplayH>
        <div className="edu-grid">
          <div className="edu-card" data-year="2026">
            <div className="edu-tick">MSc</div>
            <div className="edu-deg">Cloud Computing</div>
            <div className="edu-uni">University of Leicester, UK</div>
            <div className="edu-year">Sep 2024 – Jan 2026 · Merit</div>
            <div className="edu-modules-label">modules</div>
            <div className="edu-modules">
              Cloud Architecture &amp; Deployment · Distributed Systems · AI on Cloud · Cybersecurity · Big Data Infrastructure
            </div>
            <svg className="edu-sparkline" viewBox="0 0 400 32" preserveAspectRatio="none">
              <path d="M0,24 L40,22 L70,18 L110,20 L150,14 L190,10 L230,12 L270,6 L310,8 L350,2 L400,4" />
            </svg>
          </div>
          <div className="edu-card" data-year="2024">
            <div className="edu-tick">BE</div>
            <div className="edu-deg">Information Technology</div>
            <div className="edu-uni">Kadi Sarva Vishwavidyalaya, India</div>
            <div className="edu-year">Jun 2020 – May 2024</div>
            <div className="edu-modules-label">modules</div>
            <div className="edu-modules">
              Artificial Intelligence · Machine Learning · Database Systems · Web Technologies · Software Engineering
            </div>
            <svg className="edu-sparkline" viewBox="0 0 400 32" preserveAspectRatio="none">
              <path d="M0,28 L50,22 L90,24 L130,16 L180,20 L220,12 L260,14 L300,8 L340,10 L400,6" />
            </svg>
          </div>
        </div>
        <div className="certs">
          <div className="certs-label">✓ Certifications</div>
          <div className="certs-wall">
            {[
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
            ].map((c) => (
              <a
                key={c.name}
                href={c.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-tile"
                aria-label={`${c.name} — verify credential on ${c.issuer}`}
              >
                <div className="cert-tile-art">
                  <Image src={c.img} alt={`${c.name} — ${c.issuer} badge`} width={104} height={104} className="cert-img" />
                </div>
                <div className="cert-tile-info">
                  <div className="cert-tile-name">{c.name}</div>
                  <div className="cert-tile-issuer">{c.issuer}</div>
                  <span className="cert-tile-verify">Verify ↗</span>
                </div>
              </a>
            ))}
          </div>
          <div className="certs-more">▸ more credentials in progress<span className="certs-cursor">_</span></div>
        </div>
      </div>

      <div className="divider"><span className="divider-tag">{"//"}</span></div>

      {/* ── CONTACT ── */}
      <div className="section reveal" id="contact">
        <SecMarker num="05" label="contact.sh" />
        <div className="contact-split">
          <div>
            <h2 className="contact-big">
              Let&apos;s build<br />something<br /><em>remarkable.</em>
            </h2>
            <p className="contact-sub">
              Open to AI/ML Engineer, MLOps, AI Infrastructure, and AI Product roles. Based in Leicester, UK — open to remote and hybrid arrangements globally.
            </p>
            <div className="contact-avail">
              <div className="ca-row"><span>response_time</span><span>&lt; 24h</span></div>
              <div className="ca-row"><span>timezone</span><span>GMT · flexible</span></div>
              <div className="ca-row"><span>notice_period</span><span>immediate</span></div>
            </div>
          </div>
          <div className="contact-links">
            {[
              ["email", "pandyatrupti531@gmail.com", "mailto:pandyatrupti531@gmail.com", "open ./email"],
              ["linkedin", "linkedin.com/in/trupti-pandya", "https://linkedin.com/in/trupti-pandya", "open ./linkedin"],
              ["github", "github.com/Trupti-Pandya", "https://github.com/Trupti-Pandya", "open ./github"],
            ].map(([k, v, h, cmd]) => (
              <a
                key={k}
                href={h}
                target={h.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="clink"
                data-icon={k}
              >
                <div className="clink-main">
                  <div className="clink-label">{k}</div>
                  <div className="clink-val">{v}</div>
                </div>
                <div className="clink-aside">
                  <span className="clink-cmd">{cmd}</span>
                  <span className="clink-icon" aria-hidden="true">{CONTACT_ICONS[k]}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="divider"><span className="divider-tag">{"//"}</span></div>

      {/* ── FOOTER ── */}
      <div className="footer">
        <p>&copy; 2026 TRUPTI PANDYA · LLM ENGINEER</p>
        <div className="f-middle">PORTFOLIO-V2.1 · build 042026</div>
        <div className="f-status">
          <span className="f-dot" />
          AVAILABLE FOR HIRE
        </div>
      </div>
    </>
  );
}
