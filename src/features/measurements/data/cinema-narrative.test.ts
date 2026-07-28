import { describe, expect, it } from "vitest";
import {
  CINEMA_BEATS,
  beatOpacity,
  beatSlideX,
} from "@/features/measurements/data/cinema-narrative";

describe("cinema narrative beats", () => {
  it("has ordered non-empty beats", () => {
    expect(CINEMA_BEATS.length).toBeGreaterThanOrEqual(3);
    expect(CINEMA_BEATS.every((b) => b.title && b.body)).toBe(true);
  });

  it("peaks at full opacity and fades at edges", () => {
    const beat = CINEMA_BEATS[0]!;
    expect(beatOpacity(beat.peak, beat)).toBeCloseTo(1);
    expect(beatOpacity(beat.enter, beat)).toBe(0);
    expect(beatOpacity(beat.exit, beat)).toBe(0);
    expect(beatOpacity((beat.enter + beat.peak) / 2, beat)).toBeGreaterThan(0.4);
  });

  it("slides from the titled side", () => {
    const left = CINEMA_BEATS.find((b) => b.side === "left")!;
    expect(beatSlideX(left.enter, left)).toBeLessThan(0);
    expect(beatSlideX(left.peak, left)).toBeCloseTo(0);
  });
});
