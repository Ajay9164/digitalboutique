import { create } from "zustand";

type UiState = {
  isNavVisible: boolean;
  setNavVisible: (visible: boolean) => void;
  pageTitle: string | null;
  setPageTitle: (title: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isNavVisible: true,
  setNavVisible: (visible) =>
    set((state) =>
      state.isNavVisible === visible ? state : { isNavVisible: visible },
    ),
  pageTitle: null,
  setPageTitle: (title) =>
    set((state) => (state.pageTitle === title ? state : { pageTitle: title })),
}));
