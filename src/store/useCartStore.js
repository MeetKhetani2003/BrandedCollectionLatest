import toast from "react-hot-toast";
import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cart: [],

  fetchCart: async () => {
    const res = await fetch("/api/user/cart", {
      credentials: "include",
    });

    const data = await res.json();

    // ✅ NORMALIZE SHAPE
    const normalized = data.map((item) => ({
      _id: item.productId,
      name: item.name,
      price: item.price,
      imageFront: item.image,
      selectedSize: item.size || "General",
      qty: item.qty,
    }));

    set({ cart: normalized });
  },

  addToCart: async (product) => {
    const size =
      product.selectedSize ||
      product.size ||
      (product.mainCategory === "accessories" ? "General" : null);

    if (!product._id || !size) return;

    const res = await fetch("/api/user/cart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product._id,
        size,
      }),
    });

    const data = await res.json();
    if (!data.success) return;

    await get().fetchCart();
  },

  updateQty: async (productId, size, qty) => {
    await fetch(`/api/user/cart?productId=${productId}&size=${size}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty }),
    });

    await get().fetchCart();
  },

  removeFromCart: async (productId, size) => {
    await fetch(`/api/user/cart?productId=${productId}&size=${size}`, {
      method: "DELETE",
      credentials: "include",
    });

    await get().fetchCart();
  },

  cartCount: () => get().cart.reduce((total, item) => total + item.qty, 0),
}));
