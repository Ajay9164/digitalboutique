import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type PageSkeletonProps = {
  className?: string;
};

/** Premium route-level loading skeleton — glass cards + Apple spacing. */
export function PageSkeleton({ className }: PageSkeletonProps) {
  return (
    <div
      className={cn("space-y-6", className)}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div className="space-y-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-9 w-52 rounded-xl" />
        <Skeleton className="h-4 w-full max-w-md rounded-lg" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-36 w-full rounded-3xl" />
        <Skeleton className="h-36 w-full rounded-3xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-28 w-full rounded-3xl" />
        <Skeleton className="h-28 w-full rounded-3xl" />
      </div>
    </div>
  );
}
