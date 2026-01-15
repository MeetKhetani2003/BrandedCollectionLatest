// store/useProductsStore.js
import { create } from "zustand";
import toast from "react-hot-toast";

export const useProductsStore = create((set, get) => ({
  products: [],
  page: 1,
  hasMore: true,
  loading: false,
  activeFilter: "All",

  setFilter: (filter) => {
    set({
      activeFilter: filter,
      products: [],
      page: 1,
      hasMore: true,
    });
    get().fetchProducts(); // 🔥 REQUIRED
  },

  fetchProducts: async () => {
    const { page, products, loading, hasMore, activeFilter } = get();
    if (loading || !hasMore) return;

    set({ loading: true });

    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "12");

      switch (activeFilter) {
        case "New Arrivals":
          params.set("isNewArrival", "true");
          break;
        case "Best Sellers":
          params.set("isBestseller", "true");
          break;
        case "Oversized":
          params.set("subcategory", "Oversized");
          break;
        case "T-Shirts":
          params.set("category", "Polo T-Shirts");
          break;
        case "Shirts":
          params.set("category", "Shirts");
          break;
        case "Denims":
          params.set("category", "Denim");
          break;
        case "Shoes":
          params.set("mainCategory", "shoes");
          break;
        case "Accessories":
          params.set("mainCategory", "accessories");
          break;
      }

      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();
      const fetched = data.products || data || [];

      if (!fetched.length) {
        set({ hasMore: false, loading: false });
        return;
      }

      set({
        products: [...products, ...fetched],
        page: page + 1,
        hasMore: fetched.length === 12,
        loading: false,
      });
    } catch (err) {
      toast.error("Failed to load products");
      set({ loading: false });
    }
  },
}));
