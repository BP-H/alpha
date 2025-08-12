'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// 3D hero (no SSR)
const PortalHero = dynamic(() => import('@/components/ai/PortalHero'), { ssr: false });

// Use the non-ai path to avoid the "module not found" issue on some branches
import PostComposer from '@/components/PostComposer';

/* ------------------------------------------------------------------ */
/* Demo feed data                                                      */
/* ------------------------------------------------------------------ */
type Post = {
  id: string;
  author: string;
  text: string;
  time: string;
  image?: string;
  alt?: string;
};

function makeBatch(offset: number, size = 12): Post[] {
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

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Page() {
  // infinite scroll
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
        const e = entries[0];
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

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: 20 }}>
      {/* simple translucent topbar */}
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
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 800 }}>GLOBALRUNWAYAI</div>
        <div style={{ flex: 1 }} />
        <Link href="/3d" className="btn btn--primary" style={{ textDecoration: 'none' }}>
          Launch 3D
        </Link>
      </header>

      {/* 3-column shell (tokens/styles come from app/globalrunwayai/globals.css) */}
      <div className="app-shell">
        {/* left rail (desktop) */}
        <aside className="app-left" />

        {/* center column */}
        <section style={{ display: 'grid', gap: 16 }}>
          {/* small portal dock */}
          <div className="card card--angled" style={{ padding: 0 }}>
            <PortalHero />
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
              <p style={{ marginBottom: 10 }}>{p.text}</p>
              {p.image && (
                <div
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid var(--line)',
                  }}
                >
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
          <div
            ref={sentinelRef}
            style={{ height: 44, display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}
          >
            {loading ? 'Loading…' : hasMore ? '' : '— End —'}
          </div>
        </section>

        {/* right rail (desktop) */}
        <aside className="app-right" />
      </div>
    </main>
  );
}
