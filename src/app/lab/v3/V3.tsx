"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import LabBanner from "../v1/_shared/LabBanner";
import {
  PROFILE, STATS, ABOUT, SKILLS, PROJECTS, EXPERIENCE, EDUCATION, IMPACT_METRICS,
  CREDENTIALS, CONTACT, CONTACTS, CHAT_MOCK,
} from "../v1/_shared/content";
import { COMMANDS, runCommand } from "./commands";
import s from "./v3.module.css";

const BOOT = [
  ["ok", "mount /trupti --ro"],
  ["ok", "load rag_pipelines × 4"],
  ["ok", "attach eval_harness (deepeval, langfuse)"],
  ["ok", "verify credentials × 5"],
  ["..", "agent ready — awaiting your command"],
];

function Step({ id, tool, arg, ms, children }: { id: string; tool: string; arg: string; ms: number; children: React.ReactNode }) {
  return (
    <section id={id} className={s.step} aria-labelledby={`${id}-h`}>
      <details open>
        <summary className={s.stepHead}>
          <span className={s.stepIcon} aria-hidden="true">▸</span>
          <h2 id={`${id}-h`} className={s.stepCall}>
            <span className={s.fn}>{tool}</span>(<span className={s.arg}>&quot;{arg}&quot;</span>)
          </h2>
          <span className={s.stepMs}>✓ {ms}ms</span>
        </summary>
        <div className={s.stepBody}>{children}</div>
      </details>
    </section>
  );
}

