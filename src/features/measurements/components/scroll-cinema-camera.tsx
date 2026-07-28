"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { cinemaPoseAt } from "@/features/measurements/lib/cinema-camera-path";

type ScrollCinemaCameraProps = {
  /** Framer Motion scroll progress 0→1 — timeline for the fly-through. */
  progress: MotionValue<number>;
  /** When true, leave the camera alone (OrbitControls / static). */
  disabled?: boolean;
};

/**
 * Applies scroll progress to the R3F perspective camera each frame.
 * Scrubbing the page scroll rewinds / advances the cinematic path seamlessly.
 */
export function ScrollCinemaCamera({
  progress,
  disabled = false,
}: ScrollCinemaCameraProps) {
  const lookTarget = useRef(new THREE.Vector3(0, 1.12, 0));
  const scratch = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (disabled) return;
    const { camera } = state;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const pose = cinemaPoseAt(progress.get());
    scratch.current.set(...pose.position);
    camera.position.lerp(scratch.current, 0.18);
    lookTarget.current.set(...pose.lookAt);
    camera.lookAt(lookTarget.current);

    const nextFov = THREE.MathUtils.lerp(camera.fov, pose.fov, 0.12);
    if (Math.abs(camera.fov - nextFov) > 0.01) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
