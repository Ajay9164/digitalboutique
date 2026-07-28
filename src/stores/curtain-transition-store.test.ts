import { beforeEach, describe, expect, it } from "vitest";
import { DIGITAL_ATELIER_HREF } from "@/lib/constants";
import { useCurtainTransitionStore } from "@/stores/curtain-transition-store";

describe("curtain transition store", () => {
  beforeEach(() => {
    useCurtainTransitionStore.getState().reset();
  });

  it("begins a drop toward the measurements dashboard", () => {
    useCurtainTransitionStore.getState().begin({
      href: DIGITAL_ATELIER_HREF,
      origin: { top: 10, left: 20, width: 300, height: 56 },
    });
    const s = useCurtainTransitionStore.getState();
    expect(s.phase).toBe("dropping");
    expect(s.href).toBe("/measurements");
    expect(s.dismantleScene).toBe(true);
    expect(s.origin?.width).toBe(300);
  });

  it("ignores begin while already dropping", () => {
    const begin = useCurtainTransitionStore.getState().begin;
    begin({
      href: DIGITAL_ATELIER_HREF,
      origin: { top: 0, left: 0, width: 100, height: 40 },
    });
    begin({
      href: "/studio",
      origin: { top: 1, left: 1, width: 50, height: 20 },
    });
    expect(useCurtainTransitionStore.getState().href).toBe("/measurements");
  });

  it("covers then lifts through the theatrical phases", () => {
    const store = useCurtainTransitionStore.getState();
    store.begin({
      href: DIGITAL_ATELIER_HREF,
      origin: { top: 0, left: 0, width: 100, height: 40 },
    });
    store.markCovered();
    expect(useCurtainTransitionStore.getState().phase).toBe("holding");
    store.beginLift();
    expect(useCurtainTransitionStore.getState().phase).toBe("lifting");
    store.reset();
    expect(useCurtainTransitionStore.getState().phase).toBe("idle");
    expect(useCurtainTransitionStore.getState().dismantleScene).toBe(false);
  });
});
