/**
 * Offline resilience — IndexedDB / Zustand local stores must work when
 * `navigator.onLine === false`. Dexie never requires the network.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ensureDbOpen,
  quietDbWrite,
  resetDbAvailabilityCache,
  withDb,
} from "@/lib/db/safe";
import { db } from "@/lib/db";
import { useUserStore } from "@/stores/user-store";
import { useUnitStore } from "@/stores/unit-store";

describe("offline resilience", () => {
  beforeEach(() => {
    resetDbAvailabilityCache();
    localStorage.clear();
    vi.stubGlobal("navigator", {
      ...navigator,
      onLine: false,
    });
    useUserStore.setState({
      hydrated: true,
      userName: null,
      hasCompletedOnboarding: false,
    });
    useUnitStore.setState({
      hydrated: true,
      unit: "in",
    });
  });

  it("reports navigator offline during the suite", () => {
    expect(navigator.onLine).toBe(false);
  });

  it("opens IndexedDB while offline", async () => {
    const availability = await ensureDbOpen();
    expect(availability.ok).toBe(true);
  });

  it("withDb reads/writes meta without network", async () => {
    const id = `offline-probe-${Date.now()}`;
    const { error: writeError } = await withDb(async () => {
      await db.meta.put({
        id,
        key: id,
        value: "ok",
        updatedAt: new Date(),
      });
    }, null);
    expect(writeError).toBeNull();

    const { data, error: readError } = await withDb(
      () => db.meta.get(id),
      null,
    );
    expect(readError).toBeNull();
    expect(data?.value).toBe("ok");

    await withDb(async () => {
      await db.meta.delete(id);
    }, null);
  });

  it("quietDbWrite never throws when offline", () => {
    expect(() => {
      quietDbWrite(async () => {
        await db.meta.put({
          id: "quiet-offline",
          key: "quiet-offline",
          value: "1",
          updatedAt: new Date(),
        });
      });
    }).not.toThrow();
  });

  it("Zustand user + unit stores persist locally while offline", () => {
    useUserStore.getState().completeOnboarding("Offline Aria");
    useUnitStore.getState().setUnit("cm");

    expect(useUserStore.getState().userName).toBe("Offline Aria");
    expect(useUserStore.getState().hasCompletedOnboarding).toBe(true);
    expect(useUnitStore.getState().unit).toBe("cm");
  });
});
