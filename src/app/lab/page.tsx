import type { Metadata } from "next";
import Link from "next/link";
import { LAB_PAGES } from "./registry";
import { previewHref } from "./_preview/preview";
import styles from "./lab.module.css";

export const metadata: Metadata = {
  title: "Lab home",
};

export default function LabHome() {
  return (
    <main className={styles.content}>
      <p className={styles.note}>
        Preview area — not indexed, not linked from the main site.
      </p>
      <h1 className={styles.title}>Lab</h1>
      <p className={styles.lede}>
        Every preview page lives here. &ldquo;Open preview&rdquo; shows a concept full screen with no lab notes;
        the title opens it with notes.
      </p>
      <ul className={styles.grid}>
        {LAB_PAGES.map((p) => {
          const full = p.preview ? previewHref(p.href) : p.href;
          return (
            <li key={p.href}>
              <article className={styles.card}>
                <Link href={p.href} className={`${styles.cardHead} ${styles.cardLink}`}>
                  <span className={styles.cardTitle}>{p.title}</span>
                  <span className={styles.status} data-status={p.status}>
                    {p.status}
                  </span>
                </Link>
                <span className={styles.cardHref}>{p.href}</span>
                <span className={styles.cardBlurb}>{p.blurb}</span>
                <div className={styles.actions}>
                  <Link href={full} className={styles.btnPrimary}>
                    {p.preview ? "Open preview" : "Open"}
                  </Link>
                  <a
                    href={full}
                    target="_blank"
                    rel="noopener"
                    className={styles.btnSecondary}
                    aria-label={`${p.title}: open ${p.preview ? "preview " : ""}in a new tab`}
                  >
                    new tab ↗
                  </a>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
