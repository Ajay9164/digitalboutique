import { beforeEach, describe, expect, it } from "vitest";
import { useUserStore } from "@/stores/user-store";

describe("useUserStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useUserStore.setState({
      hydrated: true,
      userName: null,
      hasCompletedOnboarding: false,
    });
  });

  it("starts without a name or completed onboarding", () => {
    const s = useUserStore.getState();
    expect(s.userName).toBeNull();
    expect(s.hasCompletedOnboarding).toBe(false);
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
});
