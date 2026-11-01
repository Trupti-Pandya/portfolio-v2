import type { Metadata } from "next";
import Link from "next/link";
import { LAB_PAGES } from "./registry";
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
      <p className={styles.lede}>Every preview page lives here. Tap a card to open it.</p>
      <ul className={styles.grid}>
        {LAB_PAGES.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className={styles.card}>
              <span className={styles.cardHead}>
                <span className={styles.cardTitle}>{p.title}</span>
                <span className={styles.status} data-status={p.status}>
                  {p.status}
                </span>
              </span>
              <span className={styles.cardHref}>{p.href}</span>
              <span className={styles.cardBlurb}>{p.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
