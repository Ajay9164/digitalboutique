import { describe, expect, it } from "vitest";
import { parseTailoringQuery } from "@/lib/speech/mentor-intent";

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

  it("never says it did not understand — smart tip fallback", () => {
    const result = parseTailoringQuery("hello there tailor");
    expect(result.kind).toBe("tip");
    expect(result.spoken.toLowerCase()).not.toMatch(/didn'?t understand|did not understand|i did not catch/i);
    expect(result.spoken.length).toBeGreaterThan(10);
  });

  it("prompts helpfully when armhole is spoken without a number", () => {
    const result = parseTailoringQuery("what is the armhole");
    expect(result.kind).toBe("tip");
    expect(result.spoken.toLowerCase()).toMatch(/bust/);
  });
});
