"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLearningHubStore } from "@/stores/learning-hub-store";
import { DashboardCard } from "@/features/learning/components/dashboard-card";
import { ChartColumn, TrendingUp } from "lucide-react";
import { EMPTY_ARRAY } from "@/lib/empty";
import type { PracticeHistoryRecord } from "@/lib/db";

type WeeklyPoint = { day: string; xp: number; practices: number };

export function ProgressCharts() {
  const chartWeekly = useLearningHubStore(
    (s) => s.snapshot?.chartWeekly ?? (EMPTY_ARRAY as WeeklyPoint[]),
  );
  const practiceHistory = useLearningHubStore(
    (s) =>
      s.snapshot?.practiceHistory ?? (EMPTY_ARRAY as PracticeHistoryRecord[]),
  );

  const practiceChart = [...practiceHistory]
    .reverse()
    .slice(-8)
    .map((row, index) => ({
      attempt: `#${index + 1}`,
      score: row.score,
      total: row.total,
      pct: Math.round((row.score / row.total) * 100),
    }));

  const empty = chartWeekly.every((d) => d.xp === 0) && practiceChart.length === 0;

  return (
    <div className="grid gap-3">
      <DashboardCard
        title="Weekly XP"
        subtitle="Activity over the last 7 days"
        icon={TrendingUp}
        delay={0.12}
      >
        {empty ? (
          <EmptyChart message="Complete a lesson or practice round to light up your week." />
        ) : (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartWeekly}>
                <defs>
                  <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid color-mix(in oklch, var(--border) 80%, transparent)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="var(--primary)"
                  fill="url(#xpFill)"
                  strokeWidth={2}
                  name="XP"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        title="Practice scores"
        subtitle="Recent drafting practice attempts"
        icon={ChartColumn}
        delay={0.16}
      >
        {practiceChart.length === 0 ? (
          <EmptyChart message="No practice history yet — open Drafts → Practice." />
        ) : (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={practiceChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <XAxis dataKey="attempt" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={28}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Score"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid color-mix(in oklch, var(--border) 80%, transparent)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="pct" fill="var(--primary)" radius={[8, 8, 4, 4]} name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 text-center text-xs text-muted-foreground">
      {message}
    </div>
  );
}
