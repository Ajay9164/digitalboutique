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
    set((state) => {
      const label = options.label ?? state.label;
      const ariaLabel = options.ariaLabel ?? options.label ?? state.ariaLabel;
      const onPress =
        options.onPress !== undefined ? options.onPress : state.onPress;

      if (
        state.isVisible &&
        state.label === label &&
        state.ariaLabel === ariaLabel &&
        state.onPress === onPress
      ) {
        return state;
      }

      return {
        isVisible: true,
        label,
        ariaLabel,
        onPress,
      };
    }),
  hideFab: () =>
    set((state) =>
      state.isVisible || state.onPress
        ? { isVisible: false, onPress: null }
        : state,
    ),
  setFabHandler: (handler) =>
    set((state) => (state.onPress === handler ? state : { onPress: handler })),
}));
