import axios from "axios";
import { create } from "zustand";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  setUser: (updatedUser) => set({ user: updatedUser }),

  getUser: async (force = false) => {
    if (get().initialized && !force) return;

    set({ loading: true, error: null });

    try {
      const res = await axios.get("/api/user/profile", {
        withCredentials: true,
      });
      console.log("REs", res);

      const data = res.data;

      set({
        user: data?.user || null,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      console.error("User Fetch Error:", error);
      set({
        loading: false,
        error: error.message,
        initialized: true,
      });
    }
  },

  updateUserProfile: async (payload) => {
    try {
      const res = await axios.patch("/api/user/profile", payload, {
        withCredentials: true,
      });
      console.log(res);

      if (res.data?.user) {
        set({ user: res.data.user });
      }

      return res.data;
    } catch (err) {
      console.error(err);
    }
  },
  logout: async () => {
    await fetch("/api/user/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    // clear all client state
    set({ user: null, initialized: true, loading: false });
    useCartStore.getState().clearCart?.();
    useAppStore.getState().clearWishlist?.();
  },
}));
