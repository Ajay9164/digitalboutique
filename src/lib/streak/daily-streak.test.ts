import { describe, expect, it } from "vitest";
import { resolveDailyStreak } from "@/lib/streak/daily-streak";

describe("resolveDailyStreak", () => {
  it("starts a first-day streak without a bonus", () => {
    const result = resolveDailyStreak(
      { lastLoginDate: null, currentStreak: 0, bestStreak: 0 },
      "2026-07-31",
    );
    expect(result).toMatchObject({
      lastLoginDate: "2026-07-31",
      currentStreak: 1,
      bestStreak: 1,
      awardedBonus: false,
      changed: true,
    });
  });

  it("increments and awards bonus on the exact next day", () => {
    const result = resolveDailyStreak(
      { lastLoginDate: "2026-07-30", currentStreak: 3, bestStreak: 5 },
      "2026-07-31",
    );
    expect(result).toMatchObject({
      lastLoginDate: "2026-07-31",
      currentStreak: 4,
      bestStreak: 5,
      awardedBonus: true,
      changed: true,
    });
  });

  it("updates bestStreak when the new streak surpasses it", () => {
    const result = resolveDailyStreak(
      { lastLoginDate: "2026-07-30", currentStreak: 5, bestStreak: 5 },
      "2026-07-31",
    );
    expect(result.bestStreak).toBe(6);
  });

  it("is a no-op on the same calendar day", () => {
    const result = resolveDailyStreak(
      { lastLoginDate: "2026-07-31", currentStreak: 4, bestStreak: 6 },
      "2026-07-31",
    );
    expect(result.changed).toBe(false);
    expect(result.awardedBonus).toBe(false);
    expect(result.currentStreak).toBe(4);
  });

  it("resets currentStreak to 0 when more than one day was missed", () => {
    const result = resolveDailyStreak(
      { lastLoginDate: "2026-07-28", currentStreak: 9, bestStreak: 12 },
      "2026-07-31",
    );
    expect(result).toMatchObject({
      lastLoginDate: "2026-07-31",
      currentStreak: 0,
      bestStreak: 12,
      awardedBonus: false,
      changed: true,
    });
  });
});
