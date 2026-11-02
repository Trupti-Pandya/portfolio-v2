import type { Metadata } from "next";
import Image from "next/image";
import LabBanner from "../v1/_shared/LabBanner";
import HeroPortrait from "@/components/HeroPortrait";
import PreviewExit from "../_preview/PreviewExit";
import { isPreview, type LabSearchParams } from "../_preview/preview";
import {
  PROFILE, STATS, ABOUT, SKILLS, PROJECTS, EXPERIENCE, EDUCATION, IMPACT_METRICS,
  CREDENTIALS, CONTACT, CONTACTS, CHAT_MOCK,
} from "../v1/_shared/content";
import s from "./v2.module.css";

export const metadata: Metadata = {
  title: "Lab v2 — Editorial Bento",
  robots: { index: false, follow: false },
};

const TICKER = SKILLS.flatMap((k) => k.chips.slice(0, 3));

export default async function Page({ searchParams }: { searchParams: LabSearchParams }) {
  const preview = await isPreview(searchParams);
  return (
    <div className={s.page}>
      {preview ? <PreviewExit /> : <LabBanner
        id="v2"
        name="Editorial Bento"
        changes={[
          "Magazine masthead and a bento grid replace the stacked full-width sections.",
          "Proof first: Zenithive impact numbers and the credentials strip sit near the top.",
          "Server render with scroll-driven CSS reveals; the only client script draws the ASCII cover portrait.",
        ]}
      />}

      <header className={s.mast}>
        <div className={s.mastRow}>
          <span>sys/trupti_pandya.llm</span>
          <span>issue 26Q2 · Leicester</span>
        </div>
        <h1 className={s.title}>
          <span className={s.t1}>{PROFILE.first}</span>
          <span className={s.t2}>{PROFILE.last}<i>.</i></span>
        </h1>
        <p className={s.deck}>
          <strong>{PROFILE.role}.</strong> {ABOUT.pullquote}
        </p>
        <div className={s.mastCta}>
          <a href="#work" className={s.btnLime}>read the work ›</a>
          <a href={PROFILE.cv} target="_blank" rel="noopener noreferrer" className={s.btnGhost}>resume.pdf ↗</a>
        </div>
      </header>

      <div className={s.ticker} aria-hidden="true">
        <div className={s.tickerTrack}>
          {[...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}<b>✦</b></span>)}
        </div>
      </div>

      <main className={s.bento}>
        {/* cover portrait */}
        <figure className={`${s.tile} ${s.wide} ${s.cover}`}>
          <HeroPortrait resolution={180} className={s.coverArt} />
          <figcaption className={s.coverCap}>
            <span className={s.kicker}>cover · {PROFILE.first} {PROFILE.last}</span>
            <span className={s.kicker}><span className={s.dot} /> {PROFILE.status}</span>
          </figcaption>
        </figure>

        {/* stats */}
        {STATS.map((x, i) => (
          <article key={x.label} className={`${s.tile} ${s.stat} ${i === 2 ? s.wide : ""}`}>
            <span className={s.statNum}>{x.num}</span>
            <span className={s.kicker}>{x.label}</span>
          </article>
        ))}

        {/* about */}
        <article className={`${s.tile} ${s.wide} ${s.about}`} id="about">
          <p className={s.kicker}>00 · profile</p>
          <h2 className={s.h2}>{ABOUT.headline[0]} <em>{ABOUT.headline[1]}</em> {ABOUT.headline[2]}</h2>
          <p className={s.copy}>{ABOUT.body[0]}</p>
          <p className={s.copyHi}>{ABOUT.body[1]}</p>
          <p className={s.line}>{PROFILE.line}</p>
        </article>

        {/* impact metrics */}
        <article className={`${s.tile} ${s.wide} ${s.metrics}`}>
          <p className={s.kicker}>impact · zenithive · oct 25 – apr 26</p>
          <dl className={s.metricGrid}>
            {IMPACT_METRICS.map((m) => (
              <div key={m.label}><dd>{m.value}</dd><dt>{m.label}</dt></div>
            ))}
          </dl>
        </article>

        {/* chat mock */}
        <article className={`${s.tile} ${s.wide} ${s.chat}`} aria-label="Chat assistant preview (static mockup)">
          <p className={s.kicker}><span className={s.dot} /> ask the portfolio · mockup</p>
          {CHAT_MOCK.map((m) => (
            <p key={m.text} className={m.from === "user" ? s.qUser : s.qBot}>{m.text}</p>
          ))}
          <div className={s.chatBar} aria-hidden="true"><span>Press / to chat</span><span>↵</span></div>
        </article>

        {/* credentials */}
        <section className={`${s.tile} ${s.full} ${s.certs}`} aria-labelledby="v2-certs">
          <div className={s.tileHead}>
            <h2 id="v2-certs" className={s.h3}>✓ Credentials</h2>
            <span className={s.kicker}>{CREDENTIALS.length} verified · swipe →</span>
          </div>
          <ul className={s.certStrip}>
            {CREDENTIALS.map((c) => (
              <li key={c.name}>
                <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className={s.cert}
                  aria-label={`${c.name} — verify credential on ${c.issuer}`}>
                  {c.isNew && <span className={s.newTag}>new</span>}
                  <Image src={c.img} alt="" width={96} height={96} className={s.certImg} />
                  <span className={s.certName}>{c.name}</span>
                  <span className={s.certIssuer}>{c.issuer} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* projects */}
        <h2 id="work" className={`${s.full} ${s.sectionTitle}`}>Selected <em>work.</em></h2>
        {PROJECTS.map((p, i) => (
          <article key={p.num} className={`${s.tile} ${s.proj} ${i % 3 === 0 ? s.full : s.wide}`}>
            <span className={s.projBig} aria-hidden="true">{p.num}</span>
            <p className={s.kicker}>{p.label}</p>
            <h3 className={s.projName}>{p.name}</h3>
            <p className={s.copy}>{p.desc}</p>
            <p className={s.pull}>&ldquo;{p.impact}&rdquo;</p>
            <ul className={s.stack}>{p.stack.map((t) => <li key={t}>{t}</li>)}</ul>
            <a href={p.href} target="_blank" rel="noopener noreferrer" className={s.more}>
              github / {p.name.toLowerCase().replace(/\s+/g, "-")} <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}

        {/* skills */}
        <h2 id="skills" className={`${s.full} ${s.sectionTitle}`}>Tech <em>stack.</em></h2>
        {SKILLS.map((k, i) => (
          <article key={k.id} className={`${s.tile} ${s.skill}`}>
            <p className={s.kicker}>{String(i).padStart(2, "0")} · module/{k.id}</p>
            <h3 className={s.skillTitle}>{k.title}</h3>
            <ul className={s.meter}>
              {k.bars.map(([lbl, pct]) => (
                <li key={lbl}>
                  <span>{lbl}</span><b>{pct}</b>
                  <i aria-hidden="true"><i style={{ width: `${pct}%` }} /></i>
                </li>
              ))}
            </ul>
            <p className={s.chipLine}>{k.chips.join(" · ")}</p>
          </article>
        ))}

        {/* experience */}
        <h2 id="exp" className={`${s.full} ${s.sectionTitle}`}>Where I&apos;ve <em>shipped.</em></h2>
        {EXPERIENCE.map((r) => (
          <article key={r.company} className={`${s.tile} ${s.full} ${s.role}`}>
            <div className={s.roleHead}>
              <span className={s.roleYear}>{r.year}</span>
              <div>
                <h3 className={s.projName}>{r.company}</h3>
                <p className={s.kicker}>{r.role} · {r.period}</p>
              </div>
            </div>
            <ul className={s.bullets}>{r.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            <ul className={s.stack}>{r.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          </article>
        ))}

        {/* education */}
        {EDUCATION.map((e) => (
          <article key={e.degree} className={`${s.tile} ${s.wide} ${s.edu}`}>
            <p className={s.kicker}>{e.tick} · {e.period}</p>
            <h3 className={s.skillTitle}>{e.degree}</h3>
            <p className={s.copy}>{e.uni}</p>
            <p className={s.chipLine}>{e.modules}</p>
          </article>
        ))}

        {/* contact */}
        <section id="contact" className={`${s.tile} ${s.full} ${s.contact}`} aria-labelledby="v2-contact">
          <h2 id="v2-contact" className={s.contactH}>
            {CONTACT.headline[0]} {CONTACT.headline[1]} <em>{CONTACT.headline[2]}</em>
          </h2>
          <p className={s.contactSub}>{CONTACT.sub}</p>
          <ul className={s.contactLinks}>
            {CONTACTS.map((c) => (
              <li key={c.key}>
                <a href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">
                  <span>{c.key}</span>{c.value}<b aria-hidden="true">↗</b>
                </a>
              </li>
            ))}
          </ul>
          <dl className={s.contactFacts}>
            {CONTACT.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </section>
      </main>

      <footer className={s.footer}>
        <span>© 2026 Trupti Pandya</span>
        <span><span className={s.dot} /> available for hire</span>
      </footer>
    </div>
  );
}
