import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import "fake-indexeddb/auto";

/**
 * Regression: React Error #185 (Maximum update depth exceeded).
 * React 19 requires Zustand getSnapshot results to be referentially stable
 * when the store has not changed. Unstable selectors (new arrays each call)
 * cause an infinite re-render loop.
 */

function installLoopTrap() {
  const hits: string[] = [];
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const text = args.map(String).join(" ");
    if (
      text.includes("Maximum update depth") ||
      text.includes("Too many re-renders") ||
      text.includes("Minified React error #185") ||
      text.includes("getSnapshot should be cached")
    ) {
      hits.push(text);
    }
    // Swallow expected React/Dexie noise during teardown
    if (
      text.includes("Maximum update depth") ||
      text.includes("getSnapshot should be cached") ||
      text.includes("DatabaseClosedError")
    ) {
      return;
    }
    origError(...args);
  };
  return {
    hits,
    restore: () => {
      console.error = origError;
    },
  };
}

describe("react #185 loop traps", () => {
  beforeEach(async () => {
    const { db } = await import("@/lib/db");
    if (db.isOpen()) {
      await db.close();
    }
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    cleanup();
    // Let in-flight Dexie hydrates settle before the next delete.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  it("JournalView mounts without update-depth loop", async () => {
    const trap = installLoopTrap();
    const { JournalView } = await import(
      "@/features/journal/components/journal-view"
    );
    const { useJournalStore } = await import("@/stores/journal-store");
    useJournalStore.setState({
      hydrated: false,
      projects: [],
      view: "list",
      activeId: null,
      statusMessage: null,
      errorMessage: null,
    });

    await act(async () => {
      render(<JournalView />);
      await new Promise((r) => setTimeout(r, 300));
    });

    trap.restore();
    expect(trap.hits).toEqual([]);
  });

  it("usePageFab show/hide cycle does not loop", async () => {
    const trap = installLoopTrap();
    const { usePageFab } = await import("@/hooks/use-page-fab");
    const { useFabStore } = await import("@/stores/fab-store");

    let renders = 0;
    function Probe() {
      renders += 1;
      usePageFab({
        label: "Test",
        ariaLabel: "Test fab",
        onPress: () => undefined,
      });
      return null;
    }

    useFabStore.setState({
      isVisible: false,
      label: "Create",
      ariaLabel: "Create new item",
      onPress: null,
    });

    await act(async () => {
      render(<Probe />);
      await new Promise((r) => setTimeout(r, 100));
    });

    trap.restore();
    expect(trap.hits).toEqual([]);
    expect(renders).toBeLessThan(10);
    expect(useFabStore.getState().isVisible).toBe(true);
  });

  it("MeasurePracticeSurface does not loop on mount", async () => {
    const trap = installLoopTrap();
    const { MeasurePracticeSurface } = await import(
      "@/features/journey/components/interactive-surfaces"
    );

    let renders = 0;
    function Wrap() {
      renders += 1;
      return <MeasurePracticeSurface difficulty="easy" />;
    }

    await act(async () => {
      render(<Wrap />);
      await new Promise((r) => setTimeout(r, 100));
    });

    trap.restore();
    expect(trap.hits).toEqual([]);
    expect(renders).toBeLessThan(20);
  });

  it("DraftPracticeSurface does not loop on mount", async () => {
    const trap = installLoopTrap();
    const { DraftPracticeSurface } = await import(
      "@/features/journey/components/interactive-surfaces"
    );

    let renders = 0;
    function Wrap() {
      renders += 1;
      return <DraftPracticeSurface />;
    }

    await act(async () => {
      render(<Wrap />);
      await new Promise((r) => setTimeout(r, 100));
    });

    trap.restore();
    expect(trap.hits).toEqual([]);
    expect(renders).toBeLessThan(20);
  });

  it("JourneyDashboardView mounts without update-depth loop", async () => {
    const trap = installLoopTrap();
    const { JourneyDashboardView } = await import(
      "@/features/journey/components/journey-dashboard-view"
    );
    const { useJourneyStore } = await import("@/stores/journey-store");
    const { useLearningHubStore } = await import("@/stores/learning-hub-store");
    useJourneyStore.setState({ hydrated: false, dashboard: null });
    useLearningHubStore.setState({
      hydrated: false,
      snapshot: null,
      showOnboarding: false,
      celebration: null,
    });

    await act(async () => {
      render(<JourneyDashboardView />);
      await new Promise((r) => setTimeout(r, 500));
    });

    trap.restore();
    expect(trap.hits).toEqual([]);
  });

  it("LearningHub selectors stay stable with empty snapshot fallbacks", async () => {
    const trap = installLoopTrap();
    const { LearningTimeline } = await import(
      "@/features/learning/components/learning-timeline"
    );
    const { AchievementsGrid } = await import(
      "@/features/learning/components/achievements-grid"
    );
    const { useLearningHubStore } = await import("@/stores/learning-hub-store");
    useLearningHubStore.setState({
      hydrated: true,
      snapshot: null,
      showOnboarding: false,
      celebration: null,
    });

    await act(async () => {
      render(
        <>
          <LearningTimeline />
          <AchievementsGrid />
        </>,
      );
      await new Promise((r) => setTimeout(r, 100));
    });

    trap.restore();
    expect(trap.hits).toEqual([]);
  });
});
