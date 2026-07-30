import { describe, expect, it, beforeEach } from "vitest";
import { useSettingsStore } from "@/stores/settings-store";

describe("useSettingsStore (alias of useUnitStore)", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({
      unit: "in",
      hydrated: true,
    });
  });

  it("defaults to inches", () => {
    expect(useSettingsStore.getState().unit).toBe("in");
  });

  it("setUnit switches to cm", () => {
    useSettingsStore.getState().setUnit("cm");
    expect(useSettingsStore.getState().unit).toBe("cm");
  });
});
