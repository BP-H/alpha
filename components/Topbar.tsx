// components/Topbar.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./topbar.module.css";

type Props = {
  onAvatarClick?: () => void;
  onSearch?: (q: string) => void;
  notifications?: number;
  avatarSrc?: string;
  avatarAlt?: string;
};

export default function Topbar({
  onAvatarClick,
  onSearch,
  notifications = 0,
  avatarSrc = "/icon.png",
  avatarAlt = "Open menu",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick hotkeys: "/" or ⌘/Ctrl+K to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const cmdK = (k === "k" && (e.metaKey || e.ctrlKey));
      if (k === "/" || cmdK) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputRef.current?.value?.trim() ?? "";
    if (q && onSearch) onSearch(q);
  };

  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.avatar}
        onClick={onAvatarClick}
        aria-label={avatarAlt}
      >
        {/* image fallback to initials */}
        <img src={avatarSrc} alt="" onError={(ev) => {
          (ev.currentTarget as HTMLImageElement).style.display = "none";
        }} />
        <span className={styles.initials} aria-hidden>S</span>
      </button>

      <form className={styles.search} role="search" onSubmit={submit}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <label className="sr-only" htmlFor="topbarSearch">Search</label>
        <input
          id="topbarSearch"
          ref={inputRef}
          type="search"
          placeholder="Search posts, people, companies…"
          autoComplete="off"
        />
        <kbd className={styles.kbd}>/</kbd>
      </form>

      <nav className={styles.actions} aria-label="Quick actions">
        <button type="button" className={styles.iconBtn} aria-label="Create">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Messages">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H6l-2 2V4zm2 4v2h12V8H6z"/></svg>
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2z"/></svg>
          {notifications > 0 && <span className={styles.dot} aria-hidden="true" />}
        </button>
        <Link href="https://github.com/BP-H" className={styles.cta} prefetch={false}>
          GitHub
        </Link>
      </nav>
    </header>
  );
}
