// components/Topbar.tsx
"use client";

import styles from "./topbar.module.css";

export default function Topbar({ onAvatarClick }: { onAvatarClick: () => void }) {
  return (
    <div className={styles.topbar}>
      <button type="button" className={styles.avatar} onClick={onAvatarClick} aria-label="Open menu">SN</button>
      <div className={styles.spacer} />
      <a className={styles.link} href="https://github.com/BP-H" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
  );
}
