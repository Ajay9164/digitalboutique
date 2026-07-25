import { create } from "zustand";
import { db, type StudioPhotoRecord } from "@/lib/db";
import {
  DEFAULT_CROP,
  DEFAULT_OVERLAY,
  type CropRect,
  type OverlayTransform,
  type StudioTool,
} from "@/features/studio/lib/overlay";
import type { PatternId } from "@/features/studio/data/patterns";
import { createId } from "@/features/studio/lib/camera";

export type StudioPhase = "camera" | "workspace" | "library";

type StudioState = {
  hydrated: boolean;
  phase: StudioPhase;
  photos: StudioPhotoRecord[];
  activePhotoId: string | null;
  /** Live capture preview (not yet saved). */
  capturePreview: {
    dataUrl: string;
    width: number;
    height: number;
  } | null;
  patternId: PatternId;
  overlay: OverlayTransform;
  crop: CropRect;
  tool: StudioTool;
  zoom: number;
  showGrid: boolean;
  showRuler: boolean;
  snapEnabled: boolean;
  cameraError: string | null;
  hydrate: () => Promise<void>;
  setPhase: (phase: StudioPhase) => void;
  setCameraError: (message: string | null) => void;
  setCapturePreview: (
    preview: { dataUrl: string; width: number; height: number } | null,
  ) => void;
  saveCapture: (label?: string) => Promise<StudioPhotoRecord | null>;
  selectPhoto: (id: string) => void;
  deletePhoto: (id: string) => Promise<void>;
  setPattern: (id: PatternId) => void;
  setOverlay: (partial: Partial<OverlayTransform>) => void;
  resetOverlay: () => void;
  setCrop: (partial: Partial<CropRect>) => void;
  resetCrop: () => void;
  setTool: (tool: StudioTool) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleRuler: () => void;
  toggleSnap: () => void;
};

export const useStudioStore = create<StudioState>((set, get) => ({
  hydrated: false,
  phase: "camera",
  photos: [],
  activePhotoId: null,
  capturePreview: null,
  patternId: "boat-neck",
  overlay: { ...DEFAULT_OVERLAY },
  crop: { ...DEFAULT_CROP },
  tool: "move",
  zoom: 1,
  showGrid: true,
  showRuler: true,
  snapEnabled: true,
  cameraError: null,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const { withDb } = await import("@/lib/db/safe");
      const { data: photos, error } = await withDb(
        () => db.studioPhotos.orderBy("createdAt").reverse().toArray(),
        [] as StudioPhotoRecord[],
      );
      if (error) {
        set({
          hydrated: true,
          photos: [],
          cameraError: error,
        });
        return;
      }
      set({
        hydrated: true,
        photos,
        activePhotoId: photos[0]?.id ?? null,
        // Keep users on Camera when empty so Capture is immediately available.
        phase: photos.length > 0 ? "workspace" : "camera",
      });
    } catch (error) {
      set({
        hydrated: true,
        photos: [],
        cameraError:
          error instanceof Error
            ? error.message
            : "Could not load saved fabric photos.",
      });
    }
  },

  setPhase: (phase) => set({ phase }),

  setCameraError: (message) => set({ cameraError: message }),

  setCapturePreview: (preview) => set({ capturePreview: preview }),

  saveCapture: async (label) => {
    const preview = get().capturePreview;
    if (!preview) {
      throw new Error("No captured image to save.");
    }
    if (!preview.dataUrl?.startsWith("data:image/")) {
      throw new Error("Captured image data is invalid.");
    }

    const { withDb } = await import("@/lib/db/safe");
    const record: StudioPhotoRecord = {
      id: createId(),
      dataUrl: preview.dataUrl,
      width: preview.width,
      height: preview.height,
      label: label?.trim() || `Fabric ${new Date().toLocaleString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { error } = await withDb(async () => {
      await db.studioPhotos.put(record);
      return true;
    }, false);

    if (error) {
      throw new Error(error);
    }

    set((state) => ({
      photos: [record, ...state.photos],
      activePhotoId: record.id,
      capturePreview: null,
      phase: "workspace",
      overlay: { ...DEFAULT_OVERLAY },
      crop: { ...DEFAULT_CROP },
      zoom: 1,
      cameraError: null,
    }));
    return record;
  },

  selectPhoto: (id) =>
    set({
      activePhotoId: id,
      phase: "workspace",
      overlay: { ...DEFAULT_OVERLAY },
      crop: { ...DEFAULT_CROP },
      zoom: 1,
    }),

  deletePhoto: async (id) => {
    const { withDb } = await import("@/lib/db/safe");
    const { error } = await withDb(async () => {
      await db.studioPhotos.delete(id);
      return true;
    }, false);
    if (error) {
      throw new Error(error);
    }
    set((state) => {
      const photos = state.photos.filter((photo) => photo.id !== id);
      const activePhotoId =
        state.activePhotoId === id ? (photos[0]?.id ?? null) : state.activePhotoId;
      return {
        photos,
        activePhotoId,
        phase: photos.length === 0 ? "camera" : state.phase,
      };
    });
  },

  setPattern: (id) => set({ patternId: id, phase: "workspace" }),

  setOverlay: (partial) =>
    set((state) => ({ overlay: { ...state.overlay, ...partial } })),

  resetOverlay: () => set({ overlay: { ...DEFAULT_OVERLAY } }),

  setCrop: (partial) =>
    set((state) => {
      const crop = { ...state.crop, ...partial };
      crop.width = Math.min(1 - crop.x, Math.max(0.2, crop.width));
      crop.height = Math.min(1 - crop.y, Math.max(0.2, crop.height));
      crop.x = Math.min(Math.max(0, crop.x), 1 - crop.width);
      crop.y = Math.min(Math.max(0, crop.y), 1 - crop.height);
      return { crop };
    }),

  resetCrop: () => set({ crop: { ...DEFAULT_CROP } }),

  setTool: (tool) => set({ tool }),

  setZoom: (zoom) => set({ zoom: Math.min(3, Math.max(0.5, zoom)) }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  toggleRuler: () => set((state) => ({ showRuler: !state.showRuler })),

  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
}));
