"use client";

const url = process.env.NEXT_PUBLIC_UE_STREAM_URL || "";

export default function UEStream() {
  return (
    <div style={{ display: "grid", placeItems: "center", height: "100%", fontWeight: 800 }}>
      {url ? (
        <iframe
          src={url}
          title="Unreal Stream"
          style={{ width: "100%", height: "100%", border: 0 }}
          allow="autoplay; fullscreen; microphone; camera; clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock"
        />
      ) : (
        <>Set <code>NEXT_PUBLIC_UE_STREAM_URL</code> to enable Unreal streaming.</>
      )}
    </div>
  );
}
