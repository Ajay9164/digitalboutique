"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, SpotLight } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { luxuryMaterialAt } from "@/features/measurements/lib/luxury-material";

const NAVY_VOID = "#070B16";
const CHAMPAGNE = "#F0D9A0";
const GOLD_RIM = "#FFE6A8";

/**
 * Deep navy void + soft fog — luxury stage without remote HDR.
 * Fog thins on the climax pull-back so the full digital form stays crisp.
 */
export function LuxurySceneAtmosphere({
  progress,
}: {
  progress?: MotionValue<number>;
}) {
  const fogRef = useRef<THREE.FogExp2>(null);

  useFrame(() => {
    if (!fogRef.current) return;
    const t = progress?.get() ?? 0;
    // Hold density through the orbit; open the stage for the grand reveal.
    const climax = Math.max(0, (t - 0.72) / 0.28);
    fogRef.current.density = 0.055 - climax * 0.028;
  });

  return (
    <>
      <color attach="background" args={[NAVY_VOID]} />
      <fogExp2 ref={fogRef} attach="fog" args={[NAVY_VOID, 0.055]} />
    </>
  );
}

/**
 * Champagne gold key/rim + navy GI hemisphere + soft volumetric shafts.
 */
export function LuxuryStudioLighting({
  progress,
}: {
  progress?: MotionValue<number>;
}) {
  const goldKeyRef = useRef<THREE.SpotLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const t = progress?.get() ?? 0;
    // Holo phase: slightly cooler rim intensity for neon edge.
    if (rimRef.current) {
      rimRef.current.intensity = 1.15 + t * 0.55;
    }
    if (goldKeyRef.current) {
      goldKeyRef.current.intensity = 48 + t * 18;
    }
  });

  return (
    <>
      {/* Global illumination fake — champagne sky bounce / navy ground */}
      <hemisphereLight
        color={CHAMPAGNE}
        groundColor="#0A1024"
        intensity={0.38}
      />
      <ambientLight color="#12182A" intensity={0.22} />

      {/* Dramatic champagne key (soft spotlight = volumetric feel) */}
      <SpotLight
        ref={goldKeyRef}
        position={[2.6, 4.2, 2.4]}
        angle={0.42}
        penumbra={0.85}
        intensity={52}
        color={GOLD_RIM}
        castShadow
        shadow-mapSize={1024}
        shadow-bias={-0.00015}
        distance={12}
        attenuation={6}
        anglePower={4}
      />

      {/* Champagne gold rim — pierces silhouette from behind */}
      <directionalLight
        ref={rimRef}
        position={[-2.8, 2.4, -2.2]}
        intensity={1.25}
        color={GOLD_RIM}
      />

      {/* Soft navy fill (GI bounce from floor) */}
      <directionalLight
        position={[0.2, 1.2, 3.2]}
        intensity={0.28}
        color="#6B7FA8"
      />

      {/* Cool accent for holographic phase edges */}
      <pointLight
        position={[0.8, 1.5, 1.4]}
        intensity={0.35}
        color="#5EEFFF"
        distance={4}
      />

      <VolumetricGoldShafts />
    </>
  );
}

/** Lightweight god-ray cones (no postprocessing / remote assets). */
function VolumetricGoldShafts() {
  const mats = useMemo(() => {
    const make = (opacity: number) =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(GOLD_RIM),
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
    return [make(0.045), make(0.03)];
  }, []);

  useEffect(() => {
    return () => {
      for (const m of mats) m.dispose();
    };
  }, [mats]);

  return (
    <group>
      <mesh
        position={[1.8, 3.1, 1.6]}
        rotation={[0.55, 0.35, -0.2]}
        material={mats[0]}
      >
        <coneGeometry args={[0.55, 3.2, 24, 1, true]} />
      </mesh>
      <mesh
        position={[-1.6, 2.6, -1.4]}
        rotation={[-0.4, -0.5, 0.35]}
        material={mats[1]}
      >
        <coneGeometry args={[0.4, 2.6, 20, 1, true]} />
      </mesh>
    </group>
  );
}

/** Soft luxury contact shadow under the stand. */
export function LuxuryContactShadow() {
  return (
    <ContactShadows
      position={[0, 0.001, 0]}
      resolution={256}
      scale={7}
      blur={2.4}
      opacity={0.5}
      far={4.5}
      color="#02040A"
      frames={1}
    />
  );
}

type CraftToHoloMaterialProps = {
  progress?: MotionValue<number>;
  map?: THREE.Texture | null;
  /** Arms / non-draped parts still morph. */
  forceHoloBlend?: boolean;
};

/**
 * Mesh physical material that morphs raw craft → holographic mesh with scroll.
 */
export function CraftToHoloMaterial({
  progress,
  map = null,
}: CraftToHoloMaterialProps) {
  const ref = useRef<THREE.MeshPhysicalMaterial>(null);
  const colorA = useRef(new THREE.Color());
  const sheenA = useRef(new THREE.Color());
  const emisA = useRef(new THREE.Color());
  const draped = Boolean(map);

  useFrame(() => {
    const mat = ref.current;
    if (!mat) return;
    const t = progress?.get() ?? 0;
    const state = luxuryMaterialAt(t);

    colorA.current.set(state.color);
    if (draped) {
      // Keep print readable; still pick up sheen / iridescence from the journey.
      mat.color.set("#ffffff");
      mat.map = map;
      mat.roughness = THREE.MathUtils.lerp(0.55, state.roughness, 0.45);
      mat.metalness = THREE.MathUtils.lerp(0.02, state.metalness, 0.35);
      mat.transmission = state.transmission * 0.25;
    } else {
      mat.color.copy(colorA.current);
      mat.map = null;
      mat.roughness = state.roughness;
      mat.metalness = state.metalness;
      mat.transmission = state.transmission;
    }

    mat.clearcoat = state.clearcoat;
    mat.clearcoatRoughness = state.clearcoatRoughness;
    mat.sheen = state.sheen;
    mat.sheenRoughness = state.sheenRoughness;
    sheenA.current.set(state.sheenColor);
    mat.sheenColor.copy(sheenA.current);
    mat.iridescence = state.iridescence;
    mat.iridescenceIOR = state.iridescenceIOR;
    emisA.current.set(state.emissive);
    mat.emissive.copy(emisA.current);
    mat.emissiveIntensity = draped
      ? state.emissiveIntensity * 0.35
      : state.emissiveIntensity;
    mat.envMapIntensity = state.envMapIntensity;
    mat.thickness = state.thickness;
    mat.needsUpdate = true;
  });

  const initial = luxuryMaterialAt(0);

  return (
    <meshPhysicalMaterial
      ref={ref}
      color={initial.color}
      roughness={initial.roughness}
      metalness={initial.metalness}
      clearcoat={initial.clearcoat}
      clearcoatRoughness={initial.clearcoatRoughness}
      sheen={initial.sheen}
      sheenRoughness={initial.sheenRoughness}
      sheenColor={initial.sheenColor}
      iridescence={initial.iridescence}
      iridescenceIOR={initial.iridescenceIOR}
      emissive={initial.emissive}
      emissiveIntensity={initial.emissiveIntensity}
      envMapIntensity={initial.envMapIntensity}
      transmission={initial.transmission}
      thickness={initial.thickness}
      toneMapped
    />
  );
}
