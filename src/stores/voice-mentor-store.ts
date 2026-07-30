import { create } from "zustand";
import {
  parseTailoringQuery,
  toMentorAnswer,
  type MentorAnswer,
} from "@/lib/speech/mentor-intent";
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  speechRecognitionErrorMessage,
  type SpeechRecognitionLike,
} from "@/lib/speech/recognition";
import {
  isSpeechSupported,
  speakText,
  stopNarration,
} from "@/features/journey/lib/narration";

type VoiceMentorState = {
  supported: boolean;
  ttsSupported: boolean;
  listening: boolean;
  processing: boolean;
  transcript: string;
  answer: MentorAnswer | null;
  error: string | null;
  panelOpen: boolean;
  hydrate: () => void;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  dismissPanel: () => void;
  clearError: () => void;
};

let recognition: SpeechRecognitionLike | null = null;
let finalBuffer = "";
/** Guards against double-handling when stop() triggers onend after onresult. */
let commandHandled = false;

function ensureRecognition(): SpeechRecognitionLike | null {
  if (recognition) return recognition;
  recognition = createSpeechRecognition();
  return recognition;
}

function haltRecognition() {
  try {
    recognition?.stop();
  } catch {
    // already stopped
  }
}

function respondToTranscript(
  transcript: string,
  set: (partial: Partial<VoiceMentorState>) => void,
) {
  if (commandHandled) return;
  commandHandled = true;

  // Stop the mic immediately — saves battery and avoids trailing noise.
  haltRecognition();

  const answer = toMentorAnswer(parseTailoringQuery(transcript));
  set({
    processing: false,
    listening: false,
    transcript,
    answer,
    panelOpen: true,
    error: null,
  });
  // Speak at default utterance volume (1) so device system volume is respected.
  speakText(answer.spoken);
}

export const useVoiceMentorStore = create<VoiceMentorState>((set, get) => ({
  supported: false,
  ttsSupported: false,
  listening: false,
  processing: false,
  transcript: "",
  answer: null,
  error: null,
  panelOpen: false,

  hydrate: () => {
    set({
      supported: isSpeechRecognitionSupported(),
      ttsSupported: isSpeechSupported(),
    });
  },

  startListening: () => {
    const { supported, listening } = get();
    if (!supported) {
      set({
        error:
          "Voice mentor needs Web Speech recognition (Chrome, Edge, or Safari).",
        panelOpen: true,
      });
      return;
    }
    if (listening) return;

    stopNarration();
    finalBuffer = "";
    commandHandled = false;

    const rec = ensureRecognition();
    if (!rec) {
      set({
        error: "Speech recognition could not start on this device.",
        panelOpen: true,
      });
      return;
    }

    rec.onstart = () => {
      set({
        listening: true,
        processing: false,
        error: null,
        transcript: "",
        panelOpen: true,
      });
    };

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalBuffer = `${finalBuffer} ${text}`.trim();
        } else {
          interim = `${interim} ${text}`.trim();
        }
      }
      const live = finalBuffer || interim;
      set({ transcript: live });

      // Final phrase received → stop listening immediately and answer.
      if (finalBuffer.trim() && !commandHandled) {
        set({ processing: true, listening: false });
        respondToTranscript(finalBuffer.trim(), set);
      }
    };

    rec.onerror = (event) => {
      const message = speechRecognitionErrorMessage(event.error);
      // Aborted/stop after a successful command is expected — stay silent.
      if (commandHandled || event.error === "aborted") {
        set({ listening: false, processing: false });
        return;
      }
      set({
        listening: false,
        processing: false,
        error: message || null,
        panelOpen: Boolean(message),
      });
    };

    rec.onend = () => {
      if (commandHandled) {
        set({ listening: false, processing: false });
        return;
      }
      const text = finalBuffer.trim() || get().transcript.trim();
      if (text) {
        set({ processing: true, listening: false });
        respondToTranscript(text, set);
        return;
      }
      set({ listening: false, processing: false });
    };

    try {
      rec.start();
    } catch {
      set({
        listening: false,
        error: "Microphone is busy. Wait a moment and try again.",
        panelOpen: true,
      });
    }
  },

  stopListening: () => {
    haltRecognition();
    set({ listening: false });
  },

  toggleListening: () => {
    if (get().listening) {
      get().stopListening();
      return;
    }
    get().startListening();
  },

  dismissPanel: () => {
    if (get().listening) {
      try {
        recognition?.abort();
      } catch {
        // already stopped
      }
    }
    stopNarration();
    commandHandled = true;
    set({
      panelOpen: false,
      listening: false,
      processing: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

/** Abort recognition listeners + cancel TTS — call on shell unmount. */
export function disposeVoiceMentorRuntime() {
  try {
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onstart = null;
      recognition.abort();
    }
  } catch {
    // already stopped
  }
  recognition = null;
  finalBuffer = "";
  commandHandled = true;
  stopNarration();
  useVoiceMentorStore.setState({
    listening: false,
    processing: false,
  });
}
