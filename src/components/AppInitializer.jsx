"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
// import { tokenData } from "@/lib/authCookie";

export default function AppInitializer() {
  const { fetchCart, fetchWishlist, cart } = useAppStore();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth="))
      ?.split("=")[1];
    fetchCart();
    if (token) {
      fetchWishlist();
    }
  }, []);
  console.log(cart);

  return null;
}
