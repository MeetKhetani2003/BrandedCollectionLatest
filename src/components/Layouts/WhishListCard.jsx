"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/useCartStore";
import { useAppStore } from "@/store/useAppStore";

export default function WishlistCard({ item, showActions = true }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromWishlist = useAppStore((s) => s.removeFromWishlist);

  // ✅ normalize image source
  const imageSrc =
    item.imageFront ||
    (item.imageFrontFileId ? `/api/images/${item.imageFrontFileId}` : null);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Image */}
      <Link href={`/products/${item._id}`}>
        <div className="relative w-full h-[260px] bg-[#f2e8dc]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
              No Image
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-[#654321] line-clamp-1">
          {item.name}
        </p>

        {item.price && (
          <p className="mt-1 font-bold text-[#654321]">₹{item.price.current}</p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => {
                addToCart({
                  ...item,
                  selectedSize: item.availableSizes?.[0],
                });
                toast.success("Added to cart 🛒");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-[#654321] text-white hover:bg-[#8c6239]"
            >
              <ShoppingCart size={14} />
              Cart
            </button>

            <button
              onClick={() => {
                removeFromWishlist(item._id);
                toast.success("Removed from wishlist");
              }}
              className="text-red-500 hover:scale-110 transition"
              aria-label="Remove"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
