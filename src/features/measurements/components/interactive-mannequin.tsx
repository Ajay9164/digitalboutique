"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Line,
  OrbitControls,
} from "@react-three/drei";
import {
  MEASUREMENTS,
  type MeasurementId,
} from "@/features/measurements/data/measurements";
import {
  ARM_PIVOT,
  ARM_TILT,
  REGION_ANCHORS,
  type RegionAnchor,
} from "@/features/measurements/components/mannequin-regions";
import { Mannequin2DFallback } from "@/features/measurements/components/mannequin-2d-fallback";
import { MannequinWebGLBoundary } from "@/features/measurements/components/mannequin-webgl-boundary";
import { buildMorphedProfile } from "@/features/measurements/lib/mannequin-morph";
import { useFabricTexture } from "@/features/measurements/hooks/use-fabric-texture";
import { useMeasurementStore } from "@/stores/measurement-store";
import { useStudioStore } from "@/stores/studio-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/** Luxury dress-form + cyberpunk measurement neon */
const FORM_COLOR = "#E8E0D4";
const STAND_COLOR = "#0A0C12";
const REGION_IDLE = "#3D6B75";
const REGION_HOVER = "#4FD6E8";
const REGION_ACTIVE = "#5EFFF0";

/* -------------------------------------------------------------------------- */
/* Mannequin body — parametric lathe + optional Studio fabric drape texture   */
/* -------------------------------------------------------------------------- */

function SilkMaterial({
  color = FORM_COLOR,
  roughness = 0.38,
  metalness = 0.06,
  map = null,
}: {
  color?: string;
  roughness?: number;
  metalness?: number;
  map?: THREE.Texture | null;
}) {
  // When draped, soften clearcoat so print detail stays readable.
  const draped = Boolean(map);
  return (
    <meshPhysicalMaterial
      color={draped ? "#ffffff" : color}
      map={map ?? undefined}
      roughness={draped ? 0.55 : roughness}
      metalness={draped ? 0.02 : metalness}
      clearcoat={draped ? 0.25 : 0.55}
      clearcoatRoughness={draped ? 0.6 : 0.45}
      envMapIntensity={0.45}
    />
  );
}

function MannequinBody({ fabricMap }: { fabricMap: THREE.Texture | null }) {
  const morph = useMeasurementStore((s) => s.bodyMorph);

  const torsoGeometry = useMemo(() => {
    const profile = buildMorphedProfile(morph);
    return new THREE.LatheGeometry(
      profile.map(([x, y]) => new THREE.Vector2(x, y)),
      48,
    );
  }, [morph]);

  useEffect(() => {
    return () => {
      torsoGeometry.dispose();
    };
  }, [torsoGeometry]);

  const bustRadius = 0.075 * morph.bust;
  const bustX = 0.09 * Math.sqrt(morph.bust);

  return (
    <group>
      <mesh geometry={torsoGeometry} castShadow receiveShadow>
        <SilkMaterial map={fabricMap} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[bustX * side, 1.32, 0.1]}
          castShadow
          scale={[1, 1, 0.92]}
        >
          <sphereGeometry args={[bustRadius, 24, 24]} />
          <SilkMaterial map={fabricMap} />
        </mesh>
      ))}

      <mesh position={[0, 1.71, 0]} castShadow>
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshPhysicalMaterial
          color={STAND_COLOR}
          roughness={0.4}
          metalness={0.45}
          clearcoat={0.35}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {[1, -1].map((side) => (
        <group
          key={side}
          position={[
            ARM_PIVOT[0] * side * (0.92 + morph.bust * 0.08),
            ARM_PIVOT[1],
            ARM_PIVOT[2],
          ]}
          rotation={[0, 0, ARM_TILT * side]}
        >
          <mesh position={[0, -0.26, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.42, 6, 16]} />
            <SilkMaterial />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.62, 16]} />
        <meshPhysicalMaterial
          color={STAND_COLOR}
          roughness={0.4}
          metalness={0.5}
          clearcoat={0.3}
        />
      </mesh>
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <cylinderGeometry args={[0.23, 0.26, 0.05, 32]} />
        <meshPhysicalMaterial
          color={STAND_COLOR}
          roughness={0.5}
          metalness={0.35}
          clearcoat={0.25}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Interaction layer — driven only by REGION_ANCHORS + the Zustand store.     */
/* -------------------------------------------------------------------------- */

type RegionProps = {
  id: MeasurementId;
  anchor: RegionAnchor;
  reduceMotion: boolean;
};

function useRegionState(id: MeasurementId) {
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const hoveredId = useMeasurementStore((s) => s.hoveredId);
  const select = useMeasurementStore((s) => s.select);
  const setHovered = useMeasurementStore((s) => s.setHovered);

  const selected = selectedId === id;
  const hovered = hoveredId === id;
  const color = selected ? REGION_ACTIVE : hovered ? REGION_HOVER : REGION_IDLE;
  const opacity = selected ? 1 : hovered ? 0.95 : 0.55;

  const handlers = {
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      select(selected ? null : id);
    },
    onPointerOver: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      setHovered(id);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      setHovered(null);
      document.body.style.cursor = "auto";
    },
  };

  return { selected, hovered, color, opacity, handlers };
}

