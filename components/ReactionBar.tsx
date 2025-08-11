// components/ReactionBar.tsx
'use client';

import { useState, useMemo } from 'react';
import styles from './reactionbar.module.css';

type ReactionCounts = Record<string, number>;

export type Props = {
  /** Optional id of the post using this bar (handy for analytics, testing) */
  postId?: string;
  /** Map of emoji -> count. Missing keys default to 0. */
  counts?: ReactionCounts;
  /** Notifies parent of a change: previous selection (or null) and new selection (or null) */
  onChange?: (prev: string | null, next: string | null) => void;
  /** Optional className so parent can style/position */
  className?: string;
  /** Optional function to customize aria-label for a given reaction emoji */
  getReactionLabel?: (emoji: string) => string;
};

/** Stable default set so UI never collapses if counts are missing */
const DEFAULTS: ReactionCounts = { '🔥': 0, '💖': 0, '🎉': 0, '👍': 0 };

export default function ReactionBar({
  postId,
  counts = {},
  onChange,
  className,
  getReactionLabel,
}: Props) {
  // keep selected purely client-side; server markup stays consistent
  const [selected, setSelected] = useState<string | null>(null);

  // merge provided counts with defaults defensively
  const merged = useMemo<ReactionCounts>(() => {
    const safe: ReactionCounts = { ...DEFAULTS };
    for (const [k, v] of Object.entries(counts || {})) {
      // Accept numeric values or numeric strings; clamp at 0 to avoid negatives.
      const num = Number(v);
      safe[k] = Number.isFinite(num) ? Math.max(0, num) : 0;
    }
    return safe;
  }, [counts]);

  const handleClick = (next: string) => {
    const prev = selected;
    const newVal = prev === next ? null : next; // clicking active clears selection
    setSelected(newVal);
    try {
      onChange?.(prev, newVal);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={className}
      role="group"
      aria-label="Reactions"
      data-post-id={postId}
    >
      {Object.entries(merged).map(([emoji, n]) => {
        const active = selected === emoji;
        return (
          <button
            key={emoji}
            type="button"
            aria-pressed={active}
            aria-label={getReactionLabel?.(emoji) ?? `${emoji} reaction`}
            title={`${emoji} ${n}`}
            onClick={() => handleClick(emoji)}
            className={`${styles.rxn} ${active ? styles.active : ''}`}
          >
            <span className={styles.emoji} aria-hidden="true">{emoji}</span>
            <span className={styles.count}>{n}</span>
          </button>
        );
      })}
    </div>
  );
}
