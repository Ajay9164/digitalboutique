import { describe, expect, it } from "vitest";
import {
  CINEMA_CLIMAX_START,
  cinemaEase,
  cinemaPoseAt,
} from "@/features/measurements/lib/cinema-camera-path";

describe("cinemaEase", () => {
  it("clamps and smoothsteps endpoints", () => {
    expect(cinemaEase(0)).toBe(0);
    expect(cinemaEase(1)).toBe(1);
    expect(cinemaEase(-1)).toBe(0);
    expect(cinemaEase(2)).toBe(1);
  });

  it("is symmetric around mid", () => {
    expect(cinemaEase(0.5)).toBeCloseTo(0.5);
  });
});

function horizontalRadius(pose: ReturnType<typeof cinemaPoseAt>): number {
  return Math.hypot(pose.position[0], pose.position[2]);
}

describe("cinemaPoseAt", () => {
  it("returns finite camera poses across the timeline", () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const pose = cinemaPoseAt(t);
      expect(pose.position.every(Number.isFinite)).toBe(true);
      expect(pose.lookAt.every(Number.isFinite)).toBe(true);
      expect(pose.fov).toBeGreaterThan(20);
      expect(pose.fov).toBeLessThan(55);
    }
  });

  it("moves around the mannequin between start and end", () => {
    const a = cinemaPoseAt(0);
    const b = cinemaPoseAt(1);
    const dist = Math.hypot(
      a.position[0] - b.position[0],
      a.position[1] - b.position[1],
      a.position[2] - b.position[2],
    );
    expect(dist).toBeGreaterThan(0.5);
  });

  it("pulls back past the climax handoff to reveal the full form", () => {
    const atHandoff = cinemaPoseAt(CINEMA_CLIMAX_START);
    const atEnd = cinemaPoseAt(1);
    expect(horizontalRadius(atEnd)).toBeGreaterThan(
      horizontalRadius(atHandoff) + 0.8,
    );
    expect(atEnd.fov).toBeGreaterThan(atHandoff.fov);
  });
});
