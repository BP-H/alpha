// components/AgentsRail.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./agents.module.css";
import { api, type Agent } from "@/lib/api";

export default function AgentsRail() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const data = await api.listAgents(controller.signal);
        if (!controller.signal.aborted) setAgents(data);
      } catch (err) {
        console.error(err);
        if (!controller.signal.aborted) setError(true);
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  if (error) return <div>failed to load agents</div>;
  if (!agents.length) return null;

  return (
    <div className={styles.rail}>
      {agents.map(a => (
        <article key={a.id} className={styles.card}>
          <header className={styles.head}>
            <div className={styles.avatar}>{(a.display_name ?? a.handle)[0]?.toUpperCase()}</div>
            <div>
              <div className={styles.name}>{a.display_name ?? a.handle}</div>
              <div className={styles.meta}>@{a.handle}</div>
            </div>
          </header>
          <div className={styles.stat}>resonance: {a.resonance ?? "—"}</div>
          <button type="button" className="sn-btn">Chat</button>
        </article>
      ))}
    </div>
  );
}
