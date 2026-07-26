"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

type TextureEntry = {
  url: string;
  texture: THREE.Texture;
};

/**
 * Load a Studio fabric image URL (OPFS blob: or data:) into a Three.js texture.
 * Disposes previous textures on change/unmount — safe for route leaves.
 * setState only runs from the async image onload (never sync in the effect body).
 */
export function useFabricTexture(imageUrl: string | null): THREE.Texture | null {
  const [entry, setEntry] = useState<TextureEntry | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    let cancelled = false;
    let created: THREE.Texture | null = null;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      const texture = new THREE.Texture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1.6, 2.1);
      texture.anisotropy = 4;
      texture.needsUpdate = true;
      created = texture;
      setEntry({ url: imageUrl, texture });
    };

    image.onerror = () => {
      if (!cancelled) setEntry(null);
    };

    image.src = imageUrl;

    return () => {
      cancelled = true;
      created?.dispose();
    };
  }, [imageUrl]);

  if (!imageUrl) return null;
  if (!entry || entry.url !== imageUrl) return null;
  return entry.texture;
}
