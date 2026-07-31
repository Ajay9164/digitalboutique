import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAbandonedDraftCache,
  createEmptyDraftCache,
  hasUnsavedAbandonedDraft,
  readAbandonedDraftCache,
  writeAbandonedDraftCache,
  ABANDONED_DRAFT_STORAGE_KEY,
} from "@/features/drafts/engine/abandoned-draft-cache";
import { useDraftStore } from "@/stores/draft-store";

describe("abandoned draft cache", () => {
  beforeEach(() => {
    localStorage.clear();
    useDraftStore.setState({
      ...createEmptyDraftCache(),
      restoreEpoch: 0,
    });
  });

  it("writes and reads dirty cutting-table state", () => {
    const cache = {
      ...createEmptyDraftCache(),
      values: { ...createEmptyDraftCache().values, bust: 100 },
      dirty: true,
      journalSaved: false,
    };
    writeAbandonedDraftCache(cache);
    expect(localStorage.getItem(ABANDONED_DRAFT_STORAGE_KEY)).toBeTruthy();
    expect(hasUnsavedAbandonedDraft()).toBe(true);
    expect(readAbandonedDraftCache()?.values.bust).toBe(100);
  });

  it("does not treat journal-saved drafts as abandoned", () => {
    writeAbandonedDraftCache({
      ...createEmptyDraftCache(),
      dirty: false,
      journalSaved: true,
    });
    expect(hasUnsavedAbandonedDraft()).toBe(false);
  });

  it("autosaves calculator keystrokes through useDraftStore", () => {
    useDraftStore.getState().setValues({
      ...createEmptyDraftCache().values,
      waist: 70,
    });
    expect(useDraftStore.getState().dirty).toBe(true);
    expect(readAbandonedDraftCache()?.values.waist).toBe(70);
  });

  it("restores and clears abandoned drafts", () => {
    useDraftStore.getState().setValues({
      ...createEmptyDraftCache().values,
      hip: 110,
    });
    useDraftStore.setState({
      values: createEmptyDraftCache().values,
      dirty: false,
    });
    expect(useDraftStore.getState().restoreFromCache()).toBe(true);
    expect(useDraftStore.getState().values.hip).toBe(110);

    useDraftStore.getState().clearAbandonedDraft();
    expect(hasUnsavedAbandonedDraft()).toBe(false);
    expect(localStorage.getItem(ABANDONED_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("clearAbandonedDraftCache wipes storage", () => {
    writeAbandonedDraftCache({
      ...createEmptyDraftCache(),
      dirty: true,
    });
    clearAbandonedDraftCache();
    expect(readAbandonedDraftCache()).toBeNull();
  });
});
