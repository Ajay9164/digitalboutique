import { create } from "zustand";
import {
  clearAbandonedDraftCache,
  createEmptyDraftCache,
  hasUnsavedAbandonedDraft,
  readAbandonedDraftCache,
  writeAbandonedDraftCache,
  type AbandonedDraftCache,
  type DraftBoardCache,
} from "@/features/drafts/engine/abandoned-draft-cache";
import type { FabricId } from "@/features/drafts/engine/fabric-profiles";
import type {
  ControlPointId,
  Point,
} from "@/features/drafts/engine/konva-geometry";
import {
  DEFAULT_ENGINE_VALUES,
  type EngineFormValues,
} from "@/features/drafts/engine/schema";

type DraftState = {
  values: EngineFormValues;
  fabric: FabricId | null;
  showGrid: boolean;
  snapEnabled: boolean;
  board: DraftBoardCache;
  dirty: boolean;
  journalSaved: boolean;
  /** Bumps when Restore applies cache so the Konva board remounts controls. */
  restoreEpoch: number;
  setValues: (values: EngineFormValues) => void;
  setFabric: (fabric: FabricId | null) => void;
  setShowGrid: (show: boolean) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setBoardControls: (controls: Record<ControlPointId, Point>) => void;
  setBoardView: (view: Pick<DraftBoardCache, "scale" | "stagePos">) => void;
  /** Persist working state to localStorage (called on every mutation). */
  autosave: () => void;
  restoreFromCache: () => boolean;
  clearAbandonedDraft: () => void;
  markJournalSaved: () => void;
  hasAbandonedDraft: () => boolean;
  peekCache: () => AbandonedDraftCache | null;
};

function snapshot(state: DraftState): AbandonedDraftCache {
  return {
    values: state.values,
    fabric: state.fabric,
    showGrid: state.showGrid,
    snapEnabled: state.snapEnabled,
    board: state.board,
    dirty: state.dirty,
    journalSaved: state.journalSaved,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Active drafting-engine session + abandoned-draft autosave to localStorage.
 * Survives accidental closes; Journal commit clears the cutting-table flag.
 */
export const useDraftStore = create<DraftState>((set, get) => ({
  values: { ...DEFAULT_ENGINE_VALUES },
  fabric: null,
  showGrid: true,
  snapEnabled: true,
  board: {
    controls: null,
    scale: 1,
    stagePos: { x: 0, y: 0 },
  },
  dirty: false,
  journalSaved: false,
  restoreEpoch: 0,

  autosave: () => {
    const state = get();
    if (!state.dirty) return;
    writeAbandonedDraftCache(snapshot(state));
  },

  setValues: (values) => {
    set({ values, dirty: true, journalSaved: false });
    get().autosave();
  },

  setFabric: (fabric) => {
    set({ fabric, dirty: true, journalSaved: false });
    get().autosave();
  },

  setShowGrid: (showGrid) => {
    set({ showGrid, dirty: true, journalSaved: false });
    get().autosave();
  },

  setSnapEnabled: (snapEnabled) => {
    set({ snapEnabled, dirty: true, journalSaved: false });
    get().autosave();
  },

  setBoardControls: (controls) => {
    set((state) => ({
      board: { ...state.board, controls },
      dirty: true,
      journalSaved: false,
    }));
    get().autosave();
  },

  setBoardView: ({ scale, stagePos }) => {
    set((state) => ({
      board: { ...state.board, scale, stagePos },
      dirty: true,
      journalSaved: false,
    }));
    get().autosave();
  },

  restoreFromCache: () => {
    const cache = readAbandonedDraftCache();
    if (!cache || !hasUnsavedAbandonedDraft(cache)) return false;
    set({
      values: cache.values,
      fabric: cache.fabric,
      showGrid: cache.showGrid,
      snapEnabled: cache.snapEnabled,
      board: cache.board,
      dirty: true,
      journalSaved: false,
      restoreEpoch: get().restoreEpoch + 1,
    });
    return true;
  },

  clearAbandonedDraft: () => {
    clearAbandonedDraftCache();
    const empty = createEmptyDraftCache();
    set({
      values: empty.values,
      fabric: empty.fabric,
      showGrid: empty.showGrid,
      snapEnabled: empty.snapEnabled,
      board: empty.board,
      dirty: false,
      journalSaved: false,
      restoreEpoch: get().restoreEpoch + 1,
    });
  },

  markJournalSaved: () => {
    set({ journalSaved: true, dirty: false });
    const state = get();
    writeAbandonedDraftCache({
      ...snapshot(state),
      dirty: false,
      journalSaved: true,
    });
  },

  hasAbandonedDraft: () => hasUnsavedAbandonedDraft(readAbandonedDraftCache()),

  peekCache: () => readAbandonedDraftCache(),
}));
