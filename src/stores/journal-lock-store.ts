import { create } from "zustand";
import {
  authenticateJournalBiometric,
  clearJournalSessionUnlock,
  disableJournalBiometric,
  isJournalSessionUnlocked,
  isPlatformAuthenticatorAvailable,
  isWebAuthnSupported,
  journalLockErrorMessage,
  loadJournalLockRecord,
  registerJournalBiometric,
} from "@/lib/webauthn/journal-lock";

type JournalLockState = {
  ready: boolean;
  supported: boolean;
  platformAvailable: boolean;
  enabled: boolean;
  unlocked: boolean;
  busy: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  unlock: () => Promise<void>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  lockSession: () => void;
  clearError: () => void;
};

export const useJournalLockStore = create<JournalLockState>((set, get) => ({
  ready: false,
  supported: false,
  platformAvailable: false,
  enabled: false,
  unlocked: true,
  busy: false,
  error: null,

  hydrate: async () => {
    if (get().ready) return;
    const supported = isWebAuthnSupported();
    let platformAvailable = false;
    if (supported) {
      platformAvailable = await isPlatformAuthenticatorAvailable();
    }

    try {
      const record = await loadJournalLockRecord();
      const unlocked =
        !record.enabled || isJournalSessionUnlocked();
      set({
        ready: true,
        supported,
        platformAvailable,
        enabled: record.enabled,
        unlocked,
        error: null,
      });
    } catch {
      set({
        ready: true,
        supported,
        platformAvailable,
        enabled: false,
        unlocked: true,
        error: null,
      });
    }
  },

  unlock: async () => {
    if (get().busy) return;
    set({ busy: true, error: null });
    try {
      await authenticateJournalBiometric();
      set({ unlocked: true, busy: false, error: null });
    } catch (error) {
      set({
        busy: false,
        unlocked: false,
        error: journalLockErrorMessage(error),
      });
    }
  },

  enable: async () => {
    if (get().busy) return;
    set({ busy: true, error: null });
    try {
      await registerJournalBiometric();
      set({
        enabled: true,
        unlocked: true,
        busy: false,
        error: null,
      });
    } catch (error) {
      set({
        busy: false,
        error: journalLockErrorMessage(error),
      });
    }
  },

  disable: async () => {
    if (get().busy) return;
    set({ busy: true, error: null });
    try {
      // Confirm identity before removing the lock.
      if (get().enabled) {
        await authenticateJournalBiometric();
      }
      await disableJournalBiometric();
      set({
        enabled: false,
        unlocked: true,
        busy: false,
        error: null,
      });
    } catch (error) {
      set({
        busy: false,
        error: journalLockErrorMessage(error),
      });
    }
  },

  lockSession: () => {
    clearJournalSessionUnlock();
    set({ unlocked: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
