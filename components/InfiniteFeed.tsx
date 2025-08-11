'use client';

import { useEffect, useRef, useState } from 'react';

type Post = { id: string; author: string; time: string; text: string; image?: string };

function makePosts(from: number, count: number): Post[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = from + i;
    return {
      id: String(idx),
      author: ['@proto_ai', '@neonfork', '@superNova_2177'][idx % 3],
      time: new Date(Date.now() - idx * 1000 * 90).toLocaleString(),
      text:
        idx % 4 === 0
          ? 'Low-poly moment — rotating differently in each instance as you scroll.'
          : 'Prototype feed — symbolic demo copy for layout testing.',
      image: idx % 2 === 0 ? `https://picsum.photos/seed/sn_white_${idx}/960/540` : undefined,
    };
  });
}

export default function InfiniteFeed({
  pageSize = 8,
  maxPages = 20, // 160 posts demo
}: {
  pageSize?: number;
  maxPages?: number;
}) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Post[]>(() => makePosts(0, pageSize));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!hasMore || loading || timer.current) return;
        const first = entries[0];
        if (first.isIntersecting) {
          setLoading(true);
          // fake fetch
          timer.current = setTimeout(() => {
            const nextPage = page + 1;
            const start = (nextPage - 1) * pageSize;
            const next = makePosts(start, pageSize);
            setItems((prev) => prev.concat(next));
            setPage(nextPage);
            setHasMore(nextPage < maxPages);
            setLoading(false);
            timer.current = null;
          }, 350);
        }
      },
      { rootMargin: '600px 0px' } // load before we hit the end
    );

    io.observe(sentinelRef.current);
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      io.disconnect();
    };
  }, [page, pageSize, maxPages, loading, hasMore]);

  return (
    <>
      {items.map((p) => (
        <article key={p.id} className="card post">
          <header className="postHead">
            <strong>{p.author}</strong>
            <span className="muted"> • {p.time}</span>
          </header>
          <p className="postText">{p.text}</p>
          {p.image && (
            <div className="mediaWrap">
              <img src={p.image} alt="placeholder" loading="lazy" decoding="async" />
            </div>
          )}
          <footer className="postActions">
            <button className="chip">Like</button>
            <button className="chip">Comment</button>
            <button className="chip">Share</button>
          </footer>
        </article>
      ))}

      <div ref={sentinelRef} />

      {loading && (
        <div className="card" aria-live="polite">
          Loading more…
        </div>
      )}

      {!hasMore && (
        <div className="muted" style={{ textAlign: 'center', padding: 12 }}>
          You’re all caught up ✨
        </div>
      )}
    </>
  );
}
