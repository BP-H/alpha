// components/CrossPostToggles.tsx
'use client';

import React from 'react';

export type CrossPostSelection = {
  linkedin: boolean;
  instagram: boolean;
};

type Props = {
  value: CrossPostSelection;
  onChange: (v: CrossPostSelection) => void;
};

export default function CrossPostToggles({ value, onChange }: Props) {
  const toggle = (k: keyof CrossPostSelection) => {
    onChange({ ...value, [k]: !value[k] });
  };

  return (
    <div className="crossPosts">
      <label className={value.linkedin ? 'on' : ''}>
        <input
          type="checkbox"
          checked={value.linkedin}
          onChange={() => toggle('linkedin')}
        />
        <span>LinkedIn</span>
      </label>
      <label className={value.instagram ? 'on' : ''}>
        <input
          type="checkbox"
          checked={value.instagram}
          onChange={() => toggle('instagram')}
        />
        <span>Instagram</span>
      </label>
      <style jsx>{`
        .crossPosts { display:flex; gap:12px; margin:8px 0; }
        label { display:flex; align-items:center; gap:4px; font-size:14px; }
        label.on span { color: var(--pink); }
      `}</style>
    </div>
  );
}
