import { create } from "zustand";
import type { JournalProject } from "@/lib/db";
import {
  createProject,
  deleteProject,
  downloadBackupJson,
  exportBackup,
  importBackup,
  listProjects,
  readBackupFile,
  updateProject,
} from "@/features/journal/lib/backup";
import { recordActivity } from "@/features/learning/lib/ecosystem";
import {
  DEFAULT_FILTER,
  createEmptyProjectInput,
  filterAndSortProjects,
  projectToInput,
  type JournalFilter,
  type JournalSort,
  type ProjectInput,
} from "@/features/journal/lib/project";

export type JournalView =
  | "list"
  | "create"
  | "edit"
  | "viewer";

type JournalState = {
  hydrated: boolean;
  projects: JournalProject[];
  filter: JournalFilter;
  sort: JournalSort;
  view: JournalView;
  activeId: string | null;
  draft: ProjectInput;
  statusMessage: string | null;
  errorMessage: string | null;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  retryStorage: () => Promise<void>;
  setFilter: (partial: Partial<JournalFilter>) => void;
  setSort: (sort: JournalSort) => void;
  openCreate: () => void;
  openEdit: (id: string) => void;
  openViewer: (id: string) => void;
  closeOverlay: () => void;
  setDraft: (partial: Partial<ProjectInput>) => void;
  setDraftMeasurements: (partial: ProjectInput["measurements"]) => void;
  setDraftLearning: (partial: Partial<ProjectInput["learningProgress"]>) => void;
  saveDraft: () => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  exportJson: () => Promise<void>;
  importJson: (file: File, mode?: "merge" | "replace") => Promise<void>;
  clearMessages: () => void;
};

export const useJournalStore = create<JournalState>((set, get) => ({
  hydrated: false,
  projects: [],
  filter: { ...DEFAULT_FILTER },
  sort: "date-desc",
  view: "list",
  activeId: null,
  draft: createEmptyProjectInput(),
  statusMessage: null,
  errorMessage: null,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const projects = await listProjects();
      set({ hydrated: true, projects, errorMessage: null });
    } catch (error) {
      set({
        hydrated: true,
        projects: [],
        errorMessage:
          error instanceof Error
            ? error.message
            : "Journal storage is unavailable on this device.",
      });
    }
  },

  retryStorage: async () => {
    const { resetDbAvailabilityCache } = await import("@/lib/db/safe");
    resetDbAvailabilityCache();
    set({ hydrated: false, errorMessage: null, projects: [] });
    await get().hydrate();
  },

  refresh: async () => {
    try {
      const projects = await listProjects();
      set({ projects, errorMessage: null });
    } catch (error) {
      set({
        errorMessage:
          error instanceof Error
            ? error.message
            : "Could not refresh journal projects.",
      });
    }
  },

  setFilter: (partial) =>
    set((state) => ({ filter: { ...state.filter, ...partial } })),

  setSort: (sort) => set({ sort }),

  openCreate: () =>
    set({
      view: "create",
      activeId: null,
      draft: createEmptyProjectInput(),
      errorMessage: null,
    }),

  openEdit: (id) => {
    const project = get().projects.find((item) => item.id === id);
    if (!project) return;
    set({
      view: "edit",
      activeId: id,
      draft: projectToInput(project),
      errorMessage: null,
    });
  },

  openViewer: (id) =>
    set({
      view: "viewer",
      activeId: id,
      errorMessage: null,
    }),

  closeOverlay: () =>
    set({
      view: "list",
      activeId: null,
      draft: createEmptyProjectInput(),
    }),

  setDraft: (partial) =>
    set((state) => ({ draft: { ...state.draft, ...partial } })),

  setDraftMeasurements: (partial) =>
    set((state) => ({
      draft: {
        ...state.draft,
        measurements: { ...state.draft.measurements, ...partial },
      },
    })),

  setDraftLearning: (partial) =>
    set((state) => ({
      draft: {
        ...state.draft,
        learningProgress: { ...state.draft.learningProgress, ...partial },
      },
    })),

  saveDraft: async () => {
    const { view, activeId, draft } = get();
    if (!draft.name.trim()) {
      set({ errorMessage: "Project name is required." });
      return;
    }

    try {
      if (view === "edit" && activeId) {
        await updateProject(activeId, draft);
        set({
          statusMessage: "Project updated.",
          view: "viewer",
          errorMessage: null,
        });
      } else {
        const created = await createProject(draft);
        void recordActivity({
          type: "project_created",
          title: `Project “${created.name}”`,
          detail: "Saved to your offline journal.",
          refId: created.id,
          xp: 20,
        });
        set({
          statusMessage: "Project saved.",
          view: "viewer",
          activeId: created.id,
          errorMessage: null,
        });
      }
      await get().refresh();
    } catch (error) {
      set({
        errorMessage:
          error instanceof Error ? error.message : "Could not save project.",
      });
    }
  },

  removeProject: async (id) => {
    await deleteProject(id);
    const { activeId } = get();
    await get().refresh();
    set({
      statusMessage: "Project deleted.",
      view: activeId === id ? "list" : get().view,
      activeId: activeId === id ? null : activeId,
    });
  },

  exportJson: async () => {
    try {
      const backup = await exportBackup();
      downloadBackupJson(backup);
      set({
        statusMessage: `Exported ${backup.projects.length} project${backup.projects.length === 1 ? "" : "s"}.`,
        errorMessage: null,
      });
    } catch (error) {
      set({
        errorMessage:
          error instanceof Error ? error.message : "Export failed.",
      });
    }
  },

  importJson: async (file, mode = "merge") => {
    try {
      const raw = await readBackupFile(file);
      const { imported } = await importBackup(raw, mode);
      await get().refresh();
      set({
        statusMessage: `Restored ${imported} project${imported === 1 ? "" : "s"} from backup.`,
        errorMessage: null,
        view: "list",
      });
    } catch (error) {
      set({
        errorMessage:
          error instanceof Error ? error.message : "Import failed.",
      });
    }
  },

  clearMessages: () => set({ statusMessage: null, errorMessage: null }),
}));

/**
 * Pure helpers for useMemo — NEVER pass these to useJournalStore().
 * Returning a new array from a Zustand selector breaks React 19
 * useSyncExternalStore and causes Error #185 (Maximum update depth).
 */
export function selectVisibleProjects(state: JournalState): JournalProject[] {
  return filterAndSortProjects(state.projects, state.filter, state.sort);
}

export function selectActiveProject(
  state: JournalState,
): JournalProject | null {
  if (!state.activeId) return null;
  return state.projects.find((project) => project.id === state.activeId) ?? null;
}
