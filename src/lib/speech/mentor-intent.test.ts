import { describe, expect, it } from "vitest";
import {
  extractNumbers,
  parseTailoringQuery,
} from "@/lib/speech/mentor-intent";

describe("extractNumbers", () => {
  it("pulls integers and decimals via /\\d+(\\.\\d+)?/g", () => {
    expect(extractNumbers("armhole for 36.5 bust")).toEqual([36.5]);
    expect(extractNumbers("try 28 then 30")).toEqual([28, 30]);
    expect(extractNumbers("no digits here")).toEqual([]);
  });
});

describe("parseTailoringQuery", () => {
  it("calculates armhole depth for a 36 bust", () => {
    const result = parseTailoringQuery(
      "What is the armhole calculation for a 36 bust?",
    );
    expect(result.kind).toBe("armhole");
    expect(result.spoken).toBe(
      "For a 36 bust, the standard armhole depth is 7.5 inches.",
    );
  });

  it("matches fuzzy arm hole spacing", () => {
    const result = parseTailoringQuery("arm hole for 40");
    expect(result.kind).toBe("armhole");
    expect(result.spoken).toContain("8.5 inches");
  });

  it("calculates chest line with ease for bust/chest + number", () => {
    const result = parseTailoringQuery("chest line for a 36 bust");
    expect(result.kind).toBe("chest-line");
    expect(result.spoken).toBe(
      "For a 36 bust, mark your chest line at 10.5 inches to include ease allowance.",
    );
  });

  it("calculates waist dart allowance", () => {
    const result = parseTailoringQuery("waist dart for 28");
    expect(result.kind).toBe("waist-dart");
    expect(result.spoken).toBe(
      "For a 28 waist, the dart allowance is 8 inches.",
    );
  });

  it("asks a clarifying question when a number has no keyword", () => {
    const result = parseTailoringQuery("calculate for 36 please");
    expect(result.kind).toBe("clarify");
    expect(result.spoken).toBe(
      "I heard 36. Did you want the armhole, bust, or waist calculation for that?",
    );
  });

  it("never says it did not understand — tip fallback with no numbers", () => {
    const result = parseTailoringQuery("hello there tailor");
    expect(result.kind).toBe("tip");
    expect(result.spoken.toLowerCase()).not.toMatch(
      /didn'?t understand|did not understand|i did not catch/i,
    );
    expect(result.spoken.length).toBeGreaterThan(10);
  });

  it("prompts helpfully when armhole is spoken without a number", () => {
    const result = parseTailoringQuery("what is the armhole");
    expect(result.kind).toBe("tip");
    expect(result.spoken.toLowerCase()).toMatch(/bust/);
  });
});
