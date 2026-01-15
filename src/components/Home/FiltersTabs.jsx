"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useProductsStore } from "@/store/useProductStore";

const PALETTE = {
  ACCENT_BG: "bg-[#654321]",
  TEXT_ACTIVE: "text-[#654321]",
  TEXT_IDLE: "text-gray-600",
};

const tabs = [
  "All",
  "New Arrivals",
  "Best Sellers",
  "Oversized",
  "T-Shirts",
  "Shirts",
  "Denims",
  "Shoes",
  "Accessories",
];

export default function FilterTabs() {
  const { setFilter, fetchProducts } = useProductsStore();

  const [activeTab, setActiveTab] = useState("All");

  const handleClick = (tab) => {
    setActiveTab(tab);
    setFilter(tab);
    fetchProducts(); // 🔥 immediately fetch first page
  };

  return (
    <div className="sticky top-[80px] z-40 bg-[#FAF0E6] shadow-sm border-b border-[#DEB887] backdrop-blur-lg">
      <div className="overflow-x-auto no-scrollbar max-w-7xl mx-auto">
        <div className="flex items-center gap-8 px-5 py-4 whitespace-nowrap select-none">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;

            return (
              <button
                key={tab}
                onClick={() => handleClick(tab)}
                className={`relative pb-1 text-[14px] font-semibold transition-colors duration-300
                  ${
                    isActive
                      ? PALETTE.TEXT_ACTIVE
                      : `${PALETTE.TEXT_IDLE} hover:text-[#654321]`
                  }
                `}
              >
                {tab}

                {/* ACTIVE UNDERLINE (Framer Motion) */}
                {isActive && (
                  <motion.div
                    layoutId="underline"
                    className={`absolute bottom-[-3px] left-0 h-[3px] rounded-full ${PALETTE.ACCENT_BG}`}
                    style={{ width: "100%" }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  />
                )}

                {/* HOVER UNDERLINE LIKE NAVBAR */}
                {!isActive && (
                  <span
                    className={`
                      pointer-events-none absolute bottom-[-3px] left-1/2 h-[2px] w-0 rounded-full 
                      ${PALETTE.ACCENT_BG} transition-all duration-300
                      group-hover:w-full group-hover:left-0
                      hover:w-full hover:left-0
                    `}
                  ></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
