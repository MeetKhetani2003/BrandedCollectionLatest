"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

const PALETTE = {
  BG: "bg-[#FAF0E6]",
  BORDER: "border-[#DEB887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321] text-white",
};

export default function AboutPage() {
  return (
    <div
      className={`${PALETTE.BG} ${PALETTE.TEXT} selection:bg-[#DEB887]/30 min-h-screen`}
    >
      {/* ================= CLEAN HERO ================= */}
      <section className="relative h-[70vh] flex items-end pb-20 px-8 md:px-24">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000"
            alt="Atelier"
            className="w-full h-full object-cover grayscale opacity-40"
          />
        </div>

        <div className="relative z-10 max-w-5xl">
          <h1 className="font-sans text-6xl md:text-9xl font-semibold tracking-tighter uppercase leading-[0.85]">
            Refined <br /> Simplicity.
          </h1>
        </div>
      </section>

      {/* ================= STORY SECTION (FIXED SPACE) ================= */}
      <section className="py-32 px-8 md:px-24 border-t border-[#DEB887]/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT SIDE: Now filled with Brand Identifiers */}
          <div className="lg:col-span-4 space-y-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#DEB887] font-semibold mb-2">
                // Foundation
              </p>
              <p className="font-sans text-2xl uppercase font-semibold">
                Established <br /> 2020 — Mumbai
              </p>
            </div>

            <div className="pt-8 border-t border-[#DEB887]/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">
                Core Atelier Specs:
              </p>
              <ul className="font-mono text-[11px] uppercase space-y-2 opacity-70">
                <li>• Hand-stitched Finish</li>
                <li>• Organic Fiber Focus</li>
                <li>• Zero-waste Patterning</li>
                <li>• Small Batch Production</li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE: Content */}
          <div className="lg:col-span-8">
            <h2 className="font-sans text-3xl md:text-5xl font-semibold leading-tight max-w-3xl">
              We believe in clothing that acts as a quiet companion to the
              wearer—intentional, durable, and free from unnecessary noise.
            </h2>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 font-sans text-lg md:text-xl text-gray-600 leading-relaxed font-light">
              <p>
                The Atelier was born out of a desire to return to the
                essentials. In an era of fast fashion, we chose the slow path:
                meticulous sourcing, ethical labor, and timeless silhouettes.
              </p>
              <p>
                Every piece in our collection is a result of months of
                prototyping, ensuring the fit and fabric meet the highest
                sartorial standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= IMAGE GRID ================= */}
      <section className="px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-[600px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000"
            className="w-full h-full object-cover grayscale brightness-95"
            alt="Fabric texture"
          />
        </div>
        <div className="h-[600px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&q=80&w=1000"
            className="w-full h-full object-cover grayscale brightness-90"
            alt="Man in suit"
          />
        </div>
      </section>

      {/* ================= VALUE PROPS ================= */}
      <section className="py-32 px-8 md:px-24">
        <div className="flex flex-col md:flex-row justify-between gap-12 border-b border-[#DEB887]/30 pb-20">
          <ValueItem
            number="01"
            title="Pure Sourcing"
            desc="Only natural, biodegradable fibers from certified European mills."
          />
          <ValueItem
            number="02"
            title="Master Tailoring"
            desc="Every garment is finished by hand in our local workshop."
          />
          <ValueItem
            number="03"
            title="Enduring Style"
            desc="Designs created to remain relevant across decades, not seasons."
          />
        </div>
      </section>

      {/* ================= MINIMAL CTA ================= */}
      <section className="py-40 text-center px-8">
        <span className="font-mono text-xs uppercase tracking-[0.3em] mb-8 block opacity-50">
          Continue the journey
        </span>
        <button className="group font-sans text-4xl md:text-6xl font-semibold uppercase tracking-tighter flex items-center justify-center mx-auto gap-4">
          View Collection
          <ChevronRight
            size={60}
            className="text-[#DEB887] group-hover:translate-x-4 transition-transform duration-500"
          />
        </button>
      </section>
    </div>
  );
}

function ValueItem({ number, title, desc }) {
  return (
    <div className="max-w-xs">
      <span className="font-mono text-sm text-[#DEB887] mb-4 block font-semibold">
        {number} /
      </span>
      <h3 className="font-sans text-2xl font-semibold uppercase mb-4">
        {title}
      </h3>
      <p className="font-sans text-lg text-gray-500 font-light leading-snug">
        {desc}
      </p>
    </div>
  );
}
