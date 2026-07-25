import { create } from "zustand";
import type { JourneyMode } from "@/lib/db";
import {
  completeLesson,
  completeLessonSection,
  loadJourneyDashboard,
  recordLessonPractice,
  setFreeExplore,
  setJourneyMode,
  setNarrationEnabled,
  visitLesson,
  type JourneyDashboard,
} from "@/features/journey/lib/engine";

type JourneyStore = {
  hydrated: boolean;
  dashboard: JourneyDashboard | null;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  openLesson: (lessonId: string) => Promise<void>;
  markSection: (lessonId: string, sectionId: string) => Promise<void>;
  finishLesson: (
    lessonId: string,
    score?: { score: number; total: number },
  ) => Promise<void>;
  savePractice: (
    lessonId: string,
    score: number,
    total: number,
  ) => Promise<void>;
  changeMode: (mode: JourneyMode) => Promise<void>;
  toggleExplore: (enabled: boolean) => Promise<void>;
  toggleNarration: (enabled: boolean) => Promise<void>;
};

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  hydrated: false,
  dashboard: null,

  hydrate: async () => {
    if (get().hydrated) return;
    const dashboard = await loadJourneyDashboard();
    set({ hydrated: true, dashboard });
  },

  refresh: async () => {
    const dashboard = await loadJourneyDashboard();
    set({ dashboard, hydrated: true });
  },

  openLesson: async (lessonId) => {
    await visitLesson(lessonId);
    await get().refresh();
  },

  markSection: async (lessonId, sectionId) => {
    await completeLessonSection(lessonId, sectionId);
    await get().refresh();
  },

  finishLesson: async (lessonId, score) => {
    await completeLesson(lessonId, score);
    await get().refresh();
  },

  savePractice: async (lessonId, score, total) => {
    await recordLessonPractice(lessonId, score, total);
    await get().refresh();
  },

  changeMode: async (mode) => {
    await setJourneyMode(mode);
    await get().refresh();
  },

  toggleExplore: async (enabled) => {
    await setFreeExplore(enabled);
    await get().refresh();
  },

  toggleNarration: async (enabled) => {
    await setNarrationEnabled(enabled);
    await get().refresh();
  },
}));
