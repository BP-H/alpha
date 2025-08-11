'use client';

import dynamic from 'next/dynamic';
import { OrbitControls, Float } from '@react-three/drei';

const Canvas = dynamic(() => import('@react-three/fiber').then(m => m.Canvas), { ssr: false });

export default function Page3D() {
  return (
    <main style={{ minHeight: '100vh', background: '#fff', display: 'grid', placeItems: 'center' }}>
      <div style={{ width: 'min(92vw, 900px)', height: 'min(70vh, 560px)', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
        <Canvas camera={{ position: [0, 0, 4], fov: 55 }}>
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[2, 3, 2]} intensity={0.9} />
          <Float>
            <mesh>
              <torusKnotGeometry args={[0.9, 0.28, 200, 24]} />
              <meshPhysicalMaterial color="#4f46e5" roughness={0.2} transmission={0.35} thickness={2} />
            </mesh>
          </Float>
          <OrbitControls />
        </Canvas>
      </div>
    </main>
  );
}
