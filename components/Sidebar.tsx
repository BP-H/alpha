"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import styles from "./sidebar.module.css";

type SidebarProps = { open: boolean; onClose: () => void };

const AGENTS = [
  { key: "ops", label: "Ops", emoji: "🧩" },
  { key: "outreach", label: "Outreach", emoji: "📣" },
  { key: "research", label: "Research", emoji: "🔎" },
  { key: "growth", label: "Growth", emoji: "📈" },
  { key: "support", label: "Support", emoji: "🤖" },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const panelRef = useRef<HTMLElement>(null);

  // tiny local state for demo toggles
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    ops: true,
    outreach: false,
    research: true,
    growth: false,
    support: false,
  });
  const toggle = useCallback(
    (k: string) => setEnabled((s) => ({ ...s, [k]: !s[k] })),
    []
  );

  // Close on ESC + simple focus trap when open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll<HTMLElement>(
          'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus first actionable when opened
  useEffect(() => {
    if (open && panelRef.current) {
      const first = panelRef.current.querySelector<HTMLElement>(
        "button, a, [tabindex]:not([tabindex='-1'])"
      );
      (first ?? panelRef.current).focus();
    }
  }, [open]);

  return (
    <div className={`${styles.shell} ${open ? styles.open : ""}`}>
      {/* backdrop is a button for a11y */}
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close sidebar"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Command Center"
      >
        <header className={styles.header}>
          <div className={styles.logo}>SN</div>
          <div className={styles.title}>Command Center</div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <nav className={styles.nav} aria-label="Primary">
          <Link className={`${styles.item} ${styles.active}`} href="/">
            📰 <span>Feed</span>
          </Link>
          <Link className={styles.item} href="/explore">
            🔭 <span>Explore</span>
          </Link>
          <Link className={styles.item} href="/agents">
            🤖 <span>Agents</span>
          </Link>
          <Link className={styles.item} href="/spaces">
            🌌 <span>3D Spaces</span>
          </Link>
          <Link className={styles.item} href="/settings">
            ⚙️ <span>Settings</span>
          </Link>
        </nav>

        <div className={styles.sectionLabel}>Your agents</div>
        <div className={styles.agents}>
          {AGENTS.map((a) => {
            const on = !!enabled[a.key];
            return (
              <button
                type="button"
                key={a.key}
                className={`${styles.agent} ${on ? styles.agentOn : ""}`}
                onClick={() => toggle(a.key)}
                aria-pressed={on}
              >
                <span className={styles.agentIcon}>{a.emoji}</span>
                <span className={styles.agentName}>{a.label}</span>
                <span className={styles.badge}>{on ? "on" : "off"}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.sectionLabel}>Connect APIs</div>
        <div className={styles.connectGrid}>
          <Link
            href="https://github.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.connector}
          >
            GitHub
          </Link>
          <Link
            href="https://platform.openai.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.connector}
          >
            OpenAI
          </Link>
          <Link
            href="https://vercel.com/integrations"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.connector}
          >
            Vercel
          </Link>
          <Link
            href="https://supabase.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.connector}
          >
            Supabase
          </Link>
          <Link
            href="https://stripe.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.connector}
          >
            Stripe
          </Link>
          <Link
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.connector}
          >
            Google Cloud
          </Link>
          <Link
            href="https://www.instagram.com/oauth/authorize"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.connector}
          >
            Instagram
          </Link>
          <Link
            href="https://www.linkedin.com/oauth/v2/authorization"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.connector}
          >
            LinkedIn
          </Link>
        </div>

        <div className={styles.ctaWrap}>
          <Link href="/agents" className={styles.cta}>Launch Agents</Link>
        </div>

        <footer className={styles.footer}>
          <div className={styles.legal}>
            Humans • AIs • Companies collaborate as peers. v0.1
          </div>
        </footer>
      </aside>
    </div>
  );
}
