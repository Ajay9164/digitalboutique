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
      const message =
        error instanceof Error ? error.message : "Could not open local database.";
      cachedAvailability = { ok: false, reason: message };
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
      error:
        error instanceof Error
          ? error.message
          : "A local database operation failed.",
    };
  }
}

/** Reset cached availability (tests / recovery). */
export function resetDbAvailabilityCache(): void {
  cachedAvailability = null;
  openPromise = null;
}
