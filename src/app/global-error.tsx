"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { fontDisplay, fontSans } from "@/lib/fonts";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function GlobalError({
  error,
  unstable_retry,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col items-center justify-center bg-[#F7F9FB] px-6 text-center font-sans text-[#0F171C]">
        <div
          className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#0F171C]/10 text-[#0F171C]"
          aria-hidden="true"
        >
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Tailor needs a moment
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#0F171C]/70">
          A critical error interrupted the app shell. Retry to restore your
          workspace.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 rounded-full bg-[#0F171C] px-5 py-2.5 text-sm font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
