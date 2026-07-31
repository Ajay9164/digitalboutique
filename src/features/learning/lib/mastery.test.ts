import { describe, expect, it } from "vitest";
import {
  didCrossRankBoundary,
  resolveMastery,
} from "@/features/learning/lib/mastery";

describe("didCrossRankBoundary", () => {
  it("returns null when XP stays within the same rank", () => {
    expect(didCrossRankBoundary(40, 90)).toBeNull();
    expect(didCrossRankBoundary(100, 100)).toBeNull();
  });

  it("detects Apprentice → Journeyman at 100 XP", () => {
    const crossed = didCrossRankBoundary(90, 100);
    expect(crossed?.title).toBe("Journeyman");
    expect(crossed?.level).toBe(2);
  });

  it("detects multi-rank jumps to the highest reached tier", () => {
    const crossed = didCrossRankBoundary(50, 260);
    expect(crossed?.title).toBe("Cutter");
    expect(resolveMastery(260).level).toBe(3);
  });

  it("returns null when XP decreases", () => {
    expect(didCrossRankBoundary(200, 50)).toBeNull();
  });
});
