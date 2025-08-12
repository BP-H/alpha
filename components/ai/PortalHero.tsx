'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

/** -----------------------------------------------------------
 *  Drop-in “Vite-style” portal:
 *  - soft neon glows, starfield particles, torus core
 *  - sticky but non-blocking (doesn’t eat clicks below)
 *  - collapses on scroll, opens a tiny “assistant” dock
 *  No CSS module required. All styles inline.
 *  ---------------------------------------------------------- */

function Stars({ count = 1200 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 7;                // radius
      const theta = Math.random() * Math.PI * 2;      // azimuth
      const phi = Math.acos(2 * Math.random() - 1);   // polar
      const i3 = i * 3;
      arr[i3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  const mat = useRef<THREE.PointsMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.size = 0.012 + Math.sin(clock.elapsedTime * 1.5) * 0.004;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={mat} color="#9fdcff" size={0.014} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

function EnergyCore({ glass }: { glass: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => {
    ref.current.rotation.y += 0.35 * d;
    ref.current.rotation.x -= 0.12 * d;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.55, 0.18, 180, 24]} />
      {glass ? (
        <meshPhysicalMaterial
          color="#b8a6ff"
          roughness={0.08}
          metalness={0.2}
          transmission={0.9}
          thickness={0.7}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      ) : (
        <meshStandardMaterial color="#b8a6ff" roughness={0.25} metalness={0.35} />
      )}
    </mesh>
  );
}

export default function PortalHero() {
  // visual toggles
  const [disableFX, setDisableFX] = useState(false);
  const [glass, setGlass] = useState(true);

  // sticky + scale on scroll (non-blocking)
  const [scale, setScale] = useState(1);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      lastY = y;
      const target = 1 - Math.min(y / 900, 0.2); // 1 → 0.8
      setScale((p) => p + (target - p) * 0.12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // assistant dock
  const [askOpen, setAskOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (askOpen) setTimeout(() => inputRef.current?.focus(), 0); }, [askOpen]);

  const BASE_H = 260;
  const MIN_H = 110;
  const dynamicH = Math.max(MIN_H, Math.round(BASE_H * scale));

  const onCreated = (state: any) => {
    const webgl2 = !!state.gl?.capabilities?.isWebGL2;
    const hiDPI = window.devicePixelRatio > 2;
    setDisableFX(!webgl2);
    setGlass(webgl2 && !hiDPI);
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 'calc(var(--topbar-h, 64px) + 8px)',
        zIndex: 1,
        pointerEvents: 'none',        // wrapper doesn’t eat clicks
        marginBottom: 12,
      }}
      aria-label="3D Portal"
    >
      <div
        style={{
          height: dynamicH,
          transition: 'height 120ms ease',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: '100%',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background:
              'radial-gradient(120% 80% at 20% 0%, rgba(255,47,146,.22), transparent 60%), ' +
              'radial-gradient(120% 80% at 80% 0%, rgba(14,165,255,.20), transparent 60%), ' +
              'linear-gradient(180deg, #0c0f16, #0a0d14)',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 120ms ease',
            boxShadow: '0 24px 60px rgba(0,0,0,.35)',
          }}
        >
          {/* soft overlay glows */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -40,
              background:
                'radial-gradient(60% 50% at 50% 35%, rgba(255,45,184,0.25), transparent 70%)',
              filter: 'blur(14px)',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -40,
              background:
                'radial-gradient(55% 45% at 50% 30%, rgba(155,140,255,0.20), transparent 70%)',
              filter: 'blur(18px)',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />

          <Canvas
            onCreated={onCreated}
            camera={{ position: [0, 0, 3.2], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%', pointerEvents: 'auto' }} // re-enable inside
          >
            <color attach="background" args={['#0a0b10']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 3, 2]} intensity={0.8} />

            <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.9}>
              <EnergyCore glass={glass} />
            </Float>

            {/* Vite-ish particles */}
            <Stars count={1400} />

            <ContactShadows position={[0, -0.85, 0]} opacity={0.22} scale={12} blur={1.7} far={2} />

            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.7} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
                <Noise premultiply opacity={0.05} />
                <Vignette eskil={false} offset={0.2} darkness={0.85} />
              </EffectComposer>
            )}

            {/* Center “enter” + Ask dock trigger */}
            <Html center>
              <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setAskOpen((v) => !v)}
                  style={btnStyle}
                  title="Open assistant"
                >
                  ✦ Ask
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  style={{ ...btnStyle, background: 'rgba(20,21,28,0.75)' }}
                >
                  Enter
                </button>
              </div>
            </Html>
          </Canvas>

          {/* Assistant dock (tiny, no backend—just UI) */}
          {askOpen && (
            <div
              style={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                display: 'grid',
                gap: 6,
                padding: 10,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,.12)',
                background: 'rgba(16,18,27,.82)',
                backdropFilter: 'blur(6px)',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ font: '600 12px/1.2 system-ui', color: '#e9eef5' }}>Assistant</div>
              <input
                ref={inputRef}
                placeholder="Ask the portal…"
                style={{
                  width: 240,
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,.16)',
                  background: 'rgba(8,9,13,.6)',
                  color: 'white',
                  padding: '0 10px',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // plug your backend here
                    (e.currentTarget as HTMLInputElement).value = '';
                  }
                }}
              />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={() => setAskOpen(false)} style={miniBtn}>Close</button>
                <button style={{ ...miniBtn, borderColor: 'transparent', background: 'linear-gradient(90deg,#ff2db8,#00d1ff)', color: '#fff' }}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  font: '600 13px/1 system-ui, -apple-system, Segoe UI, Roboto',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(12,14,20,0.8)',
  color: '#fff',
  cursor: 'pointer',
  userSelect: 'none',
};

const miniBtn: React.CSSProperties = {
  height: 30,
  padding: '0 10px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,.16)',
  background: 'rgba(20,22,30,.6)',
  color: '#e9eef5',
  cursor: 'pointer',
};
