"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import SelectSizeModal from "./SelectSizeModal";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";

export default function ProductCard({ product }) {
  if (!product) return null;
  console.log(product);

  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const { user } = useUserStore();
  const isLoggedIn = !!user?._id;

  const wishlist = useAppStore((s) => s.wishlist);
  const addWishlist = useAppStore((s) => s.addToWishlist);
  const removeWishlist = useAppStore((s) => s.removeFromWishlist);
  const isWishlisted = wishlist.some((i) => i._id === product._id);

  const addToCart = useCartStore((s) => s.addToCart);

  const requireLogin = () => {
    toast.error("Login first to continue 🔐");
    router.push("/auth");
  };

  return (
    <>
      <div
        className="bg-[#FAF0E6] rounded-2xl shadow-md border border-[#DEB887]
        transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer"
        onClick={() => router.push(`/products/${product.slug}`)}
      >
        <div
          className="relative h-80 w-full"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {product.imageFrontPath && (
            <Image
              src={product.imageFrontPath}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover"
              priority
            />
          )}

          {product.imageBackPath && (
            <Image
              src={product.imageBackPath}
              alt="back"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className={`object-cover transition ${
                hover ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* ❤️ Wishlist */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isLoggedIn) return requireLogin();
              isWishlisted ? removeWishlist(product._id) : addWishlist(product);
            }}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md z-20"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg truncate text-[#654321]">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xl font-bold text-[#654321]">
              ₹{product.price?.current}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoggedIn) return requireLogin();

                if (product.mainCategory === "accessories") {
                  addToCart({ ...product, selectedSize: "General" });
                } else {
                  setShowSizeModal(true);
                }
              }}
              className="px-4 py-2 rounded-full bg-[#654321] text-white text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {showSizeModal && (
        <SelectSizeModal
          mainCategory={product.mainCategory}
          sizes={product.sizes}
          close={() => setShowSizeModal(false)}
          onSelect={(size) => {
            addToCart({ ...product, selectedSize: size });
            setShowSizeModal(false);
          }}
        />
      )}
    </>
  );
}