export default function V3() {
  const [value, setValue] = useState("");
  const [out, setOut] = useState("type help, or tap a command ↓");
  const inputRef = useRef<HTMLInputElement>(null);

  const exec = (raw: string) => {
    const r = runCommand(raw);
    setOut(r.message);
    setValue("");
    if (r.kind === "open") window.open(r.href, "_blank", "noopener");
    if (r.kind === "jump") {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const el = r.target === "top" ? document.body : document.getElementById(r.target);
      el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  return (
    <div className={s.page}>
      <LabBanner
        id="v3"
        name="Agent Shell"
        changes={[
          "The whole page is one agent session: every section is a collapsible tool call with its output.",
          "A working command bar (help, projects, certs, cv…) and tap-chips pinned above the thumb.",
          "Experience reads as an execution trace; credentials print as verification results.",
        ]}
      />

      <div className={s.window}>
        <div className={s.chrome} aria-hidden="true">
          <span className={s.lights}><i /><i /><i /></span>
          <span className={s.path}>trupti@portfolio: ~/agent</span>
          <span className={s.pid}>pid 2026</span>
        </div>

        <main className={s.term}>
          <ol className={s.boot} aria-label="Boot log">
            {BOOT.map(([st, line], i) => (
              <li key={line} style={{ animationDelay: `${0.15 + i * 0.22}s` }}>
                <span className={st === "ok" ? s.ok : s.wait}>[{st === "ok" ? " ok " : " .. "}]</span> {line}
              </li>
            ))}
          </ol>

          <div className={s.whoami}>
            <p className={s.ps1}><span>$</span> whoami</p>
            <h1 className={s.name}>
              {PROFILE.first} <em>{PROFILE.last}</em><span className={s.caret} aria-hidden="true" />
            </h1>
            <p className={s.role}>{PROFILE.role}</p>
            <p className={s.dim}># {PROFILE.line}</p>
            <dl className={s.kv}>
              {STATS.map((x) => <div key={x.label}><dt>{x.label.replace(/\s+/g, "_")}</dt><dd>{x.num}</dd></div>)}
              <div><dt>status</dt><dd className={s.live}>{PROFILE.status}</dd></div>
            </dl>
            <div className={s.ctaRow}>
              <a href="#projects" className={s.btnLime}>./run --projects</a>
              <a href={PROFILE.cv} target="_blank" rel="noopener noreferrer" className={s.btn}>resume.pdf ↗</a>
            </div>
          </div>

          <Step id="about" tool="read_file" arg="about.md" ms={12}>
            <p className={s.h}>
              # {ABOUT.headline[0]} <em>{ABOUT.headline[1]}</em> {ABOUT.headline[2]}
            </p>
            <p className={s.quote}>&gt; {ABOUT.pullquote}</p>
            {ABOUT.body.map((p) => <p key={p} className={s.p}>{p}</p>)}
            <p className={s.dim}>tags: [{ABOUT.tags.map((t) => `"${t}"`).join(", ")}]</p>
          </Step>

          <Step id="skills" tool="tree" arg="./capabilities" ms={31}>
            <ul className={s.tree}>
              {SKILLS.map((k, i) => (
                <li key={k.id}>
                  <details>
                    <summary>
                      <span className={s.branch} aria-hidden="true">{i === SKILLS.length - 1 ? "└─" : "├─"}</span>
                      <span className={s.dir}>{k.id}/</span>
                      <span className={s.dim}>{k.title}</span>
                      <span className={s.meter} role="img" aria-label={`top skill ${k.bars[0][1]} percent`}>
                        {"█".repeat(Math.round(k.bars[0][1] / 10))}
                        <span>{"░".repeat(10 - Math.round(k.bars[0][1] / 10))}</span>
                      </span>
                    </summary>
                    <ul className={s.leaves}>
                      {k.bars.map(([lbl, pct]) => (
                        <li key={lbl}><span>{lbl}</span><b>{pct}%</b></li>
                      ))}
                      <li className={s.dim}>{k.chips.join(" · ")}</li>
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </Step>

          <Step id="projects" tool="ls" arg="./projects" ms={8}>
            <ul className={s.projects}>
              {PROJECTS.map((p) => (
                <li key={p.num} className={s.proj}>
                  <p className={s.projMeta}><span>drwxr-xr-x</span> {p.num} · {p.label}</p>
                  <h3 className={s.projName}>{p.name}</h3>
                  <p className={s.p}>{p.desc}</p>
                  <p className={s.result}><span>→ result:</span> {p.impact}</p>
                  <p className={s.deps}>deps: {p.stack.join(", ")}</p>
                  <a className={s.btn} href={p.href} target="_blank" rel="noopener noreferrer">git clone {p.name.toLowerCase().replace(/\s+/g, "-")} ↗</a>
                </li>
              ))}
            </ul>
          </Step>

          <Step id="exp" tool="tail" arg="experience.log" ms={44}>
            <dl className={s.metrics}>
              {IMPACT_METRICS.map((m) => <div key={m.label}><dd>{m.value}</dd><dt>{m.label}</dt></div>)}
            </dl>
            {EXPERIENCE.map((r) => (
              <div key={r.company} className={s.trace}>
                <p className={s.traceHead}>
                  <span className={s.ok}>[{r.year}]</span> <strong>{r.company}</strong> <span className={s.dim}>· {r.role} · {r.period}</span>
                </p>
                <ol className={s.traceSteps}>
                  {r.bullets.map((b, i) => (
                    <li key={b}><span className={s.stepNo} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{b}</li>
                  ))}
                </ol>
              </div>
            ))}
            {EDUCATION.map((e) => (
              <p key={e.degree} className={s.edu}>
                <span className={s.ok}>[edu]</span> {e.tick} {e.degree} — {e.uni} <span className={s.dim}>({e.period})</span>
              </p>
            ))}
          </Step>

          <Step id="certs" tool="verify" arg="--credentials" ms={207}>
            <ul className={s.certs}>
              {CREDENTIALS.map((c) => (
                <li key={c.name}>
                  <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className={s.cert}
                    aria-label={`${c.name} — verify credential on ${c.issuer}`}>
                    <Image src={c.img} alt="" width={56} height={56} className={s.certImg} />
                    <span className={s.certText}>
                      <span className={s.certName}>{c.name}</span>
                      <span className={s.dim}>{c.issuer}</span>
                    </span>
                    <span className={s.certOk}>{c.isNew ? "NEW" : "OK"} ↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className={s.dim}>5/5 verified · more credentials in progress_</p>
          </Step>

          <Step id="contact" tool="exec" arg="./contact.sh" ms={3}>
            <p className={s.h}>{CONTACT.headline[0]} {CONTACT.headline[1]} <em>{CONTACT.headline[2]}</em></p>
            <p className={s.p}>{CONTACT.sub}</p>
            <div className={s.chatMock} aria-label="Chat assistant preview (static mockup)">
              {CHAT_MOCK.map((m) => (
                <p key={m.text}><span className={m.from === "user" ? s.youTag : s.botTag}>{m.from === "user" ? "you" : "agent"}</span>{m.text}</p>
              ))}
            </div>
            <ul className={s.links}>
              {CONTACTS.map((c) => (
                <li key={c.key}>
                  <a href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className={s.link}>
                    <span className={s.dim}>$ {c.cmd}</span>
                    <span>{c.value}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className={s.dim}>{CONTACT.facts.map(([k, v]) => `${k}=${v}`).join("  ")}</p>
          </Step>

          <p className={s.exit}>[process exited 0] · © 2026 Trupti Pandya · available for hire</p>
        </main>
      </div>

      <div className={s.dock}>
        <p className={s.out} aria-live="polite">{out}</p>
        <div className={s.chips}>
          {COMMANDS.map((c) => (
            <button key={c.cmd} type="button" className={s.chip} onClick={() => exec(c.cmd)}>{c.cmd}</button>
          ))}
        </div>
        <form
          className={s.prompt}
          onSubmit={(e) => { e.preventDefault(); exec(value); inputRef.current?.blur(); }}
        >
          <label htmlFor="v3-cmd" className={s.ps}>~$</label>
          <input
            id="v3-cmd"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="help"
            aria-label="Shell command"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            className={s.input}
          />
          <button type="submit" className={s.run} aria-label="Run command">↵</button>
        </form>
      </div>
    </div>
  );
}
