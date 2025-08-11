"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Float,
  MeshReflectorMaterial,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/* ----------------------- utilities ----------------------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function useWebGLSupport() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const ctx =
        c.getContext("webgl") || c.getContext("experimental-webgl" as any);
      setOk(!!ctx);
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/* ------------------- camera parallax rig ------------------- */

function CameraRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { pointer, camera } = useThree();

  useFrame((state, dt) => {
    const t = Math.min(1, dt * 4); // smoother lerp
    const targetY = -pointer.y * 0.18;
    const targetX = pointer.x * 0.28;

    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetY,
      t
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetX,
      t
    );

    // subtle dolly based on pointer for depth
    const targetZ = 3.2 + Math.abs(pointer.y) * 0.25;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, t);
  });

  return <group ref={group}>{children}</group>;
}

/* -------------------- scene primitives -------------------- */

const ReflectiveFloor = memo(function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.65, 0]}>
      <planeGeometry args={[30, 30, 1, 1]} />
      <MeshReflectorMaterial
        mirror={0.6}
        blur={[400, 80]}
        mixBlur={1}
        mixStrength={1.8}
        resolution={1024}
        roughness={0.2}
        depthScale={0.6}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#ffffff"
      />
    </mesh>
  );
});

const NeonRig = memo(function NeonRig() {
  const bars = useMemo(
    () => [
      { pos: [-1.7, 1.0, -1.2], rot: [0.1, 0.2, -0.5], color: "#ffb6f2" },
      { pos: [1.8, 1.2, -1.0], rot: [0.05, -0.25, 0.45], color: "#a8c7ff" },
      { pos: [0, 1.6, -1.6], rot: [0, 0, 0.15], color: "#ffb6f2" },
    ],
    []
  );

  return (
    <group>
      {bars.map((b, i) => (
        <mesh
          key={i}
          position={b.pos as unknown as [number, number, number]}
          rotation={b.rot as unknown as [number, number, number]}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={[1.2, 0.03, 0.03]} />
          <meshStandardMaterial
            emissive={new THREE.Color(b.color)}
            emissiveIntensity={3}
            color={"#ffffff"}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
});

function ChromeCluster({ reduced }: { reduced: boolean }) {
  const g = useRef<THREE.Group>(null!);

  useFrame((_, d) => {
    if (!g.current) return;
    g.current.rotation.y += d * (reduced ? 0.08 : 0.25);
  });

  const chrome = useMemo(
    () => ({
      color: new THREE.Color("#ffffff"),
      metalness: 1,
      roughness: 0.05,
      envMapIntensity: 1.2,
    }),
    []
  );

  return (
    <group ref={g} position={[0, 0.35, 0]}>
      <Float
        speed={reduced ? 0.2 : 1.4}
        floatIntensity={reduced ? 0.1 : 0.6}
        rotationIntensity={reduced ? 0.1 : 0.4}
      >
        <mesh position={[0, 0.3, 0]}>
          <icosahedronGeometry args={[0.6, 2]} />
          <meshPhysicalMaterial {...chrome} />
        </mesh>
      </Float>

      <Float
        speed={reduced ? 0.15 : 1}
        floatIntensity={reduced ? 0.08 : 0.4}
        rotationIntensity={reduced ? 0.08 : 0.15}
      >
        <mesh position={[1.05, -0.05, -0.1]} rotation={[0, 0.4, 0.4]}>
          <torusKnotGeometry args={[0.25, 0.06, 200, 32]} />
          <meshPhysicalMaterial {...chrome} />
        </mesh>
      </Float>

      <Float
        speed={reduced ? 0.18 : 1.2}
        floatIntensity={reduced ? 0.1 : 0.5}
        rotationIntensity={reduced ? 0.08 : 0.2}
      >
        <mesh position={[-0.9, 0.05, 0.2]} rotation={[0.5, -0.3, 0.2]}>
          <capsuleGeometry args={[0.18, 0.6, 8, 16]} />
          <meshPhysicalMaterial {...chrome} />
        </mesh>
      </Float>
    </group>
  );
}

/* ---------------------- post fx chain ---------------------- */

function PostFX({ reduced }: { reduced: boolean }) {
  // Dial down effects if user prefers reduced motion
  const bloomIntensity = reduced ? 0.5 : 0.9;
  const noiseOpacity = reduced ? 0.015 : 0.03;

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.2}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0008, 0.0012)}
        radialModulation={false}
        modulationOffset={0.0}
      />
      <Noise opacity={noiseOpacity} />
      <Vignette eskil={false} offset={0.1} darkness={0.85} />
    </EffectComposer>
  );
}

