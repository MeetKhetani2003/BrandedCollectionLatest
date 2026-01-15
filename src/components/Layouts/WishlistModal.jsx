"use client";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { animateOpen, animateClose } from "@/lib/animations/drawerAnimations";
import Image from "next/image";

export default function WishlistModal({ close }) {
  const { wishlist, fetchWishlist, addToCart, removeFromWishlist } =
    useAppStore();

  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    fetchWishlist();
    animateOpen(drawerRef, overlayRef);
  }, []);

  const closeModal = () => animateClose(drawerRef, overlayRef, close);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm opacity-0 z-[40]"
        onClick={closeModal}
      ></div>

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-[90%] sm:w-[420px] bg-[#FAF0E6] z-[50] shadow-xl translate-x-full flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#DEB887] bg-white/70">
          <h2 className="text-xl font-bold text-[#654321]">Wishlist ❤️</h2>
          <button onClick={closeModal} className="hover:rotate-90 transition">
            <X size={22} className="text-[#654321]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {wishlist.length === 0 && (
            <p className="text-center text-gray-500 pt-10">No items saved 💔</p>
          )}

          {wishlist.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 bg-white p-3 rounded-lg mb-3 shadow hover:scale-[1.02] transition-all"
            >
              <Image
                src={item.imageFront}
                width={70}
                height={90}
                className="rounded-md object-cover"
                alt="item"
              />

              <div className="flex-1">
                <p className="font-semibold text-[#654321] text-sm line-clamp-1">
                  {item.name}
                </p>
                <span className="text-[#654321] font-bold">
                  ₹{item.price.current}
                </span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => addToCart(item)}
                  className="bg-[#654321] text-white px-3 py-1 text-xs rounded-full hover:bg-[#8c6239] transition flex items-center gap-1"
                >
                  <ShoppingCart size={14} />
                  Cart
                </button>

                <button onClick={() => removeFromWishlist(item._id)}>
                  <Trash2
                    size={20}
                    className="text-red-500 hover:scale-110 transition"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
