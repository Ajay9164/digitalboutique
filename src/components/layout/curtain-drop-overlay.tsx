"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useCurtainTransitionStore } from "@/stores/curtain-transition-store";

const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;
const NAVY_VOID = "#070B16";

function viewportSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

/**
 * Theatrical curtain drop — fixed viewport overlay that survives route-group swaps.
 * Mounted from root `RootOverlays` (not AppShell) so it outlives the cinematic
 * landing unmount and can `router.push('/measurements')` into the `(app)` shell.
 */
export function CurtainDropOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const pushed = useRef(false);
  const phase = useCurtainTransitionStore((s) => s.phase);
  const href = useCurtainTransitionStore((s) => s.href);
  const origin = useCurtainTransitionStore((s) => s.origin);
  const markCovered = useCurtainTransitionStore((s) => s.markCovered);
  const beginLift = useCurtainTransitionStore((s) => s.beginLift);
  const reset = useCurtainTransitionStore((s) => s.reset);

  useEffect(() => {
    if (phase === "idle") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // Reduced motion: seal instantly, then navigate.
  useEffect(() => {
    if (!reduceMotion || phase !== "dropping") return;
    const id = window.setTimeout(() => markCovered(), 32);
    return () => window.clearTimeout(id);
  }, [reduceMotion, phase, markCovered]);

  useEffect(() => {
    if (phase !== "holding" || !href || pushed.current) return;
    pushed.current = true;
    // Handoff into the `(app)` route group — TopHeader / BottomNav / voice FAB
    // mount with /measurements, not on the cinematic landing.
    router.push(href);
  }, [phase, href, router]);

  useEffect(() => {
    if (phase !== "holding" || !href) return;
    if (pathname !== href) return;
    const id = window.requestAnimationFrame(() => beginLift());
    return () => window.cancelAnimationFrame(id);
  }, [phase, href, pathname, beginLift]);

  useEffect(() => {
    if (phase === "idle") pushed.current = false;
  }, [phase]);

  if (typeof document === "undefined" || !origin) return null;

  const active = phase !== "idle";
  const vp = viewportSize();

  return createPortal(
    <AnimatePresence>
      {active ? (
        <motion.div
          key="curtain-drop"
          role="presentation"
          aria-hidden
          className="pointer-events-auto fixed z-[300]"
          style={{ backgroundColor: NAVY_VOID }}
          initial={
            reduceMotion
              ? {
                  top: 0,
                  left: 0,
                  width: vp.width,
                  height: vp.height,
                  borderRadius: 0,
                  opacity: 1,
                }
              : {
                  top: origin.top,
                  left: origin.left,
                  width: origin.width,
                  height: origin.height,
                  borderRadius: 20,
                  opacity: 1,
                }
          }
          animate={
            phase === "lifting"
              ? {
                  top: 0,
                  left: 0,
                  width: vp.width,
                  height: vp.height,
                  borderRadius: 0,
                  opacity: 0,
                }
              : {
                  top: 0,
                  left: 0,
                  width: vp.width,
                  height: vp.height,
                  borderRadius: 0,
                  opacity: 1,
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.12, ease: "linear" }
              : phase === "lifting"
                ? { duration: 0.42, ease: CURTAIN_EASE }
                : { duration: 0.72, ease: CURTAIN_EASE }
          }
          onAnimationComplete={() => {
            const current = useCurtainTransitionStore.getState().phase;
            if (current === "dropping") markCovered();
            else if (current === "lifting") reset();
          }}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
