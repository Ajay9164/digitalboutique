"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Line,
  OrbitControls,
} from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";
import { ScrollCinemaCamera } from "@/features/measurements/components/scroll-cinema-camera";
import { CinematicLoader } from "@/features/measurements/components/cinematic-loader";
import {
  CraftToHoloMaterial,
  LuxuryContactShadow,
  LuxurySceneAtmosphere,
  LuxuryStudioLighting,
} from "@/features/measurements/components/luxury-studio";
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

/** Luxury dress-form stand + cyberpunk measurement neon */
const STAND_COLOR = "#0A0C12";
const REGION_IDLE = "#3D6B75";
const REGION_HOVER = "#4FD6E8";
const REGION_ACTIVE = "#5EFFF0";

/* -------------------------------------------------------------------------- */
/* Mannequin body — parametric lathe + craft→holo material + fabric drape     */
/* -------------------------------------------------------------------------- */

function MannequinBody({
  fabricMap,
  scrollProgress,
}: {
  fabricMap: THREE.Texture | null;
  scrollProgress?: MotionValue<number>;
}) {
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
        <CraftToHoloMaterial progress={scrollProgress} map={fabricMap} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[bustX * side, 1.32, 0.1]}
          castShadow
          scale={[1, 1, 0.92]}
        >
          <sphereGeometry args={[bustRadius, 24, 24]} />
          <CraftToHoloMaterial progress={scrollProgress} map={fabricMap} />
        </mesh>
      ))}

      <mesh position={[0, 1.71, 0]} castShadow>
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshPhysicalMaterial
          color={STAND_COLOR}
          roughness={0.35}
          metalness={0.55}
          clearcoat={0.4}
          clearcoatRoughness={0.35}
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
            <CraftToHoloMaterial progress={scrollProgress} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.62, 16]} />
        <meshPhysicalMaterial
          color={STAND_COLOR}
          roughness={0.35}
          metalness={0.6}
          clearcoat={0.35}
        />
      </mesh>
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <cylinderGeometry args={[0.23, 0.26, 0.05, 32]} />
        <meshPhysicalMaterial
          color={STAND_COLOR}
          roughness={0.45}
          metalness={0.4}
          clearcoat={0.3}
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

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (reduceMotion || !selected) {
      group.scale.setScalar(1);
      if (materialRef.current) {
        materialRef.current.emissiveIntensity = selected ? 1.35 : 0.35;
      }
      // Idle / unselected: do not invalidate — keeps frameloop="demand" parked.
      return;
    }

    elapsedRef.current += delta;
    const speed = 5.2;
    const amp = 0.055;
    const wave = Math.sin(elapsedRef.current * speed);
    const target = 1 + wave * amp;
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, target, 0.14));

    if (materialRef.current) {
      const base = 1.15;
      const glowAmp = 0.55;
      materialRef.current.emissiveIntensity =
        base + (wave * 0.5 + 0.5) * glowAmp;
    }

    // Keep the demand loop alive only while the selected region is pulsing.
    state.invalidate();
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

