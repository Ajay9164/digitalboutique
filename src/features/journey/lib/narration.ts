/**
 * Voice-ready narration architecture.
 * Speaks lesson guidance when enabled; no-ops when unsupported or muted.
 */

export type NarrationCue = {
  title: string;
  what: string;
  why?: string;
};

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopNarration(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

/** Cancel any queued/speaking utterances — safe to call from route unmount. */
export function disposeSpeechSynthesis(): void {
  stopNarration();
}

export function speakText(
  text: string,
  options?: { rate?: number; pitch?: number; lang?: string; volume?: number },
): void {
  if (!text.trim() || !isSpeechSupported()) return;
  stopNarration();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options?.rate ?? 0.95;
  utterance.pitch = options?.pitch ?? 1;
  utterance.lang = options?.lang ?? "en-US";
  // Volume 0–1 is relative to the device master volume — never override system mute.
  utterance.volume = Math.min(1, Math.max(0, options?.volume ?? 1));
  window.speechSynthesis.speak(utterance);
}

export function speakCue(cue: NarrationCue, enabled: boolean): void {
  if (!enabled) return;
  const text = [cue.title, cue.what, cue.why].filter(Boolean).join(". ");
  speakText(text);
}
