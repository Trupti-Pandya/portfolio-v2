import styles from "./LabBanner.module.css";

export default function LabBanner({ id, name, changes }: { id: string; name: string; changes: string[] }) {
  return (
    <aside className={styles.banner} aria-label={`Concept ${id} notes`}>
      <details open>
        <summary className={styles.summary}>
          <span className={styles.tag}>lab/{id}</span>
          <span className={styles.name}>{name}</span>
          <span className={styles.toggle} aria-hidden="true">what changed ▾</span>
        </summary>
        <ul className={styles.list}>
          {changes.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </details>
    </aside>
  );
}
