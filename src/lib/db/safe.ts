/**
 * Safe IndexedDB access — never throw into the React tree.
 */

import { db } from "@/lib/db";

export type DbAvailability =
  | { ok: true }
  | { ok: false; reason: string };

let cachedAvailability: DbAvailability | null = null;
let openPromise: Promise<DbAvailability> | null = null;

export function isIndexedDbSupported(): boolean {
  return typeof indexedDB !== "undefined";
}

/** Detect QuotaExceededError across browsers (DOMException name or code 22). */
export function isQuotaExceededError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: string; code?: number; message?: string };
  if (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED"
  ) {
    return true;
  }
  if (err.code === 22) return true;
  return typeof err.message === "string" && /quota/i.test(err.message);
}

export function dbErrorMessage(error: unknown): string {
  if (isQuotaExceededError(error)) {
    return "Device storage is full. Free some space or export and delete old Journal projects, then try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "A local database operation failed.";
}

export async function ensureDbOpen(): Promise<DbAvailability> {
  if (cachedAvailability) return cachedAvailability;
  if (openPromise) return openPromise;

  openPromise = (async () => {
    if (!isIndexedDbSupported()) {
      cachedAvailability = {
        ok: false,
        reason:
          "IndexedDB is not available in this browser. Private mode or storage restrictions may be enabled.",
      };
      return cachedAvailability;
    }

    try {
      await db.open();
      cachedAvailability = { ok: true };
      return cachedAvailability;
    } catch (error) {
      cachedAvailability = { ok: false, reason: dbErrorMessage(error) };
      return cachedAvailability;
    } finally {
      openPromise = null;
    }
  })();

  return openPromise;
}

export async function withDb<T>(
  run: () => Promise<T>,
  fallback: T,
): Promise<{ data: T; error: string | null }> {
  const availability = await ensureDbOpen();
  if (!availability.ok) {
    return { data: fallback, error: availability.reason };
  }

  try {
    const data = await run();
    return { data, error: null };
  } catch (error) {
    return {
      data: fallback,
      error: dbErrorMessage(error),
    };
  }
}

/**
 * Fire-and-forget DB write that never becomes an unhandled rejection.
 * Use for non-critical meta / progress puts from Zustand actions.
 */
export function quietDbWrite(run: () => Promise<unknown>): void {
  void (async () => {
    const availability = await ensureDbOpen();
    if (!availability.ok) return;
    try {
      await run();
    } catch {
      // Quota / locked / private-mode — swallow so UI stays stable.
    }
  })();
}

/** Reset cached availability (tests / recovery). */
export function resetDbAvailabilityCache(): void {
  cachedAvailability = null;
  openPromise = null;
}
