"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  PROFILE, STATS, ABOUT, SKILLS, PROJECTS, EXPERIENCE, EDUCATION,
  CREDENTIALS, CONTACT, CONTACTS, CHAT_MOCK, CHAT_PROMPTS,
} from "@/lib/portfolio-content";
import s from "./RefinedSignal.module.css";

const SECTIONS = [
  { id: "about", label: "about" },
  { id: "skills", label: "stack" },
  { id: "projects", label: "work" },
  { id: "exp", label: "log" },
  { id: "contact", label: "contact" },
];

function SecHead({ num, file, title, accent }: { num: string; file: string; title: string; accent: string }) {
  return (
    <header className={s.secHead}>
      <div className={s.secMeta}><span>{num}</span><span className={s.secRule} /><span>{file}</span></div>
      <h2 className={s.h2}>{title} <em>{accent}</em></h2>
    </header>
  );
}

/** Static chat preview for the /lab demo; the homepage passes the live ChatWidget instead. */
export function ChatMock() {
  return (
    <figure className={s.chatMock} aria-label="Chat assistant preview (static mockup)">
      <figcaption className={s.chatHead}>
        <span className={s.dot} /> ask_trupti.ai <span className={s.chatTag}>mockup</span>
      </figcaption>
      {CHAT_MOCK.map((m) => (
        <p key={m.text} className={m.from === "user" ? s.msgUser : s.msgBot}>{m.text}</p>
      ))}
      <div className={s.chatChips}>
        {CHAT_PROMPTS.map((p) => <span key={p}>{p}</span>)}
      </div>
      <div className={s.chatInput} aria-hidden="true">Ask about RAG, evals, availability…<span>↵</span></div>
    </figure>
  );
}

/** Sized frame for the live ChatWidget in the hero's chat slot. */
export function LiveChatFrame({ children }: { children: ReactNode }) {
  return <div className={s.liveChat}>{children}</div>;
}

