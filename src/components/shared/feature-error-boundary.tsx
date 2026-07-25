"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
};

type State = {
  hasError: boolean;
  message: string;
};

/**
 * Client feature boundary for WebGL / Konva / camera islands.
 * Complements App Router `error.tsx` for nested recovery without full-route reset.
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Unexpected feature error",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[FeatureErrorBoundary]", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="glass-panel flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-12 text-center"
          role="alert"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            {this.props.title ?? "This panel failed to load"}
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {this.props.description ??
              "You can retry without leaving the page. Other Tailor tools keep working."}
          </p>
          <p className="max-w-sm truncate text-[11px] text-muted-foreground/80">
            {this.state.message}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-1 rounded-xl"
            onClick={this.handleRetry}
          >
            Retry panel
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
