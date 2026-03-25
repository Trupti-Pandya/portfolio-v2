"use client";

import { useEffect, useState } from "react";
import InteractiveTerminal from "../components/InteractiveTerminal";

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /* ── scroll tracking: progress bar + active nav link ── */
  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;
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

  /* ── skills tabs + intersection observer with stagger + skill bars ── */
  useEffect(() => {
    const handlers: Array<[Element, () => void]> = [];
    document.querySelectorAll(".skills-nav-item").forEach((item) => {
      const handler = () => {
        document
          .querySelectorAll(".skills-nav-item")
          .forEach((i) => i.classList.remove("active"));
        document
          .querySelectorAll(".skill-panel")
          .forEach((p) => p.classList.remove("active"));
        item.classList.add("active");
        const panelId = (item as HTMLElement).dataset.panel;
        if (panelId)
          document.getElementById("panel-" + panelId)?.classList.add("active");
      };
      item.addEventListener("click", handler);
      handlers.push([item, handler]);
    });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            // stagger children
            e.target
              .querySelectorAll(".stagger-child")
              .forEach((child, i) => {
                setTimeout(
                  () => (child as HTMLElement).classList.add("in"),
                  i * 120
                );
              });
            // skill bars
            if (e.target.id === "skills") {
              setTimeout(
                () => e.target.classList.add("skills-animated"),
                400
              );
            }
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

    return () => {
      handlers.forEach(([item, handler]) =>
        item.removeEventListener("click", handler)
      );
      obs.disconnect();
    };
  }, []);

  return (
    <>
      {/* atmospheric grid background */}
      <div className="grid-bg" aria-hidden="true" />

      {/* floating binary columns */}
      <div className="floating-binary" aria-hidden="true">
        <div
          className="binary-col"
          style={{
            left: "2%",
            animationDuration: "28s",
            animationDelay: "0s",
          }}
        >
          01001100&thinsp;01001100&thinsp;01001101
        </div>
        <div
          className="binary-col"
          style={{
            left: "98%",
            animationDuration: "34s",
            animationDelay: "-10s",
          }}
        >
          10110010&thinsp;01010010&thinsp;01000001
        </div>
      </div>

      {/* scroll progress */}
      <div
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

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
          <span />
          <span />
          <span />
        </button>
        <div className={`nav-links${mobileNavOpen ? " nav-open" : ""}`}>
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
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-bg-text">Pandya</div>
        <div className="hero-left">
          <div className="prompt-line">
            initialising portfolio.exe<span className="blink"></span>
          </div>
          <h1 className="hero-name">
            <span className="line1">Trupti</span>
            <span className="line2">Pandya</span>
          </h1>
          <div className="hero-title">
            LLM Engineer &amp; Generative AI Specialist
            <br />
            MSc Cloud Computing · Merit · Leicester, UK
          </div>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-lime">
              run --projects &rsaquo;
            </a>
            <a href="#contact" className="btn btn-ghost">
              ./contact.sh
            </a>
          </div>
        </div>
        <div className="hero-right">
          <InteractiveTerminal />
        </div>
      </div>

      <div className="divider">
        <span className="divider-tag">//</span>
      </div>

      {/* ── ABOUT ── */}
      <div className="section reveal" id="about">
        <div className="sec-marker">
          <div className="sec-num">00</div>
          <div className="sec-line"></div>
          <div className="sec-label">about.md</div>
        </div>
        <div className="about-grid">
          <div>
            <h2 className="display-h glitch-hover">
              Builder of
              <br />
              <em>intelligent</em>
              <br />
              systems.
            </h2>
          </div>
          <div>
            <p
              className="stagger-child"
              style={{
                fontSize: "16px",
                color: "var(--muted)",
                lineHeight: 1.9,
                fontFamily: "var(--courier)",
                marginBottom: "20px",
              }}
            >
              MSc Cloud Computing graduate from the University of Leicester —
              shipping production-grade GenAI products that sit at the
              intersection of rigorous engineering and intuitive design.
            </p>
            <p
              className="stagger-child"
              style={{
                fontSize: "16px",
                color: "var(--muted)",
                lineHeight: 1.9,
                fontFamily: "var(--courier)",
                marginBottom: "20px",
              }}
            >
              I don&apos;t just build LLM wrappers. I architect systems: RAG
              pipelines with measurable retrieval precision, evaluation loops
              that catch hallucinations, and UX layers that make AI accessible
              to the people who need it.
            </p>
            <p
              className="stagger-child"
              style={{
                fontSize: "16px",
                color: "var(--muted)",
                lineHeight: 1.9,
                fontFamily: "var(--courier)",
              }}
            >
              My design background is the unfair advantage — it means I speak
              both the language of engineers and the language of users.
            </p>
          </div>
        </div>
      </div>

      <div className="divider">
        <span className="divider-tag">//</span>
      </div>

      {/* ── SKILLS ── */}
      <div className="section reveal" id="skills">
        <div className="sec-marker">
          <div className="sec-num">01</div>
          <div className="sec-line"></div>
          <div className="sec-label">capabilities.json</div>
        </div>
        <h2
          className="display-h glitch-hover"
          style={{ marginBottom: "40px" }}
        >
          Tech
          <br />
          <em>stack.</em>
        </h2>
        <div className="skills-layout">
          <div className="skills-sidebar">
            <div className="skills-sidebar-label">modules</div>
            <div className="skills-nav-item active" data-panel="llm">
              <span className="ind"></span>LLM &amp; GenAI
            </div>
            <div className="skills-nav-item" data-panel="vector">
              <span className="ind"></span>Vector &amp; Retrieval
            </div>
            <div className="skills-nav-item" data-panel="eval">
              <span className="ind"></span>Evaluation
            </div>
            <div className="skills-nav-item" data-panel="code">
              <span className="ind"></span>Languages
            </div>
            <div className="skills-nav-item" data-panel="cloud">
              <span className="ind"></span>Cloud &amp; Infra
            </div>
            <div className="skills-nav-item" data-panel="design">
              <span className="ind"></span>Design
            </div>
          </div>
          <div className="skills-main">
            {/* LLM & GenAI */}
            <div className="skill-panel active" id="panel-llm">
              <div className="skill-panel-title">LLM &amp; Generative AI</div>
              <div className="skill-chips">
                <span className="chip">Prompt Engineering</span>
                <span className="chip">RAG Pipelines</span>
                <span className="chip">LangChain</span>
                <span className="chip">LlamaIndex</span>
                <span className="chip">Tool Calling</span>
                <span className="chip">Guardrails</span>
                <span className="chip">Context Window Design</span>
                <span className="chip">Output Validation</span>
              </div>
              <div className="skill-bar-wrap">
                <div className="skill-bar-item">
                  <span className="skill-bar-label">Prompt Engineering</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "92%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">92%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">RAG Architecture</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "88%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">88%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">LangChain</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "80%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">80%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">LlamaIndex</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "75%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">75%</span>
                </div>
              </div>
            </div>
            {/* Vector & Retrieval */}
            <div className="skill-panel" id="panel-vector">
              <div className="skill-panel-title">Vector &amp; Retrieval</div>
              <div className="skill-chips">
                <span className="chip">Pinecone</span>
                <span className="chip">Chroma</span>
                <span className="chip">FAISS</span>
                <span className="chip">Semantic Search</span>
                <span className="chip">Embedding Pipelines</span>
                <span className="chip">Chunking Strategies</span>
              </div>
              <div className="skill-bar-wrap">
                <div className="skill-bar-item">
                  <span className="skill-bar-label">Pinecone</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "85%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">85%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">Semantic Search</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "88%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">88%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">Chroma / FAISS</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "78%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">78%</span>
                </div>
              </div>
            </div>
            {/* Evaluation */}
            <div className="skill-panel" id="panel-eval">
              <div className="skill-panel-title">
                Evaluation &amp; Responsible AI
              </div>
              <div className="skill-chips">
                <span className="chip">DeepEval</span>
                <span className="chip">Langfuse</span>
                <span className="chip">Bias Detection</span>
                <span className="chip">Hallucination Detection</span>
                <span className="chip">HITL Review</span>
                <span className="chip">Safety Guardrails</span>
                <span className="chip">Model Transparency</span>
              </div>
              <div className="skill-bar-wrap">
                <div className="skill-bar-item">
                  <span className="skill-bar-label">DeepEval</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "82%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">82%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">
                    Hallucination Detection
                  </span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "87%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">87%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">
                    Responsible AI Design
                  </span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "90%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">90%</span>
                </div>
              </div>
            </div>
            {/* Languages */}
            <div className="skill-panel" id="panel-code">
              <div className="skill-panel-title">
                Languages &amp; Frameworks
              </div>
              <div className="skill-chips">
                <span className="chip">Python</span>
                <span className="chip">TypeScript</span>
                <span className="chip">JavaScript</span>
                <span className="chip">React</span>
                <span className="chip">Next.js</span>
                <span className="chip">REST APIs</span>
              </div>
              <div className="skill-bar-wrap">
                <div className="skill-bar-item">
                  <span className="skill-bar-label">Python</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "90%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">90%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">TypeScript</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "82%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">82%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">React / Next.js</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "78%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">78%</span>
                </div>
              </div>
            </div>
            {/* Cloud */}
            <div className="skill-panel" id="panel-cloud">
              <div className="skill-panel-title">
                Cloud &amp; Infrastructure
              </div>
              <div className="skill-chips">
                <span className="chip">Azure</span>
                <span className="chip">AWS</span>
                <span className="chip">Docker</span>
                <span className="chip">CI/CD</span>
                <span className="chip">Static Web Apps</span>
                <span className="chip">CDN</span>
              </div>
              <div className="skill-bar-wrap">
                <div className="skill-bar-item">
                  <span className="skill-bar-label">Azure</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "80%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">80%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">AWS Fundamentals</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "65%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">65%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">CI/CD Pipelines</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "72%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">72%</span>
                </div>
              </div>
            </div>
            {/* Design */}
            <div className="skill-panel" id="panel-design">
              <div className="skill-panel-title">
                Design &amp; Prototyping
              </div>
              <div className="skill-chips">
                <span className="chip">Figma</span>
                <span className="chip">Adobe Photoshop</span>
                <span className="chip">Illustrator</span>
                <span className="chip">UX/UI</span>
                <span className="chip">End-to-end Prototyping</span>
                <span className="chip">Component Libraries</span>
              </div>
              <div className="skill-bar-wrap">
                <div className="skill-bar-item">
                  <span className="skill-bar-label">Figma</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "88%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">88%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">UX/UI Design</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "83%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">83%</span>
                </div>
                <div className="skill-bar-item">
                  <span className="skill-bar-label">Adobe Suite</span>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ "--w": "75%" } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="skill-bar-pct">75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divider">
        <span className="divider-tag">//</span>
      </div>

      {/* ── PROJECTS ── */}
      <div className="section reveal" id="projects">
        <div className="sec-marker">
          <div className="sec-num">02</div>
          <div className="sec-line"></div>
          <div className="sec-label">./projects</div>
        </div>
        <h2 className="display-h glitch-hover" style={{ marginBottom: "0" }}>
          Selected
          <br />
          <em>work.</em>
        </h2>
        <div className="projects-wrap">
          <a
            href="https://github.com/Trupti-Pandya/HireAI"
            target="_blank"
            rel="noopener noreferrer"
            className="proj"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="proj-num">01</div>
            <div className="proj-content">
              <div className="proj-label">MSc Dissertation · 2025</div>
              <div className="proj-name">HireAI</div>
              <p className="proj-desc">
                An AI recruitment assistant that ingests CVs and job
                descriptions, generates semantic embeddings, and performs
                retrieval-augmented candidate-to-role matching. Multi-stage
                prompt pipeline with context design and output guardrails to
                ensure auditable, grounded answers — reducing hallucinated
                summaries at the source.
              </p>
              <p className="proj-impact">
                &quot;End-to-end RAG product demonstrating prompt engineering,
                vector retrieval, and responsible AI practices directly aligned
                with enterprise LLM deployment.&quot;
              </p>
              <div className="proj-stack">
                <span className="stack-tag">Next.js</span>
                <span className="stack-tag">TypeScript</span>
                <span className="stack-tag">RAG</span>
                <span className="stack-tag">Vector DB</span>
                <span className="stack-tag">DeepEval</span>
                <span className="stack-tag">Auth</span>
                <span className="stack-tag">Guardrails</span>
              </div>
            </div>
            <div className="proj-arrow">&rarr;</div>
          </a>
          <a
            href="https://github.com/Trupti-Pandya/Career-copilot"
            target="_blank"
            rel="noopener noreferrer"
            className="proj"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="proj-num">02</div>
            <div className="proj-content">
              <div className="proj-label">Full Stack GenAI · 2025</div>
              <div className="proj-name">Career Copilot</div>
              <p className="proj-desc">
                AI-driven career coaching platform using LLM orchestration to
                deliver personalised skill assessments, learning roadmaps, and
                job-fit recommendations. Multi-turn conversational flows with
                structured context management — tackling the hardest challenge
                in production LLM systems: coherence across long interactions.
              </p>
              <p className="proj-impact">
                &quot;Demonstrates ability to orchestrate LLM workflows, apply
                responsible AI design, and communicate AI capabilities through
                intuitive UX.&quot;
              </p>
              <div className="proj-stack">
                <span className="stack-tag">Next.js</span>
                <span className="stack-tag">TypeScript</span>
                <span className="stack-tag">LLM Orchestration</span>
                <span className="stack-tag">Prompt Templates</span>
                <span className="stack-tag">Session Mgmt</span>
              </div>
            </div>
            <div className="proj-arrow">&rarr;</div>
          </a>
        </div>
      </div>

      <div className="divider">
        <span className="divider-tag">//</span>
      </div>

      {/* ── EXPERIENCE ── */}
      <div className="section reveal" id="exp">
        <div className="sec-marker">
          <div className="sec-num">03</div>
          <div className="sec-line"></div>
          <div className="sec-label">experience.log</div>
        </div>
        <h2
          className="display-h glitch-hover"
          style={{ marginBottom: "40px" }}
        >
          Where I&apos;ve
          <br />
          <em>shipped.</em>
        </h2>
        <div className="exp-wrap">
          <div className="exp-left">
            <div className="exp-co">LinearLoop</div>
            <div className="exp-meta">UI/UX Intern</div>
            <div className="exp-loc">Ahmedabad, India</div>
            <div className="exp-period-big">2023</div>
          </div>
          <div className="exp-right">
            <ul className="exp-bullets">
              <li>
                Designed and prototyped user interfaces for client-facing web
                applications, developing strong intuition for human-centred
                product design — directly applicable to communicating AI system
                outputs to diverse user groups.
              </li>
              <li>
                Collaborated with engineering teams to translate design
                requirements into functional specifications, building
                cross-functional communication skills relevant to working
                alongside LLM and product teams.
              </li>
              <li>
                Produced design assets in Figma, Adobe Photoshop, and
                Illustrator — contributed to a 25% reduction in design iteration
                cycles by establishing reusable component libraries.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="divider">
        <span className="divider-tag">//</span>
      </div>

      {/* ── EDUCATION ── */}
      <div className="section reveal" id="edu">
        <div className="sec-marker">
          <div className="sec-num">04</div>
          <div className="sec-line"></div>
          <div className="sec-label">education.txt</div>
        </div>
        <h2
          className="display-h glitch-hover"
          style={{ marginBottom: "40px" }}
        >
          Academic
          <br />
          <em>roots.</em>
        </h2>
        <div className="edu-grid">
          <div className="edu-card" data-year="2026">
            <div className="edu-deg">MSc Cloud Computing</div>
            <div className="edu-uni">University of Leicester, UK</div>
            <div className="edu-year">Sep 2024 – Jan 2026 · Merit</div>
            <div className="edu-modules-label">modules</div>
            <div className="edu-modules">
              Cloud Architecture &amp; Deployment · Distributed Systems · AI on
              Cloud · Cybersecurity · Big Data Infrastructure
            </div>
          </div>
          <div className="edu-card" data-year="2024">
            <div className="edu-deg">BE Information Technology</div>
            <div className="edu-uni">
              Kadi Sarva Vishwavidyalaya, India
            </div>
            <div className="edu-year">Jun 2020 – May 2024</div>
            <div className="edu-modules-label">modules</div>
            <div className="edu-modules">
              Artificial Intelligence · Machine Learning · Database Systems · Web
              Technologies · Software Engineering
            </div>
          </div>
        </div>
        <div className="cert-strip">
          <div className="cert-strip-text">
            ✓ Certified · Databricks Academy — Generative AI Fundamentals
          </div>
          <div className="cert-strip-badge">Verified credential</div>
        </div>
      </div>

      <div className="divider">
        <span className="divider-tag">//</span>
      </div>

      {/* ── CONTACT ── */}
      <div className="section reveal" id="contact">
        <div className="sec-marker">
          <div className="sec-num">05</div>
          <div className="sec-line"></div>
          <div className="sec-label">contact.sh</div>
        </div>
        <div className="contact-split">
          <div>
            <h2 className="contact-big">
              Let&apos;s build
              <br />
              something
              <br />
              <em>remarkable.</em>
            </h2>
            <p className="contact-sub">
              Open to AI/ML Engineer, MLOps, AI Infrastructure, and AI Product
              roles. Based in Leicester, UK — open to remote and hybrid
              arrangements globally.
            </p>
          </div>
          <div className="contact-links">
            <a href="mailto:truptipandya21901@gmail.com" className="clink">
              <div>
                <div className="clink-label">email</div>
                <div className="clink-val">truptipandya21901@gmail.com</div>
              </div>
              <span className="clink-arr">&rarr;</span>
            </a>
            <a
              href="https://linkedin.com/in/trupti-pandya"
              target="_blank"
              className="clink"
            >
              <div>
                <div className="clink-label">linkedin</div>
                <div className="clink-val">
                  linkedin.com/in/trupti-pandya
                </div>
              </div>
              <span className="clink-arr">&rarr;</span>
            </a>
            <a
              href="https://github.com/Trupti-Pandya"
              target="_blank"
              className="clink"
            >
              <div>
                <div className="clink-label">github</div>
                <div className="clink-val">github.com/Trupti-Pandya</div>
              </div>
              <span className="clink-arr">&rarr;</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="footer">
        <p>&copy; 2026 TRUPTI PANDYA · LLM ENGINEER</p>
        <div className="f-status">
          <span className="f-dot"></span>AVAILABLE FOR HIRE
        </div>
      </div>
    </>
  );
}