export type InteractiveMannequinProps = {
  className?: string;
  /**
   * Framer Motion scroll progress (0→1). When set, drives a cinematic
   * camera fly-through and craft→holo material morph; OrbitControls
   * stay available when reduced-motion prefers free orbit.
   */
  scrollProgress?: MotionValue<number>;
  /** Fires once the WebGL canvas is created and ready for narrative. */
  onReady?: () => void;
  /** Curtain-drop teardown — pause the frame loop and fade the canvas. */
  dismantling?: boolean;
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

/**
 * With `frameloop="demand"`, push a redraw when selection / morph / hover changes.
 */
function InvalidateOnInteraction() {
  const invalidate = useThree((s) => s.invalidate);
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const hoveredId = useMeasurementStore((s) => s.hoveredId);
  const morphBust = useMeasurementStore((s) => s.bodyMorph.bust);
  const morphWaist = useMeasurementStore((s) => s.bodyMorph.waist);
  const morphHips = useMeasurementStore((s) => s.bodyMorph.hips);

  useEffect(() => {
    invalidate();
  }, [invalidate, selectedId, hoveredId, morphBust, morphWaist, morphHips]);

  return null;
}

function MannequinCanvas({
  onContextLost,
  scrollProgress,
  onReady,
  dismantling = false,
}: {
  onContextLost: () => void;
  scrollProgress?: MotionValue<number>;
  onReady?: () => void;
  dismantling?: boolean;
}) {
  const select = useMeasurementStore((s) => s.select);
  const reduceMotion = useReducedMotion();
  const fabricDrapeEnabled = useMeasurementStore((s) => s.fabricDrapeEnabled);
  const fabricPhotoId = useMeasurementStore((s) => s.fabricPhotoId);
  const photos = useStudioStore((s) => s.photos);
  const activePhotoId = useStudioStore((s) => s.activePhotoId);
  const readySent = useRef(false);

  const drapePhoto = useMemo(() => {
    if (!fabricDrapeEnabled) return null;
    const id = fabricPhotoId ?? activePhotoId;
    if (!id) return null;
    return photos.find((p) => p.id === id) ?? null;
  }, [fabricDrapeEnabled, fabricPhotoId, activePhotoId, photos]);

  const fabricMap = useFabricTexture(drapePhoto?.displayUrl ?? null);
  const cinemaEnabled = Boolean(scrollProgress) && !reduceMotion && !dismantling;

  return (
    <Canvas
      className="absolute inset-0 h-full w-full touch-none"
      shadows="percentage"
      // Cap DPR to protect scroll cinema from dropped frames on HiDPI.
      dpr={[1, 1.15]}
      performance={{ min: 0.5, max: 1, debounce: 200 }}
      // Cinema needs a continuous loop; atelier view parks the GPU when idle.
      frameloop={
        dismantling ? "never" : cinemaEnabled ? "always" : "demand"
      }
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        stencil: false,
        depth: true,
      }}
      camera={{ position: [0.55, 1.48, 2.05], fov: 32, near: 0.1, far: 40 }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        // Defer one frame so first paint settles before narrative unlock.
        requestAnimationFrame(() => {
          if (!readySent.current) {
            readySent.current = true;
            onReady?.();
          }
        });
      }}
      onPointerMissed={() => select(null)}
    >
      <Suspense fallback={null}>
        <WebGLContextGuard onContextLost={onContextLost} />
        <WebGLLifecycleCleanup />
        {!cinemaEnabled ? <InvalidateOnInteraction /> : null}
        <LuxurySceneAtmosphere progress={scrollProgress} />
        <LuxuryStudioLighting progress={scrollProgress} />
        {/* No Environment / HDR — those fetch remote assets and break offline. */}
        <MannequinBody fabricMap={fabricMap} scrollProgress={scrollProgress} />
        <RegionOverlays reduceMotion={!!reduceMotion} />
        <LuxuryContactShadow />
        {cinemaEnabled && scrollProgress ? (
          <ScrollCinemaCamera progress={scrollProgress} />
        ) : null}
        <OrbitControls
          makeDefault
          enabled={!cinemaEnabled}
          enablePan={!cinemaEnabled}
          enableZoom={!cinemaEnabled}
          enableRotate={!cinemaEnabled}
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
      </Suspense>
    </Canvas>
  );
}

export default function InteractiveMannequin({
  className,
  scrollProgress,
  onReady,
  dismantling = false,
}: InteractiveMannequinProps) {
  // Start SSR/hydration-safe; sync online status after mount only.
  const [use2D, setUse2D] = useState(false);
  const [offline, setOffline] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const onContextLost = useCallback(() => setUse2D(true), []);
  const readySent = useRef(false);

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

  useEffect(() => {
    // 2D fallback still unlocks narrative so titles aren't blocked forever.
    if (use2D && !readySent.current) {
      readySent.current = true;
      setSceneReady(true);
      onReady?.();
    }
  }, [use2D, onReady]);

  const handleReady = useCallback(() => {
    if (readySent.current) return;
    readySent.current = true;
    setSceneReady(true);
    onReady?.();
  }, [onReady]);

  return (
    <motion.div
      className={cn(
        "relative h-full min-h-0 w-full overflow-hidden bg-black",
        className,
      )}
      role="img"
      aria-label="Interactive mannequin. Scroll to fly the camera around the dress form, or tap a glowing region to open its measurement lesson."
      animate={{ opacity: dismantling ? 0 : 1 }}
      transition={{ duration: dismantling ? 0.22 : 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <CinematicLoader dismiss={sceneReady || dismantling} />
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
          <div className="relative h-full min-h-0 w-full">
            <Suspense fallback={<CinematicLoader />}>
              <MannequinCanvas
                onContextLost={onContextLost}
                scrollProgress={scrollProgress}
                onReady={handleReady}
                dismantling={dismantling}
              />
            </Suspense>
          </div>
        </MannequinWebGLBoundary>
      )}
    </motion.div>
  );
}
