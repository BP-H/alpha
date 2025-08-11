// components/ThreePanel.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("@react-three/fiber").then((m) => m.Canvas), {
  ssr: false,
});

const Mini3D = dynamic(() => import("./Mini3D"), { ssr: false });

type Props = {
  seed?: string;
  autoRotate?: boolean;
  wireframe?: boolean;
  overlayText?: string;
  height?: number;
};

export default function ThreePanel({
  seed,
  autoRotate = true,
  wireframe = true,
  overlayText = "Enter universe",
  height = 320,
}: Props) {
  const [interacting, setInteracting] = useState(false);

  return (
    <div
      role="region"
      aria-label="3D universe"
      style={{
        position: "relative",
        width: "100%",
        minHeight: height,
        borderRadius: 18,
        background:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,.08), transparent 40%), linear-gradient(180deg,#ff23a8,#ff0091)",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 55 }}
        onPointerDown={() => setInteracting(true)}
        onPointerUp={() => setInteracting(false)}
        onPointerOut={() => setInteracting(false)}
      >
        <ambientLight intensity={0.75} />
        <directionalLight intensity={0.9} position={[4, 6, 3]} />
        <Mini3D
          seed={seed}
          autoRotate={!interacting && autoRotate}
          wireframe={wireframe}
        />
      </Canvas>

      {!interacting && (
        <button
          type="button"
          onClick={() => setInteracting(true)}
          aria-label="Enter universe"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            letterSpacing: 0.4,
            color: "#000",
            textShadow: "0 1px 20px rgba(255,255,255,.35)",
            background: "rgba(255,255,255,.28)",
            border: "1px solid rgba(255,255,255,.5)",
            backdropFilter: "blur(4px)",
            cursor: "pointer",
          }}
        >
          {overlayText} • tap to interact
        </button>
      )}
    </div>
  );
}
