"use client";

import { Pencil, Trash2, X } from "lucide-react";
import type { JournalProject } from "@/lib/db";
import {
  formatProjectDate,
  patternTypeLabel,
} from "@/features/journal/lib/project";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ProjectViewerProps = {
  project: JournalProject;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProjectViewer({
  project,
  onClose,
  onEdit,
  onDelete,
}: ProjectViewerProps) {
  const measurements = Object.entries(project.measurements).filter(
    ([key, value]) => key !== "notes" && typeof value === "number",
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {formatProjectDate(project.date)} ·{" "}
            {patternTypeLabel(project.patternType)}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {project.name}
          </h2>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full"
            aria-label="Edit project"
            onClick={onEdit}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full text-destructive"
            aria-label="Delete project"
            onClick={onDelete}
          >
            <Trash2 aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full"
            aria-label="Close viewer"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {(project.fabricPhoto || project.draftImage) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {project.fabricPhoto ? (
              <figure className="overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.fabricPhoto}
                  alt="Fabric"
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Fabric photo
                </figcaption>
              </figure>
            ) : null}
            {project.draftImage ? (
              <figure className="overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.draftImage}
                  alt="Draft"
                  className="aspect-[4/3] w-full object-cover bg-[#F4F1EA]"
                />
                <figcaption className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Draft image
                </figcaption>
              </figure>
            ) : null}
          </div>
        )}

        <section className="space-y-2">
          <h3 className="text-sm font-semibold tracking-tight">Measurements</h3>
          {measurements.length > 0 ? (
            <dl className="grid grid-cols-3 gap-2">
              {measurements.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl bg-muted/50 px-3 py-2.5"
                >
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {key}
                  </dt>
                  <dd className="font-semibold tabular-nums">{value} cm</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No measurements recorded.</p>
          )}
          {project.measurements.notes ? (
            <p className="text-sm text-muted-foreground">
              {project.measurements.notes}
            </p>
          ) : null}
        </section>

        <Separator />

        <section className="space-y-2">
          <h3 className="text-sm font-semibold tracking-tight">
            Alteration notes
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {project.alterationNotes || "—"}
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold tracking-tight">Observations</h3>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {project.observations || "—"}
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/60 bg-card/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight">
              Learning progress
            </h3>
            <span className="text-sm font-semibold tabular-nums text-primary">
              {project.learningProgress.percentComplete}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${project.learningProgress.percentComplete}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Practice completions:{" "}
            <span className="font-semibold text-foreground">
              {project.learningProgress.practiceCompletions}
            </span>
          </p>
          {project.learningProgress.notes ? (
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {project.learningProgress.notes}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
