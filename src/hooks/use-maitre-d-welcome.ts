"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { isSpeechSupported, speakText } from "@/features/journey/lib/narration";
import { useUserStore } from "@/stores/user-store";

const SESSION_KEY = "tailor-maitre-d-greeted";

function alreadyGreetedThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markGreetedThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Private mode — still speak once via in-memory guard below.
  }
}

/**
 * Voice-activated Maître d' — once per browser session, after onboarding,
 * greets returning artisans: "Welcome back to the atelier, [Name]."
 *
 * Bound to the first pointer/key interaction so browsers that block autoplay
 * speech still deliver the welcome elegantly.
 */
export function useMaitreDWelcome() {
  const { hydrated, hasCompletedOnboarding, userName } = useUserStore(
    useShallow((s) => ({
      hydrated: s.hydrated,
      hasCompletedOnboarding: s.hasCompletedOnboarding,
      userName: s.userName,
    })),
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!hasCompletedOnboarding) return;
    const name = userName?.trim();
    if (!name) return;
    if (!isSpeechSupported()) return;
    if (alreadyGreetedThisSession()) return;

    const phrase = `Welcome back to the atelier, ${name}.`;
    let spoken = false;

    const greet = () => {
      if (spoken) return;
      spoken = true;
      markGreetedThisSession();
      // Soft, unhurried delivery — never fights the Voice Mentor.
      speakText(phrase, { rate: 0.92, pitch: 1, volume: 1 });
      teardown();
    };

    const teardown = () => {
      window.removeEventListener("pointerdown", greet, true);
      window.removeEventListener("keydown", greet, true);
      window.removeEventListener("touchstart", greet, true);
    };

    // First click / tap / key — satisfies autoplay policies.
    window.addEventListener("pointerdown", greet, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", greet, { capture: true });
    window.addEventListener("touchstart", greet, {
      capture: true,
      passive: true,
    });

    return teardown;
  }, [hydrated, hasCompletedOnboarding, userName]);
}
