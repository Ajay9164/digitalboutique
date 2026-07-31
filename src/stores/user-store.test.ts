import { beforeEach, describe, expect, it } from "vitest";
import { useUserStore } from "@/stores/user-store";

describe("useUserStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useUserStore.setState({
      hydrated: true,
      userName: null,
      hasCompletedOnboarding: false,
      lastLoginDate: null,
      currentStreak: 0,
      bestStreak: 0,
    });
  });

  it("starts without a name or completed onboarding", () => {
    const s = useUserStore.getState();
    expect(s.userName).toBeNull();
    expect(s.hasCompletedOnboarding).toBe(false);
    expect(s.currentStreak).toBe(0);
  });

  it("saves a trimmed name and completes onboarding", () => {
    useUserStore.getState().completeOnboarding("  Aria  ");
    const s = useUserStore.getState();
    expect(s.userName).toBe("Aria");
    expect(s.hasCompletedOnboarding).toBe(true);
  });

  it("ignores blank names", () => {
    useUserStore.getState().completeOnboarding("   ");
    const s = useUserStore.getState();
    expect(s.userName).toBeNull();
    expect(s.hasCompletedOnboarding).toBe(false);
  });

  it("can reset onboarding", () => {
    useUserStore.getState().completeOnboarding("Sam");
    useUserStore.getState().resetOnboarding();
    const s = useUserStore.getState();
    expect(s.userName).toBeNull();
    expect(s.hasCompletedOnboarding).toBe(false);
  });

  it("records a first login streak without awarding a bonus", () => {
    const result = useUserStore.getState().checkDailyStreak();
    expect(result.awardedBonus).toBe(false);
    expect(result.currentStreak).toBe(1);
    expect(useUserStore.getState().lastLoginDate).toBeTruthy();
  });

  it("awards a consecutive-day streak bonus once", () => {
    useUserStore.setState({
      lastLoginDate: "2020-01-01",
      currentStreak: 2,
      bestStreak: 2,
    });
    // Force "next day" by mocking via resolve path — set yesterday relative to today
    // by checking twice after manually setting yesterday.
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yKey = [
      yesterday.getFullYear(),
      String(yesterday.getMonth() + 1).padStart(2, "0"),
      String(yesterday.getDate()).padStart(2, "0"),
    ].join("-");
    useUserStore.setState({
      lastLoginDate: yKey,
      currentStreak: 2,
      bestStreak: 2,
    });
    const result = useUserStore.getState().checkDailyStreak();
    expect(result.awardedBonus).toBe(true);
    expect(result.currentStreak).toBe(3);
    // Same day again — no second bonus
    const again = useUserStore.getState().checkDailyStreak();
    expect(again.awardedBonus).toBe(false);
    expect(again.currentStreak).toBe(3);
  });
});
