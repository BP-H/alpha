'use client';
import React, { useState } from 'react';

export type ReactionCounts = Record<string, number>;

export type Props = {
  /** used by PostCard */
  postId?: string;
  /** emoji -> count */
  counts?: ReactionCounts;
  /** notify parent when selection changes */
  onChange?: (prev: string | null, next: string | null) => void;
  className?: string;
};

export default function ReactionBar({
  postId, // available if you need it later (API call, etc.)
  counts = {},
  onChange,
  className,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const click = (next: string) => {
    const prev = selected;
    const newVal = prev === next ? null : next;
    setSelected(newVal);
    onChange?.(prev, newVal);
  };

  return (
    <div className={className}>
      {/* super tiny, type-safe example UI */}
      <button type="button" onClick={() => click('👍')}>👍 {counts['👍'] ?? 0}</button>
      <button type="button" onClick={() => click('❤️')}>❤️ {counts['❤️'] ?? 0}</button>
    </div>
  );
}
