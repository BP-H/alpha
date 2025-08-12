'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import styles from './portalHero.module.css';

export default function PortalHero() {
  const [disableFX, setDisableFX] = useState(false);

  const onCreated = (state: any) => {
    const webgl2 = !!state.gl?.capabilities?.isWebGL2;
    setDisableFX(!webgl2);
  };

  return (
    <div className={styles.portal}>
      <div className={styles.shell}>
        <div className={styles.card}>
          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            onCreated={onCreated}
          >
            <color attach="background" args={['#0a0b10']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 3, 2]} intensity={0.8} />

            <Float speed={1} rotationIntensity={0.35} floatIntensity={0.9}>
              <mesh>
                <torusKnotGeometry args={[0.6, 0.18, 120, 16]} />
                <meshStandardMaterial
                  color="#b8a6ff"
                  metalness={0.6}
                  roughness={0.2}
                />
              </mesh>
            </Float>

            <ContactShadows
              position={[0, -0.85, 0]}
              opacity={0.25}
              scale={10}
              blur={1.6}
              far={2}
            />

            {!disableFX && (
              <EffectComposer>
                <Bloom
                  intensity={0.6}
                  luminanceThreshold={0.75}
                  luminanceSmoothing={0.2}
                />
              </EffectComposer>
            )}
          </Canvas>
        </div>
      </div>
    </div>
  );
}
