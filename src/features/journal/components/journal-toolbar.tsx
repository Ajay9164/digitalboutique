"use client";

import { useRef } from "react";
import {
  Download,
  Filter,
  Search,
  Upload,
} from "lucide-react";
import {
  PATTERN_TYPE_OPTIONS,
  type JournalSort,
} from "@/features/journal/lib/project";
import { useJournalStore } from "@/stores/journal-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: Array<{ value: JournalSort; label: string }> = [
  { value: "date-desc", label: "Newest date" },
  { value: "date-asc", label: "Oldest date" },
  { value: "updated-desc", label: "Recently updated" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
];

export function JournalToolbar({ className }: { className?: string }) {
  const importRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const filter = useJournalStore((s) => s.filter);
  const sort = useJournalStore((s) => s.sort);
  const setFilter = useJournalStore((s) => s.setFilter);
  const setSort = useJournalStore((s) => s.setSort);
  const exportJson = useJournalStore((s) => s.exportJson);
  const importJson = useJournalStore((s) => s.importJson);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={filter.query}
          onChange={(event) => setFilter({ query: event.target.value })}
          placeholder="Search name, notes, observations…"
          aria-label="Search projects"
          className="h-11 w-full rounded-2xl border border-border/70 bg-card/80 pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Filter className="size-3" aria-hidden="true" />
            Pattern
          </span>
          <select
            value={filter.patternType}
            onChange={(event) =>
              setFilter({
                patternType: event.target.value as typeof filter.patternType,
              })
            }
            className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All patterns</option>
            {PATTERN_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[7rem] flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Fabric
          <select
            value={filter.hasFabric}
            onChange={(event) =>
              setFilter({
                hasFabric: event.target.value as typeof filter.hasFabric,
              })
            }
            className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Any</option>
            <option value="yes">Has photo</option>
            <option value="no">No photo</option>
          </select>
        </label>

        <label className="flex min-w-[7rem] flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Draft
          <select
            value={filter.hasDraft}
            onChange={(event) =>
              setFilter({
                hasDraft: event.target.value as typeof filter.hasDraft,
              })
            }
            className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Any</option>
            <option value="yes">Has draft</option>
            <option value="no">No draft</option>
          </select>
        </label>

        <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as JournalSort)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() => void exportJson()}
        >
          <Download aria-hidden="true" />
          Export backup
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() => importRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          Import merge
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() => replaceRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          Import replace
        </Button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Import journal backup merge"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importJson(file, "merge");
            event.target.value = "";
          }}
        />
        <input
          ref={replaceRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Import journal backup replace"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (
              file &&
              window.confirm(
                "Replace all journal projects on this device with the backup? This cannot be undone.",
              )
            ) {
              void importJson(file, "replace");
            }
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
