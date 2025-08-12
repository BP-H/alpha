'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import styles from './portalHero.module.css';

type ShapeProps = { paused?: boolean; seed?: number; glass?: boolean };

function Rock({ paused, seed = 0 }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  const color = useMemo(
    () => new THREE.Color().setHSL((seed * 0.137) % 1, 0.25, 0.6),
    [seed]
  );
  useFrame((_, d) => {
    if (paused) return;
    mesh.current.rotation.x += 0.25 * d;
    mesh.current.rotation.y -= 0.18 * d;
  });
  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <icosahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

function Cube({ paused, seed = 0 }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  const color = useMemo(
    () => new THREE.Color().setHSL((0.6 + seed * 0.21) % 1, 0.2, 0.7),
    [seed]
  );
  useFrame((_, d) => {
    if (paused) return;
    mesh.current.rotation.x += 0.2 * d;
    mesh.current.rotation.z += 0.15 * d;
  });
  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <boxGeometry args={[0.48, 0.48, 0.48]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.15} />
    </mesh>
  );
}

function Torus({ paused, glass = false }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => {
    if (paused) return;
    mesh.current.rotation.y -= 0.35 * d;
  });
  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <torusKnotGeometry args={[0.26, 0.08, 100, 16]} />
      {glass ? (
        <meshPhysicalMaterial
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.6}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.15}
          color="#b9b5ff"
        />
      ) : (
        <meshStandardMaterial color="#b9b5ff" roughness={0.25} metalness={0.25} />
      )}
    </mesh>
  );
}

export default function PortalHero({ logoSrc = '/icon.png' }: { logoSrc?: string }) {
  const [scale, setScale] = useState(1);
  const [open, setOpen] = useState(false);
  const [disableFX, setDisableFX] = useState(false);
  const [noGlass, setNoGlass] = useState(false);
  const [kick, setKick] = useState(0);

  // gentle shrink + motion kick on scroll
  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - lastY);
      lastY = y;
      const target = 1 - Math.min(y / 900, 0.15); // 1 → 0.85
      setScale((prev) => prev + (target - prev) * 0.12);
      setKick((k) => Math.min(1, k + delta / 800));
      if (!raf) {
        const tick = () => {
          setKick((k) => (k > 0.001 ? k * 0.9 : 0));
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // FX capability check
  const onCreated = (state: any) => {
    const webgl2 = !!state.gl?.capabilities?.isWebGL2;
    const isHiDPI = window.devicePixelRatio > 2;
    setDisableFX(!webgl2);
    setNoGlass(!webgl2 || isHiDPI);
  };

  const BASE_H = 220;
  const MIN_H = 92;
  const dynamicH = Math.max(MIN_H, Math.round(BASE_H * scale));

  const glowPinkStyle: React.CSSProperties = {
    opacity: 0.5 + kick * 0.4,
    filter: `blur(${6 + 12 * kick}px)`,
  };
  const glowPurpleStyle: React.CSSProperties = {
    opacity: 0.4 + kick * 0.3,
    filter: `blur(${8 + 10 * kick}px)`,
  };

  const shapes = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => {
        const kind = (['rock', 'cube', 'torus'] as const)[i % 3];
        const pos = new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 5
        );
        return (
          <group key={i} position={pos}>
            {kind === 'rock' && <Rock seed={i} />}
            {kind === 'cube' && <Cube seed={i} />}
            {kind === 'torus' && <Torus seed={i} glass={!noGlass} />}
          </group>
        );
      }),
    [noGlass]
  );

  return (
    <div className={styles.portal}>
      <div className={styles.shell} style={{ height: dynamicH }}>
        <div className={styles.card} style={{ transform: `scale(${scale})` }}>
          <div aria-hidden className={styles.glowPink} style={glowPinkStyle} />
          <div aria-hidden className={styles.glowPurple} style={glowPurpleStyle} />
          <div aria-hidden className={styles.glossAngle} />
          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            onCreated={onCreated}
          >
            <color attach="background" args={['#0a0b10']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 3, 2]} intensity={0.8} />

            <Float speed={1} rotationIntensity={0.3} floatIntensity={0.8}>
              <group position={[-1.2, 0.2, 0]}>
                <Rock paused={!open} />
              </group>
            </Float>
            <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
              <group position={[0.8, -0.2, 0.2]}>
                <Cube paused={!open} />
              </group>
            </Float>
            <Float speed={0.9} rotationIntensity={0.4} floatIntensity={0.9}>
              <group position={[0.2, 0.35, -0.3]}>
                <Torus paused={!open} glass={!noGlass} />
              </group>
            </Float>

            <ContactShadows position={[0, -0.85, 0]} opacity={0.25} scale={10} blur={1.6} far={2} />

            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.6} luminanceThreshold={0.75} luminanceSmoothing={0.2} />
              </EffectComposer>
            )}

            <Html center>
              <button
                type="button"
                aria-label="Open 3D portal"
                onClick={() => setOpen(true)}
                style={{
                  font: '600 14px/1 system-ui, -apple-system, Segoe UI, Roboto',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(20,21,28,0.8)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                Enter universe — tap to interact
              </button>
            </Html>
          </Canvas>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(10,11,16,0.9)' }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
            <color attach="background" args={['#0a0b10']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[3, 2, 2]} intensity={0.9} />
            {shapes}
            <OrbitControls enablePan={false} />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.2} scale={15} blur={2.2} far={3} />
            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.7} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
              </EffectComposer>
            )}
            <Html center>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(20,21,28,0.65)',
                  color: 'white',
                  font: '600 13px/1 system-ui, -apple-system, Segoe UI, Roboto',
                  userSelect: 'none',
                }}
              >
                <img src={logoSrc} alt="app logo" width={18} height={18} style={{ borderRadius: 4 }} />
                Tap anywhere to close
              </div>
            </Html>
          </Canvas>
        </div>
      )}
    </div>
  );
}
