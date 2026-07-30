import { describe, expect, it, beforeEach } from "vitest";
import { useUnitStore } from "@/stores/unit-store";

describe("useUnitStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useUnitStore.setState({
      unit: "in",
      hydrated: true,
    });
  });

  it("defaults to inches", () => {
    expect(useUnitStore.getState().unit).toBe("in");
  });

  it("setUnit switches to cm", () => {
    useUnitStore.getState().setUnit("cm");
    expect(useUnitStore.getState().unit).toBe("cm");
  });

  it("toggleUnit flips in ↔ cm", () => {
    useUnitStore.getState().toggleUnit();
    expect(useUnitStore.getState().unit).toBe("cm");
    useUnitStore.getState().toggleUnit();
    expect(useUnitStore.getState().unit).toBe("in");
  });
});