/* ----------------------- main component ----------------------- */

export default function ComingSoon3D({
  title,
  subtitle,
  fallbackImage = "/superNova.png",
}: {
  title: string;
  subtitle?: string;
  fallbackImage?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLSupport();

  // graceful SSR / mount
  if (webgl === null) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(60% 50% at 50% 5%, #ffffff 0%, #f7f7fb 60%, #eef3ff 100%)",
        }}
      >
        <p style={{ fontFamily: "system-ui", opacity: 0.6 }}>
          Loading prototype…
        </p>
      </div>
    );
  }

  const uiShellStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 10,
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: 860,
    width: "100%",
    textAlign: "center",
    padding: "28px 22px",
    borderRadius: 18,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.6)",
    background: "rgba(255,255,255,0.55)",
    boxShadow: "0 20px 40px rgba(16,24,40,0.12)",
  };

  if (!webgl) {
    // Fallback for older browsers / GPU blacklist
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(60% 50% at 50% 5%, #ffffff 0%, #f7f7fb 60%, #eef3ff 100%)",
        }}
      >
        <div style={uiShellStyle}>
          <div style={cardStyle}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(28px, 5vw, 56px)",
                fontWeight: 800,
                lineHeight: 1.08,
                background:
                  "linear-gradient(90deg,#ff9bd3 0%, #6db3ff 50%, #ffb6f2 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                marginTop: 12,
                fontSize: "clamp(14px, 2.2vw, 18px)",
                color: "#5b6476",
              }}
            >
              {subtitle ||
                "We’re crafting something beautiful. Stay tuned."}
            </p>
            <img
              src={fallbackImage}
              alt="Preview"
              style={{
                marginTop: 18,
                width: "100%",
                maxWidth: 900,
                height: "auto",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            />
            <p style={{ marginTop: 10, opacity: 0.6, fontSize: 12 }}>
              Your browser fell back to a static preview (WebGL disabled).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // WebGL path
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(60% 50% at 50% 5%, #ffffff 0%, #f7f7fb 60%, #eef3ff 100%)",
      }}
    >
      {/* 3D */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas
          shadows={false}
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.8, 3.2], fov: 42 }}
        >
          <AdaptiveDpr pixelated={false} />
          <AdaptiveEvents />

          {/* ambient / key lights */}
          <color attach="background" args={["#ffffff"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 2]} intensity={1.1} />
          <directionalLight position={[-2, 2.5, 1]} intensity={0.7} />

          <Suspense fallback={null}>
            <Environment preset="studio" />

            <CameraRig>
              <ReflectiveFloor />
              <NeonRig />
              <ChromeCluster reduced={reduced} />
            </CameraRig>

            <PostFX reduced={reduced} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI */}
      <div style={uiShellStyle}>
        <div style={cardStyle}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.08,
              background:
                "linear-gradient(90deg,#ff9bd3 0%, #6db3ff 50%, #ffb6f2 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              marginTop: 12,
              fontSize: "clamp(14px, 2.2vw, 18px)",
              color: "#5b6476",
            }}
          >
            {subtitle || "We’re crafting something beautiful. Stay tuned."}
          </p>
        </div>
      </div>
    </div>
  );
}
