// components/ThreeCard.tsx
'use client';

import { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';

const Canvas = dynamic(
  () => import('@react-three/fiber').then(m => m.Canvas),
  { ssr: false }
);
const Drei = {
  OrbitControls: dynamic(() =>
    import('@react-three/drei').then(m => m.OrbitControls),
  { ssr: false }),
  Float: dynamic(() =>
    import('@react-three/drei').then(m => m.Float),
  { ssr: false }),
};

// quick hash → seeded randomness (stable visuals per seed)
function hashSeed(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1
}

export default function ThreeCard({ seed = 'sn' }: { seed?: string }) {
  // reduce motion & small screens → fall back to static gradient card
  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    return (
      <div className="sn-3d-fallback">
        <div className="sn-3d-fallback__bg" />
        <span>3D glimpse</span>
        <style jsx>{`
          .sn-3d-fallback{
            position:relative;border:1px solid rgba(0,0,0,.08);
            background:#fafafa;border-radius:16px;padding:18px;
            overflow:hidden; display:flex; align-items:center; justify-content:center;
          }
          .sn-3d-fallback__bg{
            position:absolute; inset:0;
            background:radial-gradient(120% 120% at 0% 0%, #ffe3f5 0%, #eef2ff 50%, #ffffff 100%);
            opacity:.9;
          }
          .sn-3d-fallback > span{ position:relative; font-weight:700; letter-spacing:.2px; }
        `}</style>
      </div>
    );
  }

  const hue = Math.floor(hashSeed(seed) * 360);
  const colorA = `hsl(${hue} 95% 60%)`;   // neon-ish
  const colorB = `hsl(${(hue + 40) % 360} 95% 60%)`;

  // deterministic positions
  const points = useMemo(() => {
    const r = hashSeed(seed) * 9999;
    const list: [number, number, number][] = [];
    for (let i = 0; i < 24; i++) {
      const t = (i + r) * 12.9898;
      const x = Math.sin(t * 0.7) * 1.4;
      const y = Math.cos(t * 0.5) * 1.1;
      const z = Math.sin(t * 0.9) * 1.2;
      list.push([x, y, z]);
    }
    return list;
  }, [seed]);

  return (
    <div className="sn-3d">
      <Suspense fallback={<div className="sn-3d-skeleton" />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{ powerPreference: 'high-performance', antialias: false }}
          camera={{ position: [0.9, 0.8, 2.2], fov: 55 }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[2, 3, 2]} intensity={24} />
          <Drei.Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.8}>
            {points.map((p, i) => (
              <mesh key={i} position={p}>
                <icosahedronGeometry args={[0.2 + (i % 5) * 0.03, 0]} />
                <meshStandardMaterial
                  metalness={0.2}
                  roughness={0.35}
                  color={i % 2 ? colorA : colorB}
                />
              </mesh>
            ))}
          </Drei.Float>
          <Drei.OrbitControls enablePan={false} enableZoom={false} />
        </Canvas>
      </Suspense>

      <style jsx>{`
        .sn-3d{
          aspect-ratio: 16/9;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,.08);
          background:
            radial-gradient(100% 100% at 0% 0%, rgba(255,0,119,.08), transparent 60%),
            radial-gradient(100% 100% at 100% 0%, rgba(0,162,255,.08), transparent 60%),
            #ffffff;
        }
        .sn-3d-skeleton { width:100%; height:100%; background:linear-gradient(90deg,#f2f2f2,#ffffff,#f2f2f2); }
        @media (max-width: 640px){
          .sn-3d{ aspect-ratio: 4/3; }
        }
      `}</style>
    </div>
  );
}
