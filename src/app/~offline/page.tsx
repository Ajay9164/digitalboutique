import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offline",
  description: "You are offline. Tailor will reconnect when the network returns.",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/10">
        <WifiOff className="size-6" aria-hidden="true" />
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Cached pages still work. Open a previously visited section or return
        home when you&apos;re ready.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Open Learn hub</Link>
      </Button>
    </div>
  );
}