/**
 * Beginner “click me” pulse on idle regions; tighter breath when selected.
 * Uses frame delta only (no THREE.Clock).
 */
function useInvitePulse(selected: boolean, reduceMotion: boolean) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    elapsedRef.current += delta;

    if (reduceMotion) {
      group.scale.setScalar(1);
      if (materialRef.current) {
        materialRef.current.emissiveIntensity = selected ? 1.35 : 0.35;
      }
      return;
    }

    const speed = selected ? 5.2 : 1.35;
    const amp = selected ? 0.055 : 0.07;
    const wave = Math.sin(elapsedRef.current * speed);
    const target = 1 + wave * amp;
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, target, 0.14));

    if (materialRef.current) {
      const base = selected ? 1.15 : 0.28;
      const glowAmp = selected ? 0.55 : 0.42;
      materialRef.current.emissiveIntensity =
        base + (wave * 0.5 + 0.5) * glowAmp;
    }
  });

  return { groupRef, materialRef };
}

function RingRegion({ id, anchor, reduceMotion }: RegionProps) {
  if (anchor.type !== "ring") throw new Error("RingRegion requires a ring anchor");
  const { selected, color, opacity, handlers } = useRegionState(id);
  const { groupRef, materialRef } = useInvitePulse(selected, reduceMotion);

  return (
    <group ref={groupRef} position={anchor.center}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[anchor.radius, selected ? 0.012 : 0.008, 16, 72]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 1.4 : 0.35}
          roughness={0.35}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} {...handlers}>
        <torusGeometry args={[anchor.radius, 0.038, 8, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function LineRegion({ id, anchor, reduceMotion }: RegionProps) {
  if (anchor.type !== "line") throw new Error("LineRegion requires a line anchor");
  const { selected, color, opacity, handlers } = useRegionState(id);
  const { groupRef } = useInvitePulse(selected, reduceMotion);

  const { points, tubeGeometry } = useMemo(() => {
    const from = new THREE.Vector3(...anchor.from);
    const to = new THREE.Vector3(...anchor.to);
    const curve = anchor.via
      ? new THREE.QuadraticBezierCurve3(from, new THREE.Vector3(...anchor.via), to)
      : new THREE.LineCurve3(from, to);
    return {
      points: curve.getPoints(32),
      tubeGeometry: new THREE.TubeGeometry(curve, 24, 0.028, 8, false),
    };
  }, [anchor]);

  useEffect(() => {
    return () => {
      tubeGeometry.dispose();
    };
  }, [tubeGeometry]);

  return (
    <group ref={groupRef}>
      <Line
        points={points}
        color={color}
        lineWidth={selected ? 3.5 : 2.25}
        transparent
        opacity={opacity}
      />
      {[points[0], points[points.length - 1]].map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[selected ? 0.013 : 0.01, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={selected ? 1.35 : 0.4}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
      <mesh geometry={tubeGeometry} {...handlers}>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PointRegion({ id, anchor, reduceMotion }: RegionProps) {
  if (anchor.type !== "point") throw new Error("PointRegion requires a point anchor");
  const { selected, color, opacity, handlers } = useRegionState(id);
  const { groupRef, materialRef } = useInvitePulse(selected, reduceMotion);
  const radius = anchor.radius ?? 0.018;

  return (
    <group ref={groupRef} position={anchor.at}>
      <mesh>
        <sphereGeometry args={[radius, 20, 20]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 1.4 : 0.4}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh {...handlers}>
        <sphereGeometry args={[radius + 0.028, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Region({ id, anchor, reduceMotion }: RegionProps) {
  if (anchor.type === "ring")
    return <RingRegion id={id} anchor={anchor} reduceMotion={reduceMotion} />;
  if (anchor.type === "line")
    return <LineRegion id={id} anchor={anchor} reduceMotion={reduceMotion} />;
  return <PointRegion id={id} anchor={anchor} reduceMotion={reduceMotion} />;
}

function RegionOverlays({ reduceMotion }: { reduceMotion: boolean }) {
  const bodyRegions = MEASUREMENTS.filter(
    (m) => REGION_ANCHORS[m.id].attach === "body",
  );
  const armRegions = MEASUREMENTS.filter(
    (m) => REGION_ANCHORS[m.id].attach === "arm",
  );

  return (
    <>
      {bodyRegions.map((m) => (
        <Region
          key={m.id}
          id={m.id}
          anchor={REGION_ANCHORS[m.id]}
          reduceMotion={reduceMotion}
        />
      ))}
      <group position={ARM_PIVOT} rotation={[0, 0, ARM_TILT]}>
        {armRegions.map((m) => (
          <Region
            key={m.id}
            id={m.id}
            anchor={REGION_ANCHORS[m.id]}
            reduceMotion={reduceMotion}
          />
        ))}
      </group>
    </>
  );
}

function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.42} />
      <hemisphereLight color="#F2E6C8" groundColor="#0A1020" intensity={0.48} />
      <directionalLight
        position={[2.4, 3.4, 2.2]}
        intensity={1.05}
        color="#FFE6A8"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[-2.4, 1.6, 1.2]}
        intensity={0.55}
        color="#5EFFF0"
      />
      <directionalLight position={[0.2, 2.8, -2.4]} intensity={0.22} color="#8AB4FF" />
    </>
  );
}

export type InteractiveMannequinProps = {
  className?: string;
};

function WebGLContextGuard({ onContextLost }: { onContextLost: () => void }) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    canvas.addEventListener("webglcontextlost", handleLost, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost, false);
    };
  }, [gl, onContextLost]);

  return null;
}

/**
 * Tear down the WebGL animation loop on unmount to avoid GPU leaks
 * when leaving Measurements (R3F Canvas remounts on return).
 * Avoid WEBGL_lose_context here — it races with contextlost → sticky 2D fallback.
 */
function WebGLLifecycleCleanup() {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
      try {
        gl.setAnimationLoop(null);
      } catch {
        // ignore
      }
      try {
        gl.dispose();
      } catch {
        // ignore
      }
    };
  }, [gl]);

  return null;
}

