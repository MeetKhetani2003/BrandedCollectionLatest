"use client";

import { X } from "lucide-react";

export default function SizeSelectModalWhishlist({
  product,
  onSelect,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-lg p-5 relative">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X />
        </button>

        <h3 className="text-lg font-semibold text-[#654321] mb-4">
          Select Size
        </h3>

        <div className="flex flex-wrap gap-3">
          {product.availableSizes?.map((size) => (
            <button
              key={size}
              onClick={() => setSelected((prev) => (prev === s ? null : s))}
              className="px-4 py-2 border rounded-md text-sm hover:bg-[#654321] hover:text-white transition"
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
