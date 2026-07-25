"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
import { JournalToolbar } from "@/features/journal/components/journal-toolbar";
import { ProjectCard } from "@/features/journal/components/project-card";
import { ProjectForm } from "@/features/journal/components/project-form";
import { ProjectViewer } from "@/features/journal/components/project-viewer";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { JourneyGuideBanner } from "@/features/journey/components/journey-guide-banner";
import { Button } from "@/components/ui/button";
import { usePageFab } from "@/hooks/use-page-fab";
import { useUiStore } from "@/stores/ui-store";
import {
  selectActiveProject,
  selectVisibleProjects,
  useJournalStore,
} from "@/stores/journal-store";

function JournalFab() {
  const openCreate = useJournalStore((s) => s.openCreate);
  usePageFab({
    label: "New project",
    ariaLabel: "Create a new journal project",
    onPress: openCreate,
  });
  return null;
}

export function JournalView() {
  const hydrate = useJournalStore((s) => s.hydrate);
  const view = useJournalStore((s) => s.view);
  const projects = useJournalStore((s) => s.projects);
  const visible = useJournalStore(selectVisibleProjects);
  const active = useJournalStore(selectActiveProject);
  const openCreate = useJournalStore((s) => s.openCreate);
  const openViewer = useJournalStore((s) => s.openViewer);
  const openEdit = useJournalStore((s) => s.openEdit);
  const closeOverlay = useJournalStore((s) => s.closeOverlay);
  const removeProject = useJournalStore((s) => s.removeProject);
  const statusMessage = useJournalStore((s) => s.statusMessage);
  const errorMessage = useJournalStore((s) => s.errorMessage);
  const clearMessages = useJournalStore((s) => s.clearMessages);
  const hydrated = useJournalStore((s) => s.hydrated);
  const setNavVisible = useUiStore((s) => s.setNavVisible);

  const overlayOpen = view === "create" || view === "edit" || view === "viewer";

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    setNavVisible(!overlayOpen);
    return () => setNavVisible(true);
  }, [overlayOpen, setNavVisible]);

  useEffect(() => {
    if (!statusMessage && !errorMessage) return;
    const timer = window.setTimeout(() => clearMessages(), 4000);
    return () => window.clearTimeout(timer);
  }, [statusMessage, errorMessage, clearMessages]);

  return (
    <div className="space-y-6">
      {!overlayOpen ? <JournalFab /> : null}

      <JourneyGuideBanner feature="journal" />

      <PageHeader
        eyebrow="Atelier log"
        title="Journal"
        description="Your offline project archive — fabric, measurements, drafts, and learning, all on this device."
        actions={
          <Button
            type="button"
            size="sm"
            className="rounded-xl"
            onClick={openCreate}
          >
            <Plus aria-hidden="true" />
            New
          </Button>
        }
      />

      {(statusMessage || errorMessage) && (
        <p
          role="status"
          className={
            errorMessage
              ? "rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
              : "rounded-2xl bg-primary/10 px-3 py-2 text-sm text-primary"
          }
        >
          {errorMessage ?? statusMessage}
        </p>
      )}

      <JournalToolbar />

      {!hydrated ? (
        <PageSkeleton />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={projects.length === 0 ? "Your journal is empty" : "No matches"}
          description={
            projects.length === 0
              ? "Create a project to store fabric photos, measurements, drafts, and notes — fully offline."
              : "Try clearing search or filters to see more projects."
          }
          className="rounded-3xl border border-dashed border-border/70 bg-card/40"
          action={
            projects.length === 0 ? (
              <Button
                type="button"
                className="rounded-xl"
                onClick={openCreate}
              >
                <Plus aria-hidden="true" />
                Create first project
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => openViewer(project.id)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {overlayOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] bg-background"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
          >
            {view === "create" ? (
              <ProjectForm title="New project" onCancel={closeOverlay} />
            ) : null}
            {view === "edit" ? (
              <ProjectForm title="Edit project" onCancel={closeOverlay} />
            ) : null}
            {view === "viewer" && active ? (
              <ProjectViewer
                project={active}
                onClose={closeOverlay}
                onEdit={() => openEdit(active.id)}
                onDelete={() => {
                  if (
                    window.confirm(
                      `Delete “${active.name}”? This cannot be undone on this device.`,
                    )
                  ) {
                    void removeProject(active.id);
                  }
                }}
              />
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
