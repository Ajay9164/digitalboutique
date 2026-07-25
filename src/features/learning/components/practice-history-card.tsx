"use client";

import { ClipboardList } from "lucide-react";
import { DashboardCard } from "@/features/learning/components/dashboard-card";
import { useLearningHubStore } from "@/stores/learning-hub-store";

export function PracticeHistoryCard() {
  const history = useLearningHubStore((s) => s.snapshot?.practiceHistory ?? []);

  return (
    <DashboardCard
      title="Practice history"
      subtitle="Drafting practice rounds"
      icon={ClipboardList}
      delay={0.18}
    >
      {history.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-3 py-8 text-center text-xs text-muted-foreground">
          Practice attempts from Draft Learning appear here with scores.
        </p>
      ) : (
        <ul className="space-y-2">
          {history.slice(0, 8).map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-semibold tabular-nums">
                  {row.score}/{row.total}
                  {row.perfect ? (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Perfect
                    </span>
                  ) : null}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-primary">
                {Math.round((row.score / row.total) * 100)}%
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