function MannequinCanvas({
  onContextLost,
}: {
  onContextLost: () => void;
}) {
  const select = useMeasurementStore((s) => s.select);
  const reduceMotion = useReducedMotion();
  const fabricDrapeEnabled = useMeasurementStore((s) => s.fabricDrapeEnabled);
  const fabricPhotoId = useMeasurementStore((s) => s.fabricPhotoId);
  const photos = useStudioStore((s) => s.photos);
  const activePhotoId = useStudioStore((s) => s.activePhotoId);

  const drapePhoto = useMemo(() => {
    if (!fabricDrapeEnabled) return null;
    const id = fabricPhotoId ?? activePhotoId;
    if (!id) return null;
    return photos.find((p) => p.id === id) ?? null;
  }, [fabricDrapeEnabled, fabricPhotoId, activePhotoId, photos]);

  const fabricMap = useFabricTexture(drapePhoto?.displayUrl ?? null);

  return (
    <Canvas
      className="absolute inset-0 h-full w-full touch-none"
      shadows="percentage"
      dpr={[1, 1.25]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "default",
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{ position: [0.55, 1.48, 2.05], fov: 32, near: 0.1, far: 40 }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      onPointerMissed={() => select(null)}
    >
      <WebGLContextGuard onContextLost={onContextLost} />
      <WebGLLifecycleCleanup />
      <StudioLighting />
      {/* No Environment / HDR — those fetch remote assets and break offline. */}
      <MannequinBody fabricMap={fabricMap} />
      <RegionOverlays reduceMotion={!!reduceMotion} />
      <ContactShadows
        position={[0, 0.001, 0]}
        resolution={256}
        scale={6}
        blur={1.8}
        opacity={0.4}
        far={4}
      />
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.08}
        target={[0, 1.12, 0]}
        minDistance={1.05}
        maxDistance={3.1}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.58}
        minAzimuthAngle={-Math.PI * 0.85}
        maxAzimuthAngle={Math.PI * 0.85}
      />
    </Canvas>
  );
}

export default function InteractiveMannequin({
  className,
}: InteractiveMannequinProps) {
  // Start SSR/hydration-safe; sync online status after mount only.
  const [use2D, setUse2D] = useState(false);
  const [offline, setOffline] = useState(false);
  const onContextLost = useCallback(() => setUse2D(true), []);

  useEffect(() => {
    const applyOffline = () => {
      setOffline(true);
      setUse2D(true);
    };
    const applyOnline = () => setOffline(false);

    if (!navigator.onLine) {
      applyOffline();
    }

    window.addEventListener("offline", applyOffline);
    window.addEventListener("online", applyOnline);
    return () => {
      window.removeEventListener("offline", applyOffline);
      window.removeEventListener("online", applyOnline);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <div
      className={cn(
        "relative h-full min-h-[400px] w-full overflow-hidden",
        className,
      )}
      role="img"
      aria-label="Interactive mannequin. Tap a glowing region to open its measurement lesson."
    >
      {use2D ? (
        <Mannequin2DFallback
          message={
            offline
              ? "Offline Mode — Using 2D Mannequin"
              : "3D View Unavailable — Using 2D Mode"
          }
        />
      ) : (
        <MannequinWebGLBoundary>
          <div className="relative h-full min-h-[400px] w-full">
            <MannequinCanvas onContextLost={onContextLost} />
          </div>
        </MannequinWebGLBoundary>
      )}
    </div>
  );
}
