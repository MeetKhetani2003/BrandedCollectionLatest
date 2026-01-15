"use client";
import { useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { animateOpen, animateClose } from "@/lib/animations/drawerAnimations";
import { redirect } from "next/navigation";

const PALETTE = {
  BG: "bg-[#FAF0E6]",
  BORDER: "border-[#DEB887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321] text-white",
  LIGHT: "bg-white/70",
};

export default function CartModal({ close }) {
  const { cart, fetchCart, updateQty, removeFromCart } = useCartStore();
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    fetchCart();
    animateOpen(drawerRef, overlayRef);
  }, []);

  const closeModal = () => animateClose(drawerRef, overlayRef, close);

  // 🧮 Subtotal Calculation
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0),
    [cart]
  );

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeModal}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm opacity-0 z-[40]"
      ></div>

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 h-full w-[90%] sm:w-[420px] ${PALETTE.BG} z-[50] shadow-xl translate-x-full flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-4 border-b ${PALETTE.BORDER} ${PALETTE.LIGHT}`}
        >
          <h2 className="text-xl font-bold text-[#654321]">Cart 🛍</h2>
          <button onClick={closeModal} className="hover:rotate-90 transition">
            <X size={22} className={`${PALETTE.TEXT}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {cart.length === 0 && (
            <p className="text-center text-gray-500 pt-10">Cart is empty 🥲</p>
          )}

          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex items-center gap-4 bg-white p-3 rounded-lg mb-3 shadow hover:scale-[1.02] transition-all"
            >
              <Image
                src={item.image}
                width={70}
                height={90}
                className="rounded-md object-cover"
                alt=""
              />

              <div className="flex-1">
                <p className="font-semibold text-[#654321] text-sm line-clamp-2">
                  {item.name}
                </p>
                <p className="text-xs text-gray-600">Size: {item.size}</p>

                {/* Quantity */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() =>
                      updateQty(
                        item.productId,
                        item.size,
                        Math.max(1, item.qty - 1)
                      )
                    }
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="text-sm font-medium">{item.qty}</span>

                  <button
                    onClick={() =>
                      updateQty(item.productId, item.size, item.qty + 1)
                    }
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(item.productId, item.size)}
                className="hover:scale-110 transition"
              >
                <Trash2 size={20} className="text-red-500" />
              </button>

              {/* Price */}
              <p className="font-semibold text-[#654321] ml-2">
                ₹{Number(item.price) * item.qty}
              </p>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div
            className={`border-t ${PALETTE.BORDER} p-4 bg-white/80 backdrop-blur`}
          >
            <div className="flex justify-between mb-3">
              <span className={`${PALETTE.TEXT} font-medium`}>Subtotal:</span>
              <span className="text-lg font-bold text-[#654321]">
                ₹{subtotal}
              </span>
            </div>

            <button
              onClick={() => redirect("/checkout")}
              className={`w-full py-3 rounded-full ${PALETTE.ACCENT} hover:opacity-90 transition font-semibold tracking-wide flex items-center justify-center gap-2`}
            >
              <ShoppingCart size={18} />
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
