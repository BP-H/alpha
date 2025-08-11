// placeholder-main/components/Mini3D.tsx
'use client';

import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Group } from 'three';

/* ------------------------------------------------------------------ */
/* Stable, low-risk 3D hero                                           */
/*  - No external effects (Stars/Sparkles) to avoid runtime flakes    */
/*  - Deterministic RNG by seed                                       */
/*  - Error boundary + fallback so you never see a blank tile         */
/* ------------------------------------------------------------------ */

type Props = {
  seed?: string | number;
  autoRotate?: boolean;
  wireframe?: boolean;
  opacity?: number; // 0..1
  height?: number;  // px
};

function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const mulberry32 = (a: number) => () => {
  let t = (a += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const PALETTE = ['#ffffff', '#ff2f92', '#0ea5ff'] as const;

function Shard({
  idx,
  rng,
  wireframe,
  opacity,
  rotate,
}: {
  idx: number;
  rng: () => number;
  wireframe: boolean;
  opacity: number;
  rotate: boolean;
}) {
  const ref = useRef<Group>(null!);

  // deterministic-ish params
  const size = useMemo(() => 0.7 + rng() * 0.9, [rng]);
  const pos = useMemo<[number, number, number]>(
    () => [rng() * 4 - 2, -0.2 + rng() * 0.4, -(rng() * 2 + idx * 0.07)],
    [rng, idx]
  );
  const rot = useMemo(
    () => ({ x: 0.3 + rng() * 0.6, y: 0.6 + rng() * 0.9, z: 0.15 + rng() * 0.5 }),
    [rng]
  );
  const hue = useMemo(() => PALETTE[Math.floor(rng() * PALETTE.length)], [rng]);
  const pulse = useMemo(() => 0.9 + rng() * 1.2, [rng]);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime() * pulse + idx * 0.3;

    if (rotate) {
      ref.current.rotation.y += rot.y * dt;
      ref.current.rotation.x += rot.x * 0.35 * dt;
      ref.current.rotation.z += rot.z * 0.25 * dt;
    }

    // sin^2 pop 0→1→0
    const s = Math.pow(Math.max(0, Math.sin(t)), 2);
    ref.current.scale.setScalar(0.25 + s * 1.2);

    // subtle vertical bob
    ref.current.position.y = pos[1] + Math.sin(t * 0.6 + idx) * 0.14;
  });

  return (
    <group ref={ref} position={pos}>
      <mesh>
        {/* icosahedron keeps it crisp on mobile GPUs */}
        <icosahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={hue}
          wireframe={wireframe && hue === '#ffffff'}
          transparent
          opacity={opacity}
          metalness={0.25}
          roughness={0.55}
        />
      </mesh>
    </group>
  );
}

/** Tiny error boundary so we never show a blank panel */
class Boundary extends React.Component<
  { children: React.ReactNode },
  { err?: Error }
> {
  state = { err: undefined as Error | undefined };
  static getDerivedStateFromError(err: Error) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            height: 260,
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,.08)',
            background:
              'linear-gradient(180deg,#0c0f16,#0a0d14) radial-gradient(120% 120% at 20% 10%, rgba(255,47,146,.18), transparent 60%)',
            display: 'grid',
            placeItems: 'center',
            color: '#b6c3d6',
            fontWeight: 800,
          }}
        >
          3D unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Mini3D({
  seed = 'sn2177',
  autoRotate = true,
  wireframe = true,
  opacity = 0.85,
  height = 260,
}: Props) {
  const rng = useMemo(() => mulberry32(hashSeed(String(seed))), [seed]);
  const shards = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);

  return (
    <div
      style={{
        height,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,.06)',
        background: 'linear-gradient(180deg,#111320,#0b0c12)',
      }}
    >
      <Boundary>
        <Suspense
          fallback={
            <div style={{ height: '100%', width: '100%' }} aria-label="Loading 3D…" />
          }
        >
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0.35, 6.5], fov: 45 }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: true,
            }}
            onCreated={({ gl }) => {
              gl.setClearColor('#0e1119');
            }}
          >
            {/* lighting */}
            <ambientLight intensity={0.9} />
            <directionalLight position={[2.8, 2.2, 4]} intensity={0.95} />
            <pointLight position={[-3, -2, -4]} intensity={0.35} color="#ff2f92" />
            <pointLight position={[3, -1, -3]} intensity={0.25} color="#0ea5ff" />

            {shards.map((i) => (
              <Shard
                key={i}
                idx={i}
                rng={rng}
                wireframe={wireframe}
                opacity={opacity}
                rotate={autoRotate}
              />
            ))}

            <OrbitControls enablePan={false} enableZoom={false} enableRotate={autoRotate} />
          </Canvas>
        </Suspense>
      </Boundary>
    </div>
  );
}
