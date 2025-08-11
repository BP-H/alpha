// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b0d12",
        color: "#eaecef",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 640, textAlign: "center" }}>
        <h1 style={{ fontSize: 44, marginBottom: 14 }}>404 — universe not found</h1>
        <p style={{ opacity: 0.86, marginBottom: 24 }}>
          That route doesn’t exist yet. Jump back to the Feed or fork your own SNS
          universe (we’ll help you merge back later).
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link className="sn-btn" href="/">
            ← Back to feed
          </Link>
          <a
            className="sn-btn"
            href="https://github.com/BP-H/placeholder_supernova/fork"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⚡ Fork & launch your SNS
          </a>
        </div>
      </div>
    </main>
  );
}
