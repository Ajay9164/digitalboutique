/**
 * Origin Private File System helpers for high-res fabric captures.
 * IndexedDB keeps metadata; OPFS holds the binary JPEG offline with far higher quotas.
 */

const FABRIC_DIR = "fabric-captures";

export function isOpfsSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.storage?.getDirectory === "function"
  );
}

async function getFabricDirectory(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(FABRIC_DIR, { create: true });
}

export function fabricFileName(id: string): string {
  return `${id}.jpg`;
}

export async function writeFabricBlob(id: string, blob: Blob): Promise<string> {
  const dir = await getFabricDirectory();
  const name = fabricFileName(id);
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  try {
    await writable.write(blob);
  } finally {
    await writable.close();
  }
  return name;
}

export async function readFabricBlob(id: string): Promise<Blob | null> {
  try {
    const dir = await getFabricDirectory();
    const handle = await dir.getFileHandle(fabricFileName(id));
    const file = await handle.getFile();
    return file;
  } catch {
    return null;
  }
}

export async function deleteFabricBlob(id: string): Promise<void> {
  try {
    const dir = await getFabricDirectory();
    await dir.removeEntry(fabricFileName(id));
  } catch {
    // Already gone — ignore
  }
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/** Build a short JPEG data-URL thumbnail for IndexedDB fallback / previews. */
export async function blobToThumbnailDataUrl(
  blob: Blob,
  maxEdge = 320,
  quality = 0.72,
): Promise<string> {
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Could not create thumbnail canvas.");
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close();
  }
}
