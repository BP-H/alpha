// app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

// 3D hero (no SSR)
const PortalHero = dynamic(() => import('@/components/PortalHero'), { ssr: false });
import PostComposer from '@/components/PostComposer';

type Post = {
  id: string;
  author: string;
  text: string;
  time: string;
  image?: string;
  alt?: string;
};

// demo feed
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // feed
  const [items, setItems] = useState<Post[]>(() => makeBatch(0, 12));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [e] = entries;
        if (!e.isIntersecting || loading || !hasMore) return;
        setLoading(true);
        timer = setTimeout(() => {
          const next = makeBatch(page * 12, 12);
          setItems((prev) => [...prev, ...next]);
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

  // measure header height → CSS var so sticky math is exact
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const header = document.querySelector<HTMLElement>('[data-topbar]');
    if (!header) return;
    const set = () =>
      document.documentElement.style.setProperty('--topbar-h', `${header.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    window.addEventListener('resize', set);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', set);
    };
  }, []);

  // ESC closes drawer; lock body scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = drawerOpen ? 'hidden' : prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <main className={styles.root}>
      {/* FIXED header (mobile-safe) */}
      <header data-topbar className={styles.topbar} role="banner">
        <div className={styles.leftCluster}>
          <button
            className={`${styles.iconBtn} ${styles.showMobile}`}
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            ☰
          </button>
          <Link className={styles.brand} href="/" aria-label="Home">
            <Image src="/icon.png" width={24} height={24} alt="app" className={styles.logo} />
            <b>superNova_2177</b>
          </Link>
        </div>

        <div className={styles.search}>
          <input placeholder="Search posts, people, companies…" aria-label="Search" />
        </div>

        <div className={styles.actions}>
          <Link href="/3d" className={`${styles.btn} ${styles.primary}`} style={{ textDecoration: 'none' }}>
            Launch 3D
          </Link>
          <button
            className={styles.avatarBtn}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            title="Open profile"
          >
            <Image src="/icon.png" width={28} height={28} alt="Profile" />
          </button>
          {menuOpen && (
            <div role="menu" className={styles.avatarMenu} onMouseLeave={() => setMenuOpen(false)}>
              <Link href="/profile" role="menuitem">
                Profile
              </Link>
              <Link href="/settings" role="menuitem">
                Settings
              </Link>
              <Link href="/proposals" role="menuitem">
                Proposals
              </Link>
            </div>
          )}
        </div>
      </header>
      <div className={styles.topbarSpacer} aria-hidden />

      {/* Mobile drawer + scrim */}
      {drawerOpen && <div className={styles.scrim} onClick={() => setDrawerOpen(false)} />}
      <aside className={`${styles.drawer} ${drawerOpen ? styles.open : ''}`} aria-hidden={!drawerOpen}>
        <div className={`${styles.card} ${styles.profileCard}`} style={{ marginBottom: 10 }}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>
              <Image src="/icon.png" width={48} height={48} alt="avatar" />
            </div>
            <div>
              <div className={styles.name}>taha_gungor</div>
              <div className={styles.muted}>artist • test_tech</div>
            </div>
          </div>
        </div>
        {['Feed', 'Messages', 'Proposals', 'Decisions', 'Execution', 'Companies', 'Settings'].map((l) => (
          <button key={l} className={`${styles.btn} ${styles.ghost} ${styles.leftnav}`} style={{ width: '100%' }}>
            {l}
          </button>
        ))}
        <button className={styles.btn} style={{ marginTop: 12 }} onClick={() => setDrawerOpen(false)}>
          Close
        </button>
      </aside>

      {/* Layout */}
      <div className={styles.shell}>
        {/* left rail (desktop) */}
        <aside className={styles.left}>
          <div className={`${styles.card} ${styles.profileCard}`}>
            <div className={styles.profileRow}>
              <div className={styles.avatar}>
                <Image src="/icon.png" width={48} height={48} alt="avatar" />
              </div>
              <div>
                <div className={styles.name}>taha_gungor</div>
                <div className={styles.muted}>artist • test_tech</div>
              </div>
            </div>
          </div>

          <nav className={`${styles.card} ${styles.navStack}`}>
            {['Feed', 'Messages', 'Proposals', 'Decisions', 'Execution', 'Companies', 'Settings'].map((l) => (
              <button key={l} className={`${styles.btn} ${styles.ghost} ${styles.leftnav}`}>
                {l}
              </button>
            ))}
          </nav>

          <div className={styles.card}>
            <div className={styles.muted}>Quick stats</div>
            <div className={styles.kpis}>
              <div className={styles.tile}>
                <div className={styles.k}>2,302</div>
                <div className={styles.muted}>Profile views</div>
              </div>
              <div className={styles.tile}>
                <div className={styles.k}>1,542</div>
                <div className={styles.muted}>Post reach</div>
              </div>
              <div className={styles.tile}>
                <div className={styles.k}>12</div>
                <div className={styles.muted}>Companies</div>
              </div>
            </div>
          </div>
        </aside>

        {/* center column */}
        <section className={styles.center}>
          {/* ---- SMALL STICKY PORTAL DOCK (only the portal sticks) ---- */}
          <section className={styles.portalDock} aria-label="Portal">
            <PortalHero />
          </section>

          {/* hero copy & CTAs (scrolls away, *not* sticky) */}
          <div className={`${styles.card} ${styles.heroCopyCard}`}>
            <p className={styles.muted}>
              Minimal UI, neon <b>superNova</b> accents (pink/blue). The portal compresses as you
              scroll and stays under the header on all devices.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/3d" className={`${styles.btn} ${styles.primary}`} style={{ textDecoration: 'none' }}>
                Open Universe
              </Link>
              <button className={styles.btn}>Remix a Universe</button>
            </div>
          </div>

          <PostComposer />

          {/* feed */}
          {items.map((p) => (
            <article key={p.id} className={`${styles.card} ${styles.post}`}>
              <header className={styles.postHead}>
                <strong>{p.author}</strong>
                <span className={styles.muted}> • {p.time}</span>
              </header>
              <p className={styles.postText}>{p.text}</p>
              {p.image && (
                <div className={styles.mediaWrap}>
                  <img
                    src={p.image}
                    alt={(p.alt || p.text || 'Post image').slice(0, 80)}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              <footer className={styles.postActions}>
                <button className={styles.chip}>Like</button>
                <button className={styles.chip}>Comment</button>
                <button className={styles.chip}>Share</button>
              </footer>
            </article>
          ))}
          <div ref={sentinelRef} className={styles.sentinel}>
            {loading ? 'Loading…' : hasMore ? ' ' : '— End —'}
          </div>
        </section>

        {/* right rail */}
        <aside className={styles.right}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>Identity</div>
            <div className={styles.muted}>Switch modes and manage entities.</div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>Company Control Center</div>
            <div className={styles.muted}>Spin up spaces, manage proposals, and ship pipelines.</div>
            <div className="stack">
              <button className={`${styles.btn} ${styles.primary}`}>Create Company</button>
              <button className={styles.btn}>Open Dashboard</button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>Shortcuts</div>
            <div className="stack">
              <button className={styles.btn}>New Proposal</button>
              <button className={styles.btn}>Start Vote</button>
              <button className={styles.btn}>Invite Member</button>
            </div>
          </div>
        </aside>
      </div>

      {/* THEME (pink nova gradient + glass cards) */}
      <style jsx global>{`
        :root {
          --topbar-h: 64px; /* updated at runtime */
          --bg0: #ff0aa2;
          --bg1: #ff33d1;
          --panel: #141722;
          --ink: #f5f7fb;
          --muted: #a2a8b6;
          --stroke: #262a33;
          --pink: #ff2db8;
          --blue: #4f46e5;
        }
        html,
        body {
          background: linear-gradient(180deg, var(--bg0) 0%, var(--bg1) 100%);
          color: var(--ink);
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </main>
  );
}
