"use client";
import { create } from "zustand";

export const useUiStore = create((set) => ({
  sizeModal: {
    open: false,
    product: null,
  },

  openSizeModal: (product) => set({ sizeModal: { open: true, product } }),

  closeSizeModal: () => set({ sizeModal: { open: false, product: null } }),
}));
