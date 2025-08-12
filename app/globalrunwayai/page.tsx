// app/globalrunwayai/page.tsx
import PortalHero from '@/components/ai/PortalHero';
import PostComposer from '@/components/ai/PostComposer';

export default function Page() {
  return (
    <main>
      <div className="app-shell">
        {/* LEFT: simple nav */}
        <aside className="app-left">
          <div className="card card--angled" style={{ padding: 12 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <a className="pill" href="#">Feed</a>
              <a className="pill" href="#">Messages</a>
              <a className="pill" href="#">Proposals</a>
              <a className="pill" href="#">Decisions</a>
              <a className="pill" href="#">Execution</a>
              <a className="pill" href="#">Companies</a>
              <a className="pill" href="#">Settings</a>
            </div>
          </div>

          <div className="card" style={{ marginTop: 12, padding: 12 }}>
            <div className="card__sweep" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, textAlign: 'center' }}>
              <div><div style={{ fontWeight: 700 }}>2,302</div><div style={{ color: 'var(--ink-2)' }}>views</div></div>
              <div><div style={{ fontWeight: 700 }}>1,542</div><div style={{ color: 'var(--ink-2)' }}>reach</div></div>
              <div><div style={{ fontWeight: 700 }}>12</div><div style={{ color: 'var(--ink-2)' }}>companies</div></div>
            </div>
          </div>
        </aside>

        {/* CENTER: hero + composer + sample posts */}
        <section className="app-center" style={{ display: 'grid', gap: 16 }}>
          <div className="card card--angled" style={{ padding: 0 }}>
            {/* 3D hero (pointer-events is fixed in components/ai/portalHero.module.css) */}
            <PortalHero />
          </div>

          <div className="card" style={{ padding: 12 }}>
            <PostComposer />
          </div>

          {/* sample post blocks (static for now) */}
          <article className="card" style={{ padding: 12 }}>
            <div style={{ marginBottom: 8, color: 'var(--ink-1)' }}>
              <strong>@proto_ai</strong> · just now
            </div>
            <img
              alt="post"
              src="https://images.unsplash.com/photo-1523419409543-a9d1d0ae0b0d?q=80&w=1280&auto=format&fit=crop"
              style={{ width: '100%', borderRadius: '12px' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn">Like</button>
              <button className="btn">Comment</button>
              <button className="btn">Share</button>
            </div>
          </article>

          <article className="card" style={{ padding: 12 }}>
            <div style={{ marginBottom: 8, color: 'var(--ink-1)' }}>
              <strong>@superNova_2177</strong> · 5m
            </div>
            <img
              alt="post"
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1280&auto=format&fit=crop"
              style={{ width: '100%', borderRadius: '12px' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn">Like</button>
              <button className="btn">Comment</button>
              <button className="btn">Share</button>
            </div>
          </article>
        </section>

        {/* RIGHT: small cards */}
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
