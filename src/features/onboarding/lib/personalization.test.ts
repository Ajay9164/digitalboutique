import { describe, expect, it } from "vitest";
import {
  atelierBrandLabel,
  atelierWelcomeLabel,
  masteryCongratsLabel,
} from "@/features/onboarding/lib/personalization";

describe("personalization labels", () => {
  it("falls back to generic atelier brand", () => {
    expect(atelierBrandLabel(null)).toBe("Atelier");
    expect(atelierBrandLabel("  ")).toBe("Atelier");
    expect(atelierBrandLabel("Aria")).toBe("Aria's Atelier");
  });

  it("builds welcome and mastery lines", () => {
    expect(atelierWelcomeLabel(null)).toBe("Welcome back");
    expect(atelierWelcomeLabel("Sam")).toBe("Welcome back, Sam");
    expect(masteryCongratsLabel(null)).toBe("Brilliant work!");
    expect(masteryCongratsLabel("Sam")).toBe("Brilliant work, Sam!");
  });
});
