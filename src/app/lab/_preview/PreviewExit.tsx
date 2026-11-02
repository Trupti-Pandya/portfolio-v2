import Link from "next/link";
import styles from "./PreviewExit.module.css";

/** The only chrome shown in preview mode; its data attribute also tells the lab layout to hide its top bar. */
export default function PreviewExit() {
  return (
    <Link href="/lab" className={styles.exit} data-lab-preview>
      <span aria-hidden="true">←</span> Exit preview
    </Link>
  );
}
