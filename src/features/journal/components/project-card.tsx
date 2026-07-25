"use client";

import { motion } from "framer-motion";
import { Calendar, ImageIcon, Scissors } from "lucide-react";
import type { JournalProject } from "@/lib/db";
import {
  formatProjectDate,
  patternTypeLabel,
} from "@/features/journal/lib/project";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: JournalProject;
  onOpen: () => void;
};

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const progress = Math.min(100, Math.max(0, project.learningProgress.percentComplete));

  return (
    <motion.button
      type="button"
      layout
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className={cn(
        "w-full overflow-hidden rounded-3xl border border-white/40 bg-card/80 text-left shadow-[0_14px_40px_-24px_rgba(15,23,28,0.35)]",
        "backdrop-blur-xl transition hover:border-primary/30 dark:border-white/10",
      )}
    >
      <div className="relative aspect-[16/10] bg-muted/60">
        {project.fabricPhoto || project.draftImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.fabricPhoto || project.draftImage || ""}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-8 opacity-40" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-2.5 pt-8">
          <p className="truncate font-display text-base font-semibold text-white">
            {project.name}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 px-3.5 py-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" aria-hidden="true" />
            {formatProjectDate(project.date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Scissors className="size-3" aria-hidden="true" />
            {patternTypeLabel(project.patternType)}
          </span>
        </div>

        {project.observations ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {project.observations}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/70">No observations yet</p>
        )}

        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Learning</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
