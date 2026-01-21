"use client";

import React from "react";
import { motion } from "framer-motion";

const PALETTE = {
  BG: "bg-[#FAF0E6]",
  TEXT: "text-[#654321]",
  ACCENT: "text-[#DEB887]",
};

export default function AboutPage() {
  return (
    <div
      className={`${PALETTE.BG} ${PALETTE.TEXT} selection:bg-[#DEB887]/20 min-h-screen font-sans antialiased uppercase`}
    >
      {/* ================= 01. THE HEADER / HERO ================= */}
      <section className="px-6 md:px-12 pt-32 pb-16 border-b border-[#654321]/10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <h1 className="text-[14vw] leading-[0.75] font-semibold tracking-tighter">
            EST.
            <br />
            2020
          </h1>
          <div className="max-w-xs text-right">
            <span className="font-mono text-[10px] tracking-[0.3em] font-semibold text-[#DEB887]">
              // DIRECTIVE_V.04
            </span>
            <p className="mt-4 text-sm leading-relaxed font-light tracking-tight">
              A study in textile permanence and anatomical silhouette.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 02. ASYMMETRIC STORY ================= */}
      <section className="py-24 px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-y-16">
        <div className="md:col-span-7">
          <img
            src="https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=1200"
            alt="Textile detail"
            className="w-full aspect-[4/5] object-cover grayscale opacity-90"
          />
        </div>

        <div className="md:col-span-5 md:pl-16 flex flex-col justify-center">
          <span className="font-mono text-xs mb-6 text-[#DEB887] font-semibold tracking-widest">
            01_Origin
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tighter mb-8">
            The material <br /> governs the form.
          </h2>
          <p className="text-lg md:text-xl font-light leading-relaxed text-[#654321]/80 normal-case">
            We don't design for the moment. We design for the decade. Our
            textiles are curated from heritage mills in Osaka and Biella, chosen
            for their ability to age with the wearer.
          </p>
        </div>
      </section>

      {/* ================= 03. WIDE TEXT FOCUS ================= */}
      <section className="py-32 bg-white">
        <div className="px-6 md:px-12">
          <h3 className="text-[6vw] leading-none font-semibold tracking-tighter text-center italic">
            "SILENCE IS THE ULTIMATE LOUDNESS"
          </h3>
        </div>
      </section>

      {/* ================= 04. THE SPECS (CLEAN GRID) ================= */}
      <section className="py-32 px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
          <div className="pt-12 border-t border-[#654321]">
            <h4 className="font-mono text-xs font-semibold mb-6 tracking-widest text-[#DEB887]">
              INFRASTRUCTURE
            </h4>
            <p className="text-xl font-light leading-snug">
              Every seam is reinforced. Every button is horn. Built for the
              rigors of reality.
            </p>
          </div>
          <div className="pt-12 border-t border-[#654321]">
            <h4 className="font-mono text-xs font-semibold mb-6 tracking-widest text-[#DEB887]">
              ETHICAL_CODE
            </h4>
            <p className="text-xl font-light leading-snug">
              Radical transparency. We know every hand that touches our fabric.
            </p>
          </div>
          <div className="pt-12 border-t border-[#654321]">
            <h4 className="font-mono text-xs font-semibold mb-6 tracking-widest text-[#DEB887]">
              GEOGRAPHY
            </h4>
            <p className="text-xl font-light leading-snug">
              Designed in Mumbai. Distributed globally. Transit with zero-carbon
              intent.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 05. MINIMAL CTA ================= */}
      <section className="py-48 px-6 text-center border-t border-[#654321]/10">
        <a href="/collection" className="group inline-block">
          <p className="text-sm font-mono tracking-[0.5em] mb-4 opacity-50 font-semibold text-[#DEB887]">
            Final Action
          </p>
          <div className="overflow-hidden relative">
            <h2 className="text-6xl md:text-9xl font-semibold tracking-tighter transition-transform duration-500 group-hover:-translate-y-full">
              ENTER_SHOP
            </h2>
            <h2 className="text-6xl md:text-9xl font-semibold tracking-tighter absolute top-full left-0 transition-transform duration-500 group-hover:-translate-y-full text-[#DEB887]">
              ENTER_SHOP
            </h2>
          </div>
        </a>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-4 opacity-40">
        <span className="font-mono text-[10px] tracking-widest font-semibold">
          THE_ATELIER // COPYRIGHT_2026
        </span>
        <div className="flex gap-8 font-mono text-[10px] tracking-widest font-semibold">
          <a href="#" className="hover:text-[#DEB887]">
            INSTAGRAM
          </a>
          <a href="#" className="hover:text-[#DEB887]">
            MANIFESTO
          </a>
        </div>
      </footer>
    </div>
  );
}
