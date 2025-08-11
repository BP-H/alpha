// components/ai/PortalHero.tsx
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

function Rotator() {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += d * 0.4;
    mesh.current.rotation.y += d * 0.6;
  });
  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[0.9, 0.28, 180, 24]} />
      {/* subtle “bloom-like” feel via emissive on light material (no extra libs) */}
      <meshStandardMaterial color={'#ffffff'} emissive={'#ff2db8'} emissiveIntensity={0.12} />
    </mesh>
  );
}

export default function PortalHero() {
  return (
    <div className="hero">
      <div className="heroInner" aria-label="Portal hero scene">
        <Canvas camera={{ position: [2.2, 1.2, 2.2], fov: 60 }}>
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 4, 2]} intensity={1.2} color={'#ffffff'} />
          <Suspense fallback={null}>
            <Rotator />
          </Suspense>
          {/* white floor reflection feel */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial color={'#f7f7f7'} />
          </mesh>
        </Canvas>
      </div>

      <style>{`
        .hero{
          width:100%;
          /* keep a light, breathable hero */
          background:#fff;
          border:1px solid #eee; border-radius:18px;
        }
        /* sticky is applied by parent (page.tsx) — transforms live on the child */
        .heroInner{
          height:300px;
          will-change: transform;
          transform: translateZ(0);
          border-radius:18px;
          overflow:hidden;
        }
        @media (min-width:768px){
          .heroInner{ height:360px; }
        }
      `}</style>
    </div>
  );
}
