"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import SelectSizeModal from "./SelectSizeModal";
import { useRouter } from "next/navigation";

import { useAppStore } from "../../store/useAppStore";
import { useCartStore } from "../../store/useCartStore";
import { useUserStore } from "../../store/useUserStore";

/* ---------- Skeleton ---------- */
const ProductSkeleton = () => (
  <div className="bg-[#FAF0E6] rounded-2xl shadow-md border border-[#DEB887] animate-pulse">
    <div className="h-80 w-full bg-gray-300 rounded-t-2xl" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-300 rounded w-3/4" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-300 rounded w-1/4" />
        <div className="h-8 bg-gray-300 rounded-full w-20" />
      </div>
    </div>
  </div>
);

export default function ProductCard({ product }) {
  if (!product) return null;

  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // ✅ SAFE image source (fallback always exists)
  const [imageSrc, setImageSrc] = useState(
    product.imageFrontPath || "/assets/Products/Product1.jpg",
  );

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
      {!isImageLoaded && <ProductSkeleton />}

      <div
        className={`bg-[#FAF0E6] rounded-2xl shadow-md border border-[#DEB887]
        transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer ${
          isImageLoaded ? "block" : "hidden"
        }`}
        onClick={() => router.push(`/products/${product.slug}`)}
      >
        {/* ---------- IMAGE ---------- */}
        <div
          className="relative h-80 w-full overflow-hidden rounded-t-2xl"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover"
            priority
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              setImageSrc("/assets/Products/Product1.jpg");
              setIsImageLoaded(true); // 🔑 Prevent infinite skeleton
            }}
          />

          {/* ---------- BACK IMAGE (OPTIONAL) ---------- */}
          {product.imageBackPath && (
            <Image
              src={product.imageBackPath}
              alt="back"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className={`object-cover transition duration-300 ${
                hover ? "opacity-100" : "opacity-0"
              }`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          {/* ---------- WISHLIST ---------- */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isLoggedIn) return requireLogin();
              isWishlisted ? removeWishlist(product._id) : addWishlist(product);
            }}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md z-20 hover:bg-white"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* ---------- DETAILS ---------- */}
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
              className="px-4 py-2 rounded-full bg-[#654321] text-white text-sm hover:bg-[#4a3219]"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* ---------- SIZE MODAL ---------- */}
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
