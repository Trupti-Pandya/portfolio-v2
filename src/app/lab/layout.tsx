import type { Metadata } from "next";
import Link from "next/link";
import styles from "./lab.module.css";

export const metadata: Metadata = {
  title: { default: "Lab", template: "%s — Lab" },
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/lab" className={styles.homeLink}>
          ← Lab home
        </Link>
        <span className={styles.tag}>Preview</span>
      </header>
      {children}
    </div>
  );
}
