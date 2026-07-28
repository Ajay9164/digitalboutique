"use client";

import dynamic from "next/dynamic";

const CurtainDropOverlay = dynamic(
  () =>
    import("@/components/layout/curtain-drop-overlay").then(
      (m) => m.CurtainDropOverlay,
    ),
  { ssr: false },
);

const OnboardingOverlay = dynamic(
  () =>
    import("@/features/onboarding/components/onboarding-overlay").then(
      (m) => m.OnboardingOverlay,
    ),
  { ssr: false },
);

/**
 * App-wide overlays that must survive route-group swaps (landing ↔ dashboard).
 * Mounted from the root layout — not the `(app)` AppShell.
 */
export function RootOverlays() {
  return (
    <>
      <CurtainDropOverlay />
      <OnboardingOverlay />
    </>
  );
}
