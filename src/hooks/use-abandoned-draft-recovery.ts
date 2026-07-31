"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useDraftStore } from "@/stores/draft-store";
import { useDraftLearningStore } from "@/stores/draft-learning-store";

const TOAST_ID = "abandoned-draft-recovery";

/**
 * On /drafts mount: if localStorage holds an unsaved cutting-table draft,
 * offer Restore / Clear via a persistent Sonner toast.
 */
export function useAbandonedDraftRecovery() {
  const promptedRef = useRef(false);

  useEffect(() => {
    if (promptedRef.current) return;
    if (!useDraftStore.getState().hasAbandonedDraft()) return;
    promptedRef.current = true;

    toast("You left an unsaved draft on the cutting table.", {
      id: TOAST_ID,
      duration: Infinity,
      description: "Restore it to keep working, or clear the table.",
      action: {
        label: "Restore",
        onClick: () => {
          const ok = useDraftStore.getState().restoreFromCache();
          if (ok) {
            useDraftLearningStore.getState().setMode("engine");
            toast.success("Draft restored to the cutting table.", {
              id: `${TOAST_ID}-done`,
            });
          }
        },
      },
      cancel: {
        label: "Clear",
        onClick: () => {
          useDraftStore.getState().clearAbandonedDraft();
          toast.message("Cutting table cleared.", { id: `${TOAST_ID}-done` });
        },
      },
    });
  }, []);
}
