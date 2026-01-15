"use client";
import { X } from "lucide-react";

export default function SideModal({ open, onClose, title, icon, children }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition duration-300 z-[40] ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-[400px] max-w-[92vw] h-full bg-[#FAF0E6] shadow-2xl z-[50] transition-transform duration-300 ease-in-out 
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <header className="flex justify-between items-center px-5 h-16 border-b border-[#DEB887]">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-semibold text-[#4E342E]">{title}</h2>
          </div>

          <button
            onClick={onClose}
            className="text-[#4E342E] hover:text-black transition"
          >
            <X size={22} />
          </button>
        </header>

        <div className="h-[calc(100vh-80px)] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}
