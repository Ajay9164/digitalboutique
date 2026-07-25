import { create } from "zustand";

type FabHandler = (() => void) | null;

type FabState = {
  isVisible: boolean;
  label: string;
  ariaLabel: string;
  onPress: FabHandler;
  showFab: (options?: {
    label?: string;
    ariaLabel?: string;
    onPress?: FabHandler;
  }) => void;
  hideFab: () => void;
  setFabHandler: (handler: FabHandler) => void;
};

export const useFabStore = create<FabState>((set) => ({
  isVisible: false,
  label: "Create",
  ariaLabel: "Create new item",
  onPress: null,
  showFab: (options = {}) =>
    set((state) => ({
      isVisible: true,
      label: options.label ?? state.label,
      ariaLabel: options.ariaLabel ?? options.label ?? state.ariaLabel,
      onPress: options.onPress ?? state.onPress,
    })),
  hideFab: () => set({ isVisible: false, onPress: null }),
  setFabHandler: (handler) => set({ onPress: handler }),
}));
