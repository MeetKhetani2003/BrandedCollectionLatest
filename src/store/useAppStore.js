"use client";

import { create } from "zustand";
import toast from "react-hot-toast";
// import { tokenData } from "@/lib/authCookie";
// import { cookies } from "next/headers";

export const useAppStore = create((set, get) => ({
  wishlist: [],
  cart: [],
  loadingWishlist: false,
  loadingCart: false,

  // ------------------ AUTH CHECK ------------------
  isLoggedIn: async () => {
    const res = await fetch("/api/user/profile", {
      credentials: "include",
    });
    if (res.ok) {
      return true;
    }
    return false;
  },

  // ------------------ WISHLIST ------------------
  fetchWishlist: async () => {
    if (!get().isLoggedIn()) return; // guest skip

    try {
      set({ loadingWishlist: true });

      const res = await fetch("/api/wishlist", {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      set({ wishlist: data.wishlist || [] });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loadingWishlist: false });
    }
  },

  addToWishlist: async (product) => {
    if (!get().isLoggedIn()) {
      return toast.error("Login required to add wishlist ❤️");
    }

    try {
      const exists = get().wishlist.some((p) => p._id === product._id);
      if (exists) return toast("⚠ Already in wishlist");

      set({ wishlist: [...get().wishlist, product] });

      await fetch("/api/wishlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });

      await get().fetchWishlist();
      toast.success("❤️ Added to wishlist");
    } catch {
      toast.error("Error updating wishlist");
    }
  },

  removeFromWishlist: async (productId) => {
    if (!get().isLoggedIn()) return;

    set({
      wishlist: get().wishlist.filter((i) => i._id !== productId),
    });

    await fetch(`/api/wishlist?productId=${productId}`, {
      method: "DELETE",
      credentials: "include",
    });

    toast("❌ Removed from wishlist");
  },

  // ------------------ CART ------------------
  fetchCart: async () => {
    if (!get().isLoggedIn()) {
      set({ cart: [] });
      return;
    }

    try {
      set({ loadingCart: true });

      const res = await fetch("http://localhost:3000/api/cart", {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      console.log("-------->>>>>", res);

      const data = await res.json();

      const normalized = data.cart.map((item) => ({
        _id: item.product?._id,
        name: item.product?.name ?? "Unknown",
        price: item.product?.price ?? { current: 0 },
        imageFront: item.product?.imageFront ?? "/placeholder.png",
        selectedSize: item.size,
        qty: item.qty ?? 1,
      }));

      set({ cart: normalized });
    } catch (err) {
      console.error("FETCH CART ERROR →", err);
    } finally {
      set({ loadingCart: false });
    }
  },
  addToCart: async (product) => {
    if (!product.selectedSize) {
      toast.error("Please select a size first");
      return;
    }

    console.log("=========>>", get().isLoggedIn());

    try {
      const exists = get().cart.find(
        (p) => p._id === product._id && p.selectedSize === product.selectedSize
      );

      if (exists) {
        set({
          cart: get().cart.map((p) =>
            p._id === product._id && p.selectedSize === product.selectedSize
              ? { ...p, qty: p.qty + 1 }
              : p
          ),
        });
      } else {
        set({
          cart: [...get().cart, { ...product, qty: 1 }],
        });
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          qty: 1,
          size: product.selectedSize,
        }),
      });

      // 🚨 If backend blocked -> stop UI update
      if (!get().isLoggedIn()) {
        // If modal already blocked, don't show toast again
        if (!product.__verified) {
          toast.error("Login required before adding to cart 🔐");
        }
        return;
      }

      if (!res.ok) throw new Error();

      toast.success(`Added to cart 🛍 (${product.selectedSize})`);
    } catch (err) {
      console.error(err);
      toast.error("Failed, please try again 😬");
      await get().fetchCart();
    }
  },

  updateQty: async (productId, size, qty) => {
    if (!get().isLoggedIn()) return;

    if (qty <= 0) return get().removeFromCart(productId, size);

    set({
      cart: get().cart.map((i) =>
        i._id === productId && i.selectedSize === size ? { ...i, qty } : i
      ),
    });

    await fetch(`/api/cart`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty, size }),
    });

    await get().fetchCart();
  },

  removeFromCart: async (productId, size) => {
    if (!get().isLoggedIn()) return;

    set({
      cart: get().cart.filter(
        (i) => !(i._id === productId && i.selectedSize === size)
      ),
    });

    await fetch(`/api/cart?productId=${productId}&size=${size}`, {
      method: "DELETE",
      credentials: "include",
    });

    toast("🗑 Removed from cart");
  },

  cartCount: () => get().cart.reduce((t, i) => t + (i.qty || 0), 0),
}));
