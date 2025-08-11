// components/CodexPrompt.tsx
'use client';

import { useEffect, useState } from 'react';

const DEFAULT_PROMPT = `You are my calm senior pair‑programmer.
Project: Next.js 14 (app dir) + TypeScript + styled‑jsx + react-three-fiber.
Rules:
1) Fix exactly ONE bug or micro‑polish per turn (no refactors).
2) Show a minimal diff patch with file paths. Avoid churn.
3) Keep design language: glass cards, neon pink/blue, existing CSS variables.
4) Use dynamic() for any @react-three/* imports (no SSR crashes).
5) Do not add deps. Preserve component APIs.
6) Include: (a) what broke, (b) why, (c) the smallest safe fix, (d) how to test/rollback.
Wait for my OK before proposing the next change.`;

export default function CodexPrompt() {
  const [value, setValue] = useState(DEFAULT_PROMPT);
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('codexPrompt');
      const hidden = localStorage.getItem('codexPromptHidden');
      if (saved) setValue(saved);
      if (hidden) setCollapsed(hidden === '1');
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('codexPrompt', value); } catch {}
  }, [value]);

  const toggle = () => {
    setCollapsed(v => {
      const nv = !v;
      try { localStorage.setItem('codexPromptHidden', nv ? '1' : '0'); } catch {}
      return nv;
    });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <section className={`codex ${collapsed ? 'collapsed' : ''}`} role="region" aria-label="GPT/Codex helper">
      <header className="row">
        <strong>Stable bug‑fix agent prompt</strong>
        <div className="grow" />
        <button className="chip" onClick={toggle}>{collapsed ? 'Show' : 'Hide'}</button>
      </header>

      {!collapsed && (
        <>
          <textarea rows={5} value={value} onChange={e => setValue(e.target.value)} spellCheck={false} />
          <div className="actions">
            <button className="btn" onClick={() => setValue(DEFAULT_PROMPT)}>Reset</button>
            <button className="btn primary" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        </>
      )}

      <style jsx>{`
        .codex {
          margin: 10px 16px 0;
          background: rgba(10,11,16,.66);
          border: 1px solid var(--stroke);
          border-radius: 16px;
          padding: 10px;
          box-shadow: 0 0 0 1px rgba(255,255,255,.02) inset, 0 10px 40px rgba(0,0,0,.12);
        }
        .row { display:flex; align-items:center; gap:8px; }
        .grow { flex:1; }
        textarea {
          width: 100%;
          margin-top: 8px;
          border-radius: 12px;
          background: #0c0e14;
          border: 1px solid var(--stroke);
          color: var(--ink);
          padding: 10px;
          resize: vertical;
        }
        .actions { display:flex; gap:8px; justify-content:flex-end; margin-top:8px; }
        .chip {
          height: 30px; padding: 0 10px; border-radius: 999px;
          border: 1px solid var(--stroke);
          background: #0f1626; color: var(--muted);
        }
        .btn {
          height: 34px; border-radius: 10px; padding: 0 12px;
          border: 1px solid var(--stroke);
          background: rgba(12,14,20,.6); color: var(--ink); font-weight:600;
        }
        .btn.primary { background: var(--pink); border-color: transparent; color:#fff; }
        .collapsed textarea, .collapsed .actions { display: none; }
      `}</style>
    </section>
  );
}
