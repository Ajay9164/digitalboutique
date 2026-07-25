"use client";

import { cn } from "@/lib/utils";

type AlignmentGridProps = {
  cols?: number;
  rows?: number;
  className?: string;
};

export function AlignmentGrid({
  cols = 8,
  rows = 10,
  className,
}: AlignmentGridProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {/* Rule of thirds + fine grid */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)
          `,
          backgroundSize: `${100 / cols}% ${100 / rows}%`,
        }}
      />
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-primary/55" />
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary/55" />
      <div className="absolute inset-y-0 left-1/3 w-px bg-white/35" />
      <div className="absolute inset-y-0 left-2/3 w-px bg-white/35" />
      <div className="absolute inset-x-0 top-1/3 h-px bg-white/35" />
      <div className="absolute inset-x-0 top-2/3 h-px bg-white/35" />
    </div>
  );
}
