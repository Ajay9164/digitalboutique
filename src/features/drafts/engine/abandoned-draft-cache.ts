import {
  DEFAULT_ENGINE_VALUES,
  type EngineFormValues,
} from "@/features/drafts/engine/schema";
import type { FabricId } from "@/features/drafts/engine/fabric-profiles";
import type {
  ControlPointId,
  Point,
} from "@/features/drafts/engine/konva-geometry";

export const ABANDONED_DRAFT_STORAGE_KEY = "tailor-abandoned-draft";

export type DraftBoardCache = {
  controls: Record<ControlPointId, Point> | null;
  scale: number;
  stagePos: { x: number; y: number };
};

export type AbandonedDraftCache = {
  values: EngineFormValues;
  fabric: FabricId | null;
  showGrid: boolean;
  snapEnabled: boolean;
  board: DraftBoardCache;
  dirty: boolean;
  journalSaved: boolean;
  updatedAt: string;
};

export const DEFAULT_BOARD_CACHE: DraftBoardCache = {
  controls: null,
  scale: 1,
  stagePos: { x: 0, y: 0 },
};

export function createEmptyDraftCache(): AbandonedDraftCache {
  return {
    values: { ...DEFAULT_ENGINE_VALUES },
    fabric: null,
    showGrid: true,
    snapEnabled: true,
    board: { ...DEFAULT_BOARD_CACHE, stagePos: { x: 0, y: 0 } },
    dirty: false,
    journalSaved: false,
    updatedAt: new Date().toISOString(),
  };
}

export function readAbandonedDraftCache(): AbandonedDraftCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ABANDONED_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AbandonedDraftCache;
    if (!parsed?.values || typeof parsed.dirty !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAbandonedDraftCache(cache: AbandonedDraftCache): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      ABANDONED_DRAFT_STORAGE_KEY,
      JSON.stringify({
        ...cache,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Quota / private mode — fail quietly; in-memory store still works.
  }
}

export function clearAbandonedDraftCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ABANDONED_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** True when a cutting-table draft exists that was never committed to Journal. */
export function hasUnsavedAbandonedDraft(
  cache: AbandonedDraftCache | null = readAbandonedDraftCache(),
): boolean {
  if (!cache) return false;
  return cache.dirty && !cache.journalSaved;
}
