"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function RootError({ error, unstable_retry }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-16 text-center"
      role="alert"
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Tailor hit an unexpected error. Retry to restore your workspace — your
        offline data stays on this device.
      </p>
      <Button className="mt-6" type="button" onClick={() => unstable_retry()}>
        Try again
      </Button>
    </div>
  );
}
