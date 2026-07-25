"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Mannequin2DFallback } from "@/features/measurements/components/mannequin-2d-fallback";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Catches React-level WebGL / R3F mount failures and swaps to the 2D mannequin.
 * Context-loss without a thrown error is handled separately in InteractiveMannequin.
 */
export class MannequinWebGLBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[MannequinWebGLBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Mannequin2DFallback message="3D View Unavailable — Using 2D Mode" />
      );
    }
    return this.props.children;
  }
}
