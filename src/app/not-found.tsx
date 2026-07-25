import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        That route is not part of Tailor yet. Head back to measurements to
        continue.
      </p>
      <Button asChild className="mt-6">
        <Link href="/measurements">Go to Measurements</Link>
      </Button>
    </div>
  );
}
