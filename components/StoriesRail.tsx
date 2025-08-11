'use client';

import React, { useMemo } from 'react';

type StoriesRailProps = { seed?: number | string };

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function StoriesRail({ seed = 2177 }: StoriesRailProps) {
  const items = useMemo(() => {
    const numericSeed =
      typeof seed === 'string'
        ? [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0)
        : Number(seed);
    const r = mulberry32(numericSeed || 2177);
    const names = [
      'proto_ai','lowpoly_lab','neonfork','voidResearch','axiom','tycho','aurora','kyber',
      'prism','nova','echo','glyph','delta','tau','quark','semaphore','anova','kappa',
      'atlas','sora','zeno','pulsar','cosmo','lyra'
    ];
    return Array.from({ length: 22 }, (_, i) => {
      const hue = Math.floor(r() * 360);
      const a = 0.45 + r() * 0.4;
      return { id: `s${i}`, hue, alpha: clamp(a, 0.3, 0.95), label: '@' + names[i % names.length] };
    });
  }, [seed]);

  return (
    <>
      <style jsx>{`
        .rail {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 8px 2px 2px;
          scrollbar-width: none;          /* firefox */
          -ms-overflow-style: none;       /* IE/Edge */
        }
        .rail::-webkit-scrollbar { display: none; } /* webkit */
        .chip {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 14px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,.08);
          background: #0f1320;
          font-weight: 800;
          white-space: nowrap;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .chip:before {
          content: '';
          width: 20px;
          height: 20px;
          border-radius: 6px;
          background: conic-gradient(from 0deg, rgba(255,255,255,.12), hsla(var(--h),90%,60%,var(--a)), rgba(255,255,255,0));
          box-shadow: 0 0 0 1px rgba(255,255,255,.06) inset;
        }
        .chip:hover {
          transform: translateY(-1px) rotate(-.5deg);
          box-shadow: 0 0 0 2px rgba(14,165,255,.25) inset;
        }
        .hint { color:#a1a7b3; font-size:.82rem; margin: 6px 2px 0 2px; }
      `}</style>

      <div className="rail" aria-label="stories-rail">
        {items.map(it => (
          <div
            key={it.id}
            className="chip"
            style={{ ['--h' as any]: it.hue, ['--a' as any]: it.alpha }}
          >
            <span>{it.label}</span>
          </div>
        ))}
      </div>
      <div className="hint">Tap a story to open its universe · long‑press to remix</div>
    </>
  );
}
