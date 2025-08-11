// components/RemixPicker.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm?: (choices: string[]) => void;
};

const ALL_APIS = [
  "OpenAI (GPT / SORA)",
  "Higgsfield",
  "Fal.ai",
  "Replicate",
  "Local (WebGPU)",
];

export default function RemixPicker({ open, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  // Clear selections whenever dialog closes (re-open starts fresh)
  useEffect(() => {
    if (!open) setSelected([]);
  }, [open]);

  // A11y & UX: focus trap, ESC to close, scroll lock, restore focus
  useEffect(() => {
    if (!open) return;

    lastFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Initial focus inside dialog
    const focusFirst = () => {
      const root = rootRef.current;
      if (!root) return;
      const nodes = root.querySelectorAll<HTMLElement>(
        'input,button,[href],[tabindex]:not([tabindex="-1"])'
      );
      (nodes[0] ?? root).focus();
    };
    const t = setTimeout(focusFirst, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const root = rootRef.current;
        if (!root) return;
        const nodes = Array.from(
          root.querySelectorAll<HTMLElement>(
            'input,button,[href],[tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));
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
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      // Restore focus to the opener
      lastFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (name: string) => {
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));
  };

  const confirm = () => {
    try {
      onConfirm?.(selected);
    } finally {
      onClose();
    }
  };

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remix-title"
      onClick={onClose}
    >
      <div
        ref={rootRef}
        role="document"
        className="sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="head">
          <div className="pill">Remix</div>
          <h3 id="remix-title">Choose an AI to remix with</h3>
          <p className="sub">Route prompts to selected services. Plug real API keys later.</p>
        </header>

        <div className="options" role="group" aria-label="Available AI services">
          {ALL_APIS.map((label) => (
            <label key={label} className={`opt ${selected.includes(label) ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={selected.includes(label)}
                onChange={() => toggle(label)}
              />
              <span className="name">{label}</span>
            </label>
          ))}
        </div>

        <footer className="actions">
          <button type="button" className="btn" onClick={onClose} aria-label="Cancel remix">
            Cancel
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={confirm}
            disabled={!selected.length}
            aria-disabled={!selected.length}
          >
            Remix
          </button>
        </footer>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: grid;
          place-items: center;
          background: rgba(8, 10, 14, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: fadeIn 120ms ease-out;
        }
        .sheet {
          width: min(560px, 94vw);
          border-radius: 18px;
          padding: 14px 14px 12px;
          color: var(--ink, #eaecef);
          border: 1px solid var(--stroke, rgba(255, 255, 255, 0.14));
          background:
            radial-gradient(120% 120% at 0% 0%, rgba(255, 45, 184, 0.14), transparent 60%),
            radial-gradient(120% 120% at 100% 0%, rgba(79, 70, 229, 0.14), transparent 60%),
            linear-gradient(180deg, #0f1219, #0b0d12);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.02) inset,
            0 24px 64px rgba(0, 0, 0, 0.45);
          transform: translateY(6px);
          animation: pop 140ms cubic-bezier(.2,.8,.2,1) forwards;
          outline: none;
        }
        .head {
          padding: 6px 4px 2px;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          height: 26px;
          padding: 0 10px;
          border-radius: 999px;
          border: 1px solid var(--stroke, rgba(255,255,255,.14));
          background: rgba(14,16,24,.7);
          color: var(--muted, #a2a8b6);
          font-size: 12px;
          letter-spacing: .2px;
          margin-bottom: 6px;
        }
        h3 {
          margin: 0 0 4px 0;
          font-weight: 800;
          letter-spacing: .2px;
        }
        .sub {
          margin: 0;
          opacity: .8;
          font-size: 13px;
        }
        .options {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin: 12px 0 14px;
        }
        .opt {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 42px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid var(--stroke, rgba(255,255,255,.12));
          background: rgba(14,16,24,.65);
          transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .opt:hover {
          border-color: rgba(255,255,255,.22);
          box-shadow: 0 0 0 2px rgba(255,45,184,.22) inset;
        }
        .opt.on {
          border-color: rgba(255,255,255,.26);
          box-shadow: 0 0 0 2px rgba(79,70,229,.28) inset;
          background: rgba(16,18,26,.75);
        }
        .opt input {
          width: 16px;
          height: 16px;
          accent-color: var(--pink, #ff2db8);
        }
        .name {
          font-weight: 600;
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 6px;
        }
        .btn {
          height: 36px;
          border-radius: 10px;
          padding: 0 14px;
          border: 1px solid var(--stroke, rgba(255,255,255,.12));
          background: rgba(14,16,24,.7);
          color: var(--ink, #eaecef);
          font-weight: 600;
          transition: transform .06s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .btn:hover {
          border-color: rgba(255,255,255,.22);
          box-shadow: 0 0 0 2px rgba(255,45,184,.22) inset;
        }
        .btn:active {
          transform: translateY(1px);
        }
        .btn.primary {
          background: var(--pink, #ff2db8);
          border-color: transparent;
          color: #fff;
        }
        .btn.primary[disabled],
        .btn.primary[aria-disabled="true"] {
          opacity: .7;
          filter: saturate(.6);
          cursor: not-allowed;
          box-shadow: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .overlay { animation: none; }
          .sheet { animation: none; transform: none; }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pop {
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