export default function RefinedSignal({ chat, banner }: { chat: ReactNode; banner?: ReactNode }) {
  const [active, setActive] = useState("");
  const [skill, setSkill] = useState(SKILLS[0].id);
  const cur = SKILLS.find((k) => k.id === skill) ?? SKILLS[0];

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className={s.page}>
      {banner}

      <div className={s.topbar}>
        <span className={s.brand}><span>sys/</span>trupti_pandya<span>.llm</span></span>
        <div className={s.deskLinks} role="navigation" aria-label="Sections">
          {SECTIONS.map((x) => (
            <a key={x.id} href={`#${x.id}`} className={active === x.id ? s.on : undefined}>{x.label}</a>
          ))}
        </div>
        <span className={s.status}><span className={s.dot} />{PROFILE.status}</span>
      </div>

      <main className={s.main}>
        {/* HERO */}
        <section className={s.hero} aria-labelledby="rs-name">
          <p className={s.prompt}>initialising portfolio.exe<span className={s.caret} aria-hidden="true" /></p>
          <h1 id="rs-name" className={s.name}>
            <span>{PROFILE.first}</span>
            <em>{PROFILE.last}</em>
          </h1>
          <p className={s.heroRole}>{PROFILE.role}</p>
          <p className={s.line}>{PROFILE.line}</p>

          <dl className={s.stats}>
            {STATS.map((x) => (
              <div key={x.label}><dt>{x.label}</dt><dd>{x.num}</dd></div>
            ))}
          </dl>

          <div className={s.cta}>
            <a href="#projects" className={s.btnLime}>run --projects ›</a>
            <a href={PROFILE.cv} target="_blank" rel="noopener noreferrer" className={s.btnGhost}>./resume.pdf ↗</a>
            <a href="#contact" className={s.btnGhost}>./contact.sh</a>
          </div>

          <div className={s.chat}>{chat}</div>
        </section>

        {/* ABOUT */}
        <section id="about" className={s.section}>
          <SecHead num="00" file="about.md" title={ABOUT.headline[0]} accent={`${ABOUT.headline[1]} ${ABOUT.headline[2]}`} />
          <blockquote className={s.quote}>{ABOUT.pullquote}</blockquote>
          {ABOUT.body.map((p) => <p key={p} className={s.body}>{p}</p>)}
          <ul className={s.tags}>{ABOUT.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className={s.sig}>{ABOUT.signature}</p>
        </section>

        {/* SKILLS */}
        <section id="skills" className={s.section}>
          <SecHead num="01" file="capabilities.json" title="Tech" accent="stack." />
          <div className={s.tabs} role="tablist" aria-label="Skill modules">
            {SKILLS.map((k, i) => (
              <button
                key={k.id}
                role="tab"
                id={`rs-tab-${k.id}`}
                aria-selected={skill === k.id}
                aria-controls="rs-skill-panel"
                className={s.tab}
                onClick={() => setSkill(k.id)}
              >
                <span>{String(i).padStart(2, "0")}</span>{k.label}
              </button>
            ))}
          </div>
          <div id="rs-skill-panel" role="tabpanel" aria-labelledby={`rs-tab-${cur.id}`} className={s.panel} key={cur.id}>
            <p className={s.panelId}>module/{cur.id}</p>
            <h3 className={s.panelTitle}>{cur.title}</h3>
            <ul className={s.chips}>{cur.chips.map((c) => <li key={c}>{c}</li>)}</ul>
            <ul className={s.bars}>
              {cur.bars.map(([lbl, pct]) => (
                <li key={lbl}>
                  <span className={s.barLbl}>{lbl}</span>
                  <span className={s.barTrack} aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
                  <span className={s.barPct}>{pct}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className={s.section}>
          <SecHead num="02" file="./projects" title="Selected" accent="work." />
          <ol className={s.projects}>
            {PROJECTS.map((p) => (
              <li key={p.num} className={s.proj}>
                <div className={s.projTop}>
                  <span className={s.projNum}>{p.num}</span>
                  <span className={s.projLabel}>{p.label}</span>
                </div>
                <h3 className={s.projName}>{p.name}</h3>
                <p className={s.projDesc}>{p.desc}</p>
                <details className={s.fold}>
                  <summary>impact</summary>
                  <p>&ldquo;{p.impact}&rdquo;</p>
                </details>
                <ul className={s.stack}>{p.stack.map((t) => <li key={t}>{t}</li>)}</ul>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className={s.projLink}>
                  view repo <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ol>
        </section>

        {/* EXPERIENCE */}
        <section id="exp" className={s.section}>
          <SecHead num="03" file="experience.log" title="Where I've" accent="shipped." />
          <ol className={s.timeline}>
            {EXPERIENCE.map((r, i) => (
              <li key={r.company} className={s.role}>
                <span className={s.year}>{r.year}</span>
                <div>
                  <h3 className={s.co}>{r.company}</h3>
                  <p className={s.roleMeta}>{r.role} · {r.location}</p>
                  <ul className={s.miniTags}>{r.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                  <details className={s.fold} open={i === 0}>
                    <summary>impact log · {r.period}</summary>
                    <ul className={s.bullets}>{r.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                  </details>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* EDUCATION + CREDENTIALS */}
        <section id="edu" className={s.section}>
          <SecHead num="04" file="education.txt" title="Academic" accent="roots." />
          <div className={s.edu}>
            {EDUCATION.map((e) => (
              <article key={e.degree} className={s.eduCard}>
                <span className={s.eduTick}>{e.tick}</span>
                <h3>{e.degree}</h3>
                <p className={s.eduUni}>{e.uni}</p>
                <p className={s.eduYear}>{e.period}</p>
                <p className={s.eduMods}>{e.modules}</p>
              </article>
            ))}
          </div>
          <h3 className={s.certsLabel}>✓ Credentials <span>{CREDENTIALS.length}</span></h3>
          <ul className={s.certs}>
            {CREDENTIALS.map((c) => (
              <li key={c.name}>
                <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className={s.cert}
                  aria-label={`${c.name} — verify credential on ${c.issuer}`}>
                  {c.isNew && <span className={s.newTag}>new</span>}
                  <Image src={c.img} alt="" width={72} height={72} className={s.certImg} />
                  <span className={s.certName}>{c.name}</span>
                  <span className={s.certIssuer}>{c.issuer} · verify ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* CONTACT */}
        <section id="contact" className={s.section}>
          <SecHead num="05" file="contact.sh" title={`${CONTACT.headline[0]} ${CONTACT.headline[1]}`} accent={CONTACT.headline[2]} />
          <p className={s.body}>{CONTACT.sub}</p>
          <dl className={s.facts}>
            {CONTACT.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <ul className={s.links}>
            {CONTACTS.map((c) => (
              <li key={c.key}>
                <a href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className={s.clink}>
                  <span className={s.clinkK}>{c.key}</span>
                  <span className={s.clinkV}>{c.value}</span>
                  <span aria-hidden="true" className={s.clinkArrow}>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={s.footer} data-chat-fab-avoid>
        <span>© 2026 TRUPTI PANDYA · LLM ENGINEER</span>
        <span><span className={s.dot} /> AVAILABLE FOR HIRE</span>
      </footer>

      <div className={s.tabbar} role="navigation" aria-label="Sections" data-chat-fab-avoid>
        {SECTIONS.map((x) => (
          <a key={x.id} href={`#${x.id}`} className={active === x.id ? s.on : undefined}
            aria-current={active === x.id ? "location" : undefined}>
            {x.label}
          </a>
        ))}
      </div>
    </div>
  );
}
