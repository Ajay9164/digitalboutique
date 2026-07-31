"use client";

import { useMaitreDWelcome } from "@/hooks/use-maitre-d-welcome";

/** Mounts the session Maître d' welcome under AppShell. */
export function MaitreDWelcomeListener() {
  useMaitreDWelcome();
  return null;
}
