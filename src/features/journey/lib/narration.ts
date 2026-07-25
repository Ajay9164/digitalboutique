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

export function speakCue(cue: NarrationCue, enabled: boolean): void {
  if (!enabled || !isSpeechSupported()) return;
  stopNarration();
  const text = [cue.title, cue.what, cue.why].filter(Boolean).join(". ");
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}
