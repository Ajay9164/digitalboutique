"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function AppError({ error, unstable_retry }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
      role="alert"
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        This screen hit an unexpected error. You can retry without leaving the
        app — Tailor keeps working offline.
      </p>
      <Button className="mt-6" type="button" onClick={() => unstable_retry()}>
        Try again
      </Button>
    </div>
  );
}
