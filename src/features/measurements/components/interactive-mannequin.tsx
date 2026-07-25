"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
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
import { useMeasurementStore } from "@/stores/measurement-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/** Soft matte-silk / marble dress-form palette */
const FORM_COLOR = "#EDE6DC";
const STAND_COLOR = "#2A2E34";
const REGION_IDLE = "#6FA89E";
const REGION_HOVER = "#4FB3A1";
const REGION_ACTIVE = "#2DD4BF";

/* -------------------------------------------------------------------------- */
/* Mannequin body — pure geometry. Swap this component for a GLTF scene later */
/* (e.g. useGLTF) without touching anything below it.                         */
/* -------------------------------------------------------------------------- */

function SilkMaterial({
  color = FORM_COLOR,
  roughness = 0.38,
  metalness = 0.06,
}: {
  color?: string;
  roughness?: number;
  metalness?: number;
}) {
  // Lighter PhysicalMaterial for integrated GPUs — silk look without sheen/high clearcoat.
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      clearcoat={0.55}
      clearcoatRoughness={0.45}
      envMapIntensity={0.45}
    />
  );
}

function MannequinBody() {
  const torsoGeometry = useMemo(() => {
    const profile: Array<[number, number]> = [
      [0.001, 0.64],
      [0.09, 0.66],
      [0.155, 0.72],
      [0.175, 0.88],
      [0.14, 0.98],
      [0.115, 1.06],
      [0.125, 1.14],
      [0.135, 1.22],
      [0.175, 1.32],
      [0.145, 1.42],
      [0.16, 1.5],
      [0.1, 1.54],
      [0.055, 1.58],
      [0.045, 1.66],
    ];
    return new THREE.LatheGeometry(
      profile.map(([x, y]) => new THREE.Vector2(x, y)),
      48,
    );
  }, []);

  useEffect(() => {
    return () => {
      torsoGeometry.dispose();
    };
  }, [torsoGeometry]);

  return (
    <group>
      <mesh geometry={torsoGeometry} castShadow receiveShadow>
        <SilkMaterial />
      </mesh>

      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 1.32, 0.1]} castShadow>
          <sphereGeometry args={[0.075, 24, 24]} />
          <SilkMaterial />
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
          position={[ARM_PIVOT[0] * side, ARM_PIVOT[1], ARM_PIVOT[2]]}
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
        materialRef.current.emissiveIntensity = selected ? 0.7 : 0.35;
      }
      return;
    }

    const speed = selected ? 4.2 : 1.35;
    const amp = selected ? 0.045 : 0.07;
    const wave = Math.sin(elapsedRef.current * speed);
    const target = 1 + wave * amp;
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, target, 0.14));

    if (materialRef.current) {
      const base = selected ? 0.85 : 0.28;
      const glowAmp = selected ? 0.25 : 0.42;
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
          emissiveIntensity={selected ? 0.9 : 0.35}
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
            emissiveIntensity={selected ? 0.9 : 0.4}
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
          emissiveIntensity={selected ? 1 : 0.4}
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
      <ambientLight intensity={0.5} />
      <hemisphereLight color="#f5f1ea" groundColor="#2a3338" intensity={0.45} />
      <directionalLight
        position={[2.4, 3.4, 2.2]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-2.2, 1.8, 1.4]} intensity={0.4} />
    </>
  );
}

export type InteractiveMannequinProps = {
  className?: string;
};

function MannequinCanvas({
  onContextLost,
}: {
  onContextLost: () => void;
}) {
  const select = useMeasurementStore((s) => s.select);
  const reduceMotion = useReducedMotion();

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

        const canvas = gl.domElement;
        const handleLost = (event: Event) => {
          event.preventDefault();
          onContextLost();
        };
        canvas.addEventListener("webglcontextlost", handleLost, false);
      }}
      onPointerMissed={() => select(null)}
    >
      <StudioLighting />
      <Suspense fallback={null}>
        <Environment preset="apartment" environmentIntensity={0.35} />
      </Suspense>
      <MannequinBody />
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
  const [use2D, setUse2D] = useState(false);

  return (
    <div
      className={cn(
        "relative h-[50vh] min-h-[400px] w-full overflow-hidden",
        className,
      )}
      role="img"
      aria-label="Interactive mannequin. Tap a glowing region to open its measurement lesson."
    >
      {use2D ? (
        <Mannequin2DFallback message="3D View Unavailable — Using 2D Mode" />
      ) : (
        <MannequinWebGLBoundary>
          <MannequinCanvas onContextLost={() => setUse2D(true)} />
        </MannequinWebGLBoundary>
      )}
    </div>
  );
}
