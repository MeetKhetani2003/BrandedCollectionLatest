"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, CheckCircle2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import toast from "react-hot-toast";

import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import ProductCard from "../Layouts/ProductCard";
import { redirect, useRouter } from "next/navigation";
import BuyNowCheckoutModal from "../Layouts/BuyNowCheckoutModal";
import { useUserStore } from "@/store/useUserStore";

const PALETTE = {
  BACKGROUND: "bg-[#fff9f4]",
  BORDER: "border-[#deb887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321]",
  HOVER: "hover:bg-[#deb887]",
};

export default function ProductDetailsClient({ product }) {
  const router = useRouter();

  /* ---------------- IMAGES (FIXED) ---------------- */
  const imgFront = product?.imageFrontPath || null;
  const imgBack = product?.imageBackPath || null;

  const gallery = useMemo(() => {
    const extra = product?.gallery?.map((g) => g.path) || [];
    return [imgFront, imgBack, ...extra].filter(Boolean);
  }, [imgFront, imgBack, product?.gallery]);

  /* ---------------- AUTH ---------------- */
  const { user } = useUserStore();
  const isLoggedIn = !!user?._id;

  const requireLogin = () => {
    toast.error("Login first to continue 🔐");
    router.push("/auth");
  };

  /* ---------------- RECOMMENDED ---------------- */
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (!product?._id) return;

    fetch(`/api/products/recommendations?id=${product._id}`)
      .then((r) => r.json())
      .then((d) => setRecommended(d.recommendations || []))
      .catch(() => setRecommended([]));
  }, [product?._id]);

  /* ---------------- WISHLIST ---------------- */
  const { wishlist, addToWishlist, removeFromWishlist } = useAppStore();
  const isWishlisted = wishlist.some((i) => i._id === product._id);

  const toggleWishlist = () => {
    if (!isLoggedIn) return requireLogin();
    isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  /* ---------------- CART ---------------- */
  const addToCart = useCartStore((s) => s.addToCart);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const [buyNowOpen, setBuyNowOpen] = useState(false);

  const isAccessory = product.mainCategory === "accessories";

  const handleAddToCart = () => {
    if (!isLoggedIn) return requireLogin();

    if (isAccessory) {
      addToCart({
        _id: product._id,
        mainCategory: "accessories",
      });
      setAdded(true);
      toast.success("Added to cart 🛒");
      return;
    }

    if (!selectedSize) {
      toast.error("Select a size first 👕");
      return;
    }

    addToCart({
      _id: product._id,
      selectedSize,
      mainCategory: product.mainCategory,
    });

    setAdded(true);
    toast.success(`Added to cart 🛍 (${selectedSize})`);
  };

  /* ---------------- PRICE ---------------- */
  const currentPrice = product?.price?.current;
  const oldPrice = product?.price?.old;

  const hasDiscount =
    typeof oldPrice === "number" &&
    typeof currentPrice === "number" &&
    oldPrice > currentPrice;

  const discountPercent = hasDiscount
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : null;

  /* ---------------- UI ---------------- */
  return (
    <div className={`max-w-[1400px] mx-auto px-4 py-10 ${PALETTE.BACKGROUND}`}>
      <p className={`text-xs opacity-60 mb-4 ${PALETTE.TEXT}`}>
        Home / {product.category} / <span>{product.name}</span>
      </p>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-10">
        {/* Desktop Images */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {gallery.map((img, i) => (
            <div
              key={i}
              className="relative h-[650px] rounded-lg overflow-hidden"
            >
              <Image
                src={img}
                fill
                alt={product.name}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Mobile Swiper */}
        <div className="lg:hidden">
          <Swiper>
            {gallery.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="relative h-[420px]">
                  <Image src={img} fill alt={product.name} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6 lg:sticky lg:top-10">
          <h1 className={`text-3xl font-semibold ${PALETTE.TEXT}`}>
            {product.name}
          </h1>

          <div className="flex gap-2 flex-wrap">
            {product.isNewArrival && (
              <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                New Arrival
              </span>
            )}
            {product.isBestseller && (
              <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                Best Seller
              </span>
            )}
            {product.featured && (
              <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                Featured
              </span>
            )}
          </div>

          <p className="text-sm uppercase tracking-wide text-gray-500">
            {product.brand} · {product.category}
          </p>

          <button
            onClick={toggleWishlist}
            className={`p-2 border rounded ${PALETTE.BORDER}`}
          >
            <Heart
              className={isWishlisted ? "fill-red-500 text-red-500" : ""}
            />
          </button>

          <div className={`border-y py-4 ${PALETTE.BORDER}`}>
            <div className="flex items-center gap-3 flex-wrap">
              <p className={`text-3xl font-bold ${PALETTE.TEXT}`}>
                ₹{currentPrice}
              </p>

              {hasDiscount && (
                <>
                  <p className="text-lg text-gray-400 line-through">
                    ₹{oldPrice}
                  </p>
                  <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">Inclusive of all taxes</p>
          </div>

          {!isAccessory && (
            <div>
              <p className="text-xs uppercase mb-2">Select Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes?.map((s) => (
                  <button
                    key={s.size}
                    onClick={() =>
                      setSelectedSize((p) => (p === s.size ? null : s.size))
                    }
                    className={`px-4 py-2 border rounded ${
                      selectedSize === s.size ? "bg-[#654321] text-white" : ""
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!added ? (
            <button
              onClick={handleAddToCart}
              className={`${PALETTE.ACCENT} w-full py-3 text-white rounded`}
            >
              <ShoppingBag className="inline w-5 h-5 mr-2" />
              Add To Bag
            </button>
          ) : (
            <button
              onClick={() => redirect("/cart")}
              className="w-full py-3 border rounded"
            >
              <CheckCircle2 className="inline w-5 h-5 mr-2" />
              Go To Cart
            </button>
          )}

          <button
            onClick={() => {
              if (!isLoggedIn) return requireLogin();
              if (!isAccessory && !selectedSize) {
                toast.error("Select a size first 👕");
                return;
              }
              setBuyNowOpen(true);
            }}
            className="w-full py-3 border rounded"
          >
            Buy Now
          </button>

          <div>
            <h3 className="font-semibold mt-4">Description</h3>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommended.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {buyNowOpen && (
        <BuyNowCheckoutModal
          onClose={() => setBuyNowOpen(false)}
          item={{
            productId: product._id,
            name: product.name,
            size: isAccessory ? "General" : selectedSize,
            price: product.price.current,
            image: imgFront,
            qty: 1,
          }}
        />
      )}
    </div>
  );
}
