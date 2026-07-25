"use client";

import {
  BookOpen,
  CheckCircle2,
  Compass,
  Flame,
  PenLine,
  Ruler,
  Sparkles,
  Star,
  Target,
  Crown,
} from "lucide-react";
import { motion } from "framer-motion";
import { ACHIEVEMENTS } from "@/features/learning/data/catalog";
import { DashboardCard } from "@/features/learning/components/dashboard-card";
import { useLearningHubStore } from "@/stores/learning-hub-store";
import { EMPTY_ARRAY } from "@/lib/empty";
import { cn } from "@/lib/utils";

const ICONS = {
  sparkles: Sparkles,
  ruler: Ruler,
  crown: Crown,
  pen: PenLine,
  check: CheckCircle2,
  target: Target,
  star: Star,
  flame: Flame,
  book: BookOpen,
  compass: Compass,
} as const;

export function AchievementsGrid() {
  const unlocked = useLearningHubStore(
    (s) => s.snapshot?.unlockedAchievementIds ?? (EMPTY_ARRAY as string[]),
  );
  const unlockedSet = new Set(unlocked);

  return (
    <DashboardCard
      title="Achievements"
      subtitle={`${unlocked.length} of ${ACHIEVEMENTS.length} unlocked`}
      icon={Star}
      delay={0.08}
    >
      {unlocked.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-3 py-6 text-center text-xs text-muted-foreground">
          Milestones appear here as you learn — start with any measurement lesson.
        </p>
      ) : null}
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ACHIEVEMENTS.map((achievement, index) => {
          const Icon = ICONS[achievement.icon];
          const isUnlocked = unlockedSet.has(achievement.id);
          return (
            <motion.li
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 * index }}
              className={cn(
                "rounded-2xl border px-3 py-3",
                isUnlocked
                  ? "border-primary/35 bg-primary/8"
                  : "border-border/50 bg-muted/25 opacity-55",
              )}
            >
              <span
                className={cn(
                  "mb-2 flex size-8 items-center justify-center rounded-xl",
                  isUnlocked
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <p className="text-xs font-semibold tracking-tight">
                {achievement.title}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                {achievement.description}
              </p>
            </motion.li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
