import { create } from 'zustand';

interface UIStore {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isNavScrolled: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setNavScrolled: (scrolled: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isNavScrolled: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setNavScrolled: (scrolled) => set({ isNavScrolled: scrolled }),
}));
