import type { StudioPhoto, StudioPhotoRecord } from "@/lib/db";
import {
  blobToThumbnailDataUrl,
  dataUrlToBlob,
  deleteFabricBlob,
  isOpfsSupported,
  readFabricBlob,
  writeFabricBlob,
} from "@/lib/opfs/fabric-files";

const objectUrls = new Map<string, string>();

function revokeDisplayUrl(id: string) {
  const url = objectUrls.get(id);
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
  objectUrls.delete(id);
}

export function revokeAllFabricObjectUrls() {
  for (const id of objectUrls.keys()) {
    revokeDisplayUrl(id);
  }
}

/**
 * Persist a captured fabric image — prefer OPFS for the full JPEG,
 * keep a tiny thumbnail in IndexedDB for instant offline lists.
 */
export async function persistFabricCapture(input: {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  label: string;
}): Promise<StudioPhotoRecord> {
  const now = new Date();
  let opfsKey: string | null = null;
  let storedDataUrl = input.dataUrl;

  if (isOpfsSupported()) {
    try {
      const blob = await dataUrlToBlob(input.dataUrl);
      opfsKey = await writeFabricBlob(input.id, blob);
      storedDataUrl = await blobToThumbnailDataUrl(blob);
    } catch {
      // Quota / OPFS quirk — fall back to IndexedDB full data URL.
      opfsKey = null;
      storedDataUrl = input.dataUrl;
    }
  }

  return {
    id: input.id,
    dataUrl: storedDataUrl,
    opfsKey,
    width: input.width,
    height: input.height,
    label: input.label,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Resolve a displayable URL for a photo (OPFS blob URL or inline data URL).
 * Lazily migrates legacy full-size IndexedDB images into OPFS when available.
 */
export async function resolveStudioPhoto(
  record: StudioPhotoRecord,
): Promise<StudioPhoto> {
  revokeDisplayUrl(record.id);

  if (record.opfsKey) {
    const blob = await readFabricBlob(record.id);
    if (blob) {
      const displayUrl = URL.createObjectURL(blob);
      objectUrls.set(record.id, displayUrl);
      return { ...record, displayUrl };
    }
  }

  // Legacy: full image still in IndexedDB — migrate to OPFS in the background.
  if (!record.opfsKey && record.dataUrl.startsWith("data:image/") && isOpfsSupported()) {
    try {
      const blob = await dataUrlToBlob(record.dataUrl);
      const opfsKey = await writeFabricBlob(record.id, blob);
      const thumb = await blobToThumbnailDataUrl(blob);
      const { db } = await import("@/lib/db");
      const migrated: StudioPhotoRecord = {
        ...record,
        opfsKey,
        dataUrl: thumb,
        updatedAt: new Date(),
      };
      await db.studioPhotos.put(migrated);
      const displayUrl = URL.createObjectURL(blob);
      objectUrls.set(record.id, displayUrl);
      return { ...migrated, displayUrl };
    } catch {
      // Keep serving the inline data URL.
    }
  }

  const displayUrl = record.dataUrl || "";
  objectUrls.set(record.id, displayUrl);
  return { ...record, displayUrl };
}

export async function resolveStudioPhotos(
  records: StudioPhotoRecord[],
): Promise<StudioPhoto[]> {
  return Promise.all(records.map((record) => resolveStudioPhoto(record)));
}

export async function removeFabricCapture(id: string): Promise<void> {
  revokeDisplayUrl(id);
  await deleteFabricBlob(id);
}
