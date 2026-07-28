import { describe, expect, it, beforeEach } from "vitest";
import { useCurtainTransitionStore } from "@/stores/curtain-transition-store";

describe("curtain transition store", () => {
  beforeEach(() => {
    useCurtainTransitionStore.getState().reset();
  });

  it("begins a drop from idle and dismantles the scene", () => {
    useCurtainTransitionStore.getState().begin({
      href: "/studio",
      origin: { top: 10, left: 20, width: 300, height: 56 },
    });
    const s = useCurtainTransitionStore.getState();
    expect(s.phase).toBe("dropping");
    expect(s.href).toBe("/studio");
    expect(s.dismantleScene).toBe(true);
    expect(s.origin?.width).toBe(300);
  });

  it("ignores begin while already dropping", () => {
    const begin = useCurtainTransitionStore.getState().begin;
    begin({
      href: "/studio",
      origin: { top: 0, left: 0, width: 100, height: 40 },
    });
    begin({
      href: "/measurements",
      origin: { top: 1, left: 1, width: 50, height: 20 },
    });
    expect(useCurtainTransitionStore.getState().href).toBe("/studio");
  });

  it("covers then lifts through the theatrical phases", () => {
    const store = useCurtainTransitionStore.getState();
    store.begin({
      href: "/studio",
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
