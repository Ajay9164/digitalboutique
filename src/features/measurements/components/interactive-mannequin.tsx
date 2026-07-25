"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Line, OrbitControls } from "@react-three/drei";
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
import { useMeasurementStore } from "@/stores/measurement-store";

const FORM_COLOR = "#E8E2D6";
const STAND_COLOR = "#2B2E33";
const REGION_IDLE = "#7BA8A0";
const REGION_HOVER = "#4FB3A1";
const REGION_ACTIVE = "#2DD4BF";

/* -------------------------------------------------------------------------- */
/* Mannequin body — pure geometry. Swap this component for a GLTF scene later */
/* (e.g. useGLTF) without touching anything below it.                         */
/* -------------------------------------------------------------------------- */

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

  return (
    <group>
      {/* Dress form torso */}
      <mesh geometry={torsoGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={FORM_COLOR} roughness={0.92} metalness={0.02} />
      </mesh>

      {/* Bust shaping */}
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 1.32, 0.1]} castShadow>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial color={FORM_COLOR} roughness={0.92} metalness={0.02} />
        </mesh>
      ))}

      {/* Neck knob */}
      <mesh position={[0, 1.71, 0]} castShadow>
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshStandardMaterial color={STAND_COLOR} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Arms */}
      {[1, -1].map((side) => (
        <group
          key={side}
          position={[ARM_PIVOT[0] * side, ARM_PIVOT[1], ARM_PIVOT[2]]}
          rotation={[0, 0, ARM_TILT * side]}
        >
          <mesh position={[0, -0.26, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.42, 8, 24]} />
            <meshStandardMaterial
              color={FORM_COLOR}
              roughness={0.92}
              metalness={0.02}
            />
          </mesh>
        </group>
      ))}

      {/* Stand */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.62, 16]} />
        <meshStandardMaterial color={STAND_COLOR} roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <cylinderGeometry args={[0.23, 0.26, 0.05, 32]} />
        <meshStandardMaterial color={STAND_COLOR} roughness={0.7} metalness={0.3} />
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
};

function useRegionState(id: MeasurementId) {
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const hoveredId = useMeasurementStore((s) => s.hoveredId);
  const select = useMeasurementStore((s) => s.select);
  const setHovered = useMeasurementStore((s) => s.setHovered);

  const selected = selectedId === id;
  const hovered = hoveredId === id;
  const color = selected ? REGION_ACTIVE : hovered ? REGION_HOVER : REGION_IDLE;
  const opacity = selected ? 1 : hovered ? 0.9 : 0.4;

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

/** Gentle breathing pulse on the selected region (runs on the R3F frame loop). */
function usePulse(active: boolean) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const target = active ? 1 + Math.sin(clock.elapsedTime * 4.2) * 0.045 : 1;
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, target, 0.2));
  });
  return groupRef;
}

function RingRegion({ id, anchor }: RegionProps) {
  if (anchor.type !== "ring") throw new Error("RingRegion requires a ring anchor");
  const { selected, color, opacity, handlers } = useRegionState(id);
  const groupRef = usePulse(selected);

  return (
    <group ref={groupRef} position={anchor.center}>
      {/* Visible band */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[anchor.radius, selected ? 0.011 : 0.007, 12, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.9 : 0.25}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Invisible fat hit area */}
      <mesh rotation={[Math.PI / 2, 0, 0]} {...handlers}>
        <torusGeometry args={[anchor.radius, 0.035, 8, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function LineRegion({ id, anchor }: RegionProps) {
  if (anchor.type !== "line") throw new Error("LineRegion requires a line anchor");
  const { selected, color, opacity, handlers } = useRegionState(id);
  const groupRef = usePulse(selected);

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

  return (
    <group ref={groupRef}>
      <Line
        points={points}
        color={color}
        lineWidth={selected ? 3.5 : 2}
        transparent
        opacity={opacity}
      />
      {/* End caps */}
      {[points[0], points[points.length - 1]].map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[selected ? 0.012 : 0.009, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={selected ? 0.9 : 0.25}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
      {/* Invisible fat hit area */}
      <mesh geometry={tubeGeometry} {...handlers}>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PointRegion({ id, anchor }: RegionProps) {
  if (anchor.type !== "point") throw new Error("PointRegion requires a point anchor");
  const { selected, color, opacity, handlers } = useRegionState(id);
  const groupRef = usePulse(selected);
  const radius = anchor.radius ?? 0.018;

  return (
    <group ref={groupRef} position={anchor.at}>
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 1 : 0.3}
          roughness={0.35}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh {...handlers}>
        <sphereGeometry args={[radius + 0.025, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Region({ id, anchor }: RegionProps) {
  if (anchor.type === "ring") return <RingRegion id={id} anchor={anchor} />;
  if (anchor.type === "line") return <LineRegion id={id} anchor={anchor} />;
  return <PointRegion id={id} anchor={anchor} />;
}

function RegionOverlays() {
  const bodyRegions = MEASUREMENTS.filter(
    (m) => REGION_ANCHORS[m.id].attach === "body",
  );
  const armRegions = MEASUREMENTS.filter(
    (m) => REGION_ANCHORS[m.id].attach === "arm",
  );

  return (
    <>
      {bodyRegions.map((m) => (
        <Region key={m.id} id={m.id} anchor={REGION_ANCHORS[m.id]} />
      ))}
      {/* Arm regions live inside the left-arm transform */}
      <group position={ARM_PIVOT} rotation={[0, 0, ARM_TILT]}>
        {armRegions.map((m) => (
          <Region key={m.id} id={m.id} anchor={REGION_ANCHORS[m.id]} />
        ))}
      </group>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Studio scene                                                               */
/* -------------------------------------------------------------------------- */

function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      {/* Key light */}
      <directionalLight
        position={[2.2, 3.2, 2.4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Fill */}
      <directionalLight position={[-2, 1.6, 1.8]} intensity={0.55} />
      {/* Rim / hair light */}
      <spotLight
        position={[-1.6, 2.8, -2.4]}
        intensity={1.1}
        angle={0.5}
        penumbra={0.8}
      />
    </>
  );
}

export type InteractiveMannequinProps = {
  className?: string;
};

export default function InteractiveMannequin({
  className,
}: InteractiveMannequinProps) {
  const select = useMeasurementStore((s) => s.select);

  return (
    <div
      className={className}
      role="img"
      aria-label="Interactive 3D mannequin. Tap a highlighted region to open its measurement lesson."
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0.5, 1.5, 2.1], fov: 33 }}
        onPointerMissed={() => select(null)}
      >
        <StudioLighting />
        <MannequinBody />
        <RegionOverlays />
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.4}
          scale={2.4}
          blur={2.6}
          far={1.8}
        />
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          enableDamping
          dampingFactor={0.08}
          target={[0, 1.12, 0]}
          minDistance={0.8}
          maxDistance={4}
          maxPolarAngle={Math.PI * 0.62}
        />
      </Canvas>
    </div>
  );
}
