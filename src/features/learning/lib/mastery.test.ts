import { describe, expect, it } from "vitest";
import { resolveMastery } from "@/features/learning/lib/mastery";

describe("mastery levels", () => {
  it("starts as Apprentice", () => {
    const m = resolveMastery(0);
    expect(m.level).toBe(1);
    expect(m.title).toBe("Apprentice");
    expect(m.progress).toBe(0);
  });

  it("advances to Journeyman at 100 XP", () => {
    const m = resolveMastery(100);
    expect(m.level).toBe(2);
    expect(m.title).toBe("Journeyman");
  });

  it("caps Master Atelier progress at 1", () => {
    const m = resolveMastery(5000);
    expect(m.level).toBe(5);
    expect(m.title).toBe("Master Atelier");
    expect(m.progress).toBe(1);
    expect(m.xpForNextLevel).toBeNull();
  });
});
