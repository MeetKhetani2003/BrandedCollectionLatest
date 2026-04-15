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

  const [imageSrc, setImageSrc] = useState(
    product.imageFrontPath || "/assets/Products/Product1.jpg",
  );

  /* 🔹 Back image visibility state */
  const [showBackImage, setShowBackImage] = useState(!!product.imageBackPath);

  const { user } = useUserStore();
  const isLoggedIn = !!user?._id;

  const wishlist = useAppStore((s) => s.wishlist);
  const addWishlist = useAppStore((s) => s.addToWishlist);
  const removeWishlist = useAppStore((s) => s.removeFromWishlist);
  const isWishlisted = wishlist.some((i) => i._id === product._id);

  const addToCart = useCartStore((s) => s.addToCart);

  // Check if product is out of stock
  const totalStock =
    product.sizes?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;
  const isOutOfStock = totalStock === 0;

  const requireLogin = () => {
    toast.error("Login first to continue 🔐");
    router.push("/auth");
  };

  console.log("Product", product);

  return (
    <>
      {!isImageLoaded && <ProductSkeleton />}

      <div
        className={`bg-[#FAF0E6] rounded-2xl shadow-md border border-[#DEB887]
        transition-all hover:shadow-xl hover:scale-[1.01] flex-col h-full cursor-pointer ${
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
          {/* FRONT IMAGE */}
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
              setIsImageLoaded(true);
            }}
          />

          {/* BACK IMAGE (only if exists & valid) */}
          {showBackImage && (
            <Image
              src={product.imageBackPath}
              alt="back"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className={`object-cover transition-opacity duration-300 ${
                hover ? "opacity-100" : "opacity-0"
              }`}
              onError={() => {
                setShowBackImage(false);
              }}
            />
          )}

          {/* ---------- WISHLIST ---------- */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!isLoggedIn) {
                requireLogin();
                return;
              }

              if (isWishlisted) {
                removeWishlist(product._id);
              } else {
                addWishlist(product);
              }
            }}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md z-30 hover:bg-white transition-all active:scale-90"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>

          {/* ---------- OUT OF STOCK BADGE ---------- */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <span className=" text-white bg-red-600 font-bold text-lg px-6 py-3 rounded-lg shadow-xl">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* ---------- DETAILS ---------- */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-md lg:text-lg text-[#654321] line-clamp-2 min-h-[3rem] lg:min-h-[3.5rem] leading-tight">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col gap-1">
              {product.price?.old > 0 && (
                <span className="text-xs text-gray-500 line-through">
                  ₹{product.price.old}
                </span>
              )}
              <span className="text-xl font-bold text-[#654321]">
                ₹{product.price?.current}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();

                if (isOutOfStock) {
                  toast.error("This product is currently out of stock");
                  return;
                }

                if (!isLoggedIn) return requireLogin();

                if (product.mainCategory === "accessories") {
                  addToCart({ ...product, selectedSize: "General" });
                } else {
                  setShowSizeModal(true);
                }
              }}
              disabled={isOutOfStock}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                isOutOfStock
                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                  : "bg-[#654321] text-white hover:bg-[#4a3219]"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Add"}
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
