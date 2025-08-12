// app/page.tsx
'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// 3D hero (no SSR)
const PortalHero = dynamic(() => import('@/components/ai/PortalHero'), { ssr: false });
import PostComposer from '@/components/ai/PostComposer';

type Post = {
  id: string;
  author: string;
  text: string;
  time: string;
  image?: string;
  alt?: string;
};

function makeBatch(offset: number, size = 10): Post[] {
  return Array.from({ length: size }).map((_, i) => {
    const n = offset + i;
    return {
      id: String(n),
      author: ['@proto_ai', '@neonfork', '@superNova_2177'][n % 3],
      time: new Date(Date.now() - n * 1000 * 60 * 5).toLocaleString(),
      text:
        n % 3 === 0
          ? 'Low-poly moment — rotating differently in each instance as you scroll.'
          : 'Prototype feed — symbolic demo copy for layout testing.',
      image: n % 2 === 0 ? `https://picsum.photos/seed/sn_${n}/960/540` : undefined,
    };
  });
}

export default function Page() {
  // feed
  const [items, setItems] = useState<Post>(() => [] as unknown as Post); // TS appeasement
  const [posts, setPosts] = useState<Post[]>(() => makeBatch(0, 12));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const io = new IntersectionObserver(
      (entries) => {
        const [e] = entries;
        if (!e.isIntersecting || loading || !hasMore) return;

        setLoading(true);
        timer = setTimeout(() => {
          const next = makeBatch(page * 12, 12);
          setPosts((prev) => [...prev, ...next]);
          const nextPage = page + 1;
          setPage(nextPage);
          if (nextPage >= 10) setHasMore(false); // demo cap
          setLoading(false);
        }, 220);
      },
      { rootMargin: '1200px 0px 800px 0px' }
    );

    io.observe(sentinelRef.current);
    return () => {
      if (timer) clearTimeout(timer);
      io.disconnect();
    };
  }, [page, loading, hasMore]);

  // keep a sticky, translucent topbar
  return (
    <main>
      {/* Topbar */}
      <header
        role="banner"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          background: 'rgba(255,255,255,.8)',
          backdropFilter: 'blur(8px) saturate(140%)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div style={{ fontWeight: 800 }}>superNova_2177</div>
        <div style={{ flex: 1 }}>
          <input
            aria-label="Search"
            placeholder="Search posts, people, companies…"
            style={{
              width: '100%',
              height: 36,
              padding: '0 12px',
              border: '1px solid var(--line)',
              borderRadius: 10,
              background: '#fff',
              color: 'var(--ink-0)',
            }}
          />
        </div>
        <Link href="/3d" className="btn btn--primary" style={{ textDecoration: 'none' }}>
          Launch 3D
        </Link>
      </header>

      {/* App shell: uses globals.css layout tokens */}
      <div className="app-shell" style={{ marginTop: 16 }}>
        {/* LEFT */}
        <aside className="app-left" style={{ display: 'grid', gap: 12 }}>
          <div className="card card--angled" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>taha_gungor</div>
            <div style={{ color: 'var(--ink-2)' }}>artist • test_tech</div>
          </div>

          <nav className="card" style={{ padding: 8, display: 'grid', gap: 8 }}>
            {['Feed', 'Messages', 'Proposals', 'Decisions', 'Execution', 'Companies', 'Settings'].map((l) => (
              <button key={l} className="btn btn--ghost" style={{ justifyContent: 'flex-start' }}>
                {l}
              </button>
            ))}
          </nav>

          <div className="card" style={{ padding: 12 }}>
            <div className="card__sweep" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800 }}>2,302</div>
                <div style={{ color: 'var(--ink-2)' }}>views</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800 }}>1,542</div>
                <div style={{ color: 'var(--ink-2)' }}>reach</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800 }}>12</div>
                <div style={{ color: 'var(--ink-2)' }}>companies</div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <section style={{ display: 'grid', gap: 16 }}>
          {/* 3D portal hero */}
          <div className="card card--angled" style={{ padding: 0 }}>
            <PortalHero />
          </div>

          {/* hero copy & CTAs */}
          <div className="card" style={{ padding: 12 }}>
            <p style={{ color: 'var(--ink-1)', marginTop: 2 }}>
              Minimal UI, neon <b>superNova</b> accents (pink/blue). The portal compresses as you scroll and stays
              under the header on all devices.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Link href="/3d" className="btn btn--primary" style={{ textDecoration: 'none' }}>
                Open Universe
              </Link>
              <button className="btn">Remix a Universe</button>
            </div>
          </div>

          {/* composer */}
          <div className="card" style={{ padding: 12 }}>
            <PostComposer />
          </div>

          {/* feed */}
          {posts.map((p) => (
            <article key={p.id} className="card" style={{ padding: 12 }}>
              <header style={{ marginBottom: 6 }}>
                <strong>{p.author}</strong>
                <span style={{ color: 'var(--ink-2)' }}> • {p.time}</span>
              </header>
              <p style={{ color: 'var(--ink-0)', marginBottom: 10 }}>{p.text}</p>
              {p.image && (
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <img
                    src={p.image}
                    alt={(p.alt || p.text || 'Post image').slice(0, 80)}
                    loading="lazy"
                    decoding="async"
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                </div>
              )}
              <footer style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn">Like</button>
                <button className="btn">Comment</button>
                <button className="btn">Share</button>
              </footer>
            </article>
          ))}
          <div ref={sentinelRef} style={{ height: 44, display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>
            {loading ? 'Loading…' : hasMore ? '' : '— End —'}
          </div>
        </section>

        {/* RIGHT */}
        <aside className="app-right" style={{ display: 'grid', gap: 12 }}>
          <div className="card" style={{ padding: 12 }}>
            <div className="card__sweep" />
            <h3 style={{ margin: '12px 0 4px' }}>Identity</h3>
            <p style={{ color: 'var(--ink-2)' }}>Switch modes and manage entities.</p>
          </div>

          <div className="card" style={{ padding: 12 }}>
            <div className="card__sweep" />
            <h3 style={{ margin: '12px 0 4px' }}>Shortcuts</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <button className="btn">New Proposal</button>
              <button className="btn">Start Vote</button>
              <button className="btn">Invite</button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
