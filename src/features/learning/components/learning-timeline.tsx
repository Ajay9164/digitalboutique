"use client";

import { History } from "lucide-react";
import { DashboardCard } from "@/features/learning/components/dashboard-card";
import { useLearningHubStore } from "@/stores/learning-hub-store";
import { formatRelativeLabel } from "@/utils/format";
import { EMPTY_ARRAY } from "@/lib/empty";
import type { LearningActivityRecord } from "@/lib/db";

export function LearningTimeline() {
  const activities = useLearningHubStore(
    (s) =>
      s.snapshot?.activities ?? (EMPTY_ARRAY as LearningActivityRecord[]),
  );

  return (
    <DashboardCard
      title="Learning timeline"
      subtitle="Recent atelier activity"
      icon={History}
      delay={0.1}
    >
      {activities.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-3 py-8 text-center text-xs text-muted-foreground">
          Your timeline is quiet. Learn a measurement or finish a construction
          step to begin.
        </p>
      ) : (
        <ol className="relative space-y-0 border-l border-border/70 pl-4">
          {activities.slice(0, 12).map((activity) => (
            <li key={activity.id} className="relative pb-4 last:pb-0">
              <span className="absolute -left-[1.28rem] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-tight">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.detail}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold tabular-nums text-primary">
                    +{activity.xp} XP
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatRelativeLabel(new Date(activity.createdAt))}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </DashboardCard>
  );
}
