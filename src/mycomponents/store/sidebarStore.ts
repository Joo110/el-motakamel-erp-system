// store/sidebarStore.js
import { create } from "zustand";

const useSidebarStore = create((set) => ({
  isOpen: false, // Sidebar مغلق افتراضيًا على الموبايل
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export default useSidebarStore;