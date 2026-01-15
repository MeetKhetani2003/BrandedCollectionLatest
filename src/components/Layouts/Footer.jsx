"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// You can import these from the navbar file instead if you want to keep
// them in a single place.
const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products", mega: true },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const megaMenuData = [
  {
    title: "Shirts",
    sub: ["Casual Shirts", "Formal Shirts", "Denim Shirts", "Partywear Shirts"],
  },
  {
    title: "T-Shirts",
    sub: ["Oversized", "Graphics", "Plain", "Henley"],
  },
  {
    title: "Jeans",
    sub: ["Slim Fit", "Straight Fit", "Baggy", "Ripped Denim"],
  },
];

const Footer = () => {
  const footerRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // Scroll reveal for columns
      gsap.from(".footer-column", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 80%", // when footer top hits 80% viewport
        },
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
      });

      // Subtle floating / liquid feel on the wave
      if (waveRef.current) {
        gsap.to(waveRef.current, {
          y: 10,
          duration: 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative mt-16 text-[#2f1b0d]">
      {/* Liquid / wave top border */}
      {/* <div className="w-full overflow-hidden">
        <svg
          ref={waveRef}
          className="w-full h-10 md:h-14"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#FAF0E6"
            d="M0,160L80,165.3C160,171,320,181,480,186.7C640,192,800,192,960,181.3C1120,171,1280,149,1360,138.7L1440,128L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          />
        </svg>
      </div> */}

      {/* Main footer body */}
      <div className="bg-[#FAF0E6] border-t border-[#DEB887]/70">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="footer-column flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 overflow-hidden flex items-center justify-center ">
                <Image
                  src="/assets/logo.png"
                  alt="Branded Collection Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-semibold text-lg tracking-wide">
                  Branded Collection
                </p>
                <p className="text-xs text-gray-600">
                  Premium fits, everyday comfort.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed max-w-xs">
              Discover shirts, tees and denim that actually feel as good as they
              look. Crafted for all-day wear, from office hours to late nights.
            </p>

            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Follow us
              </span>
              <div className="flex gap-3 text-[#654321]">
                {/* Simple social icons using circles */}
                <button className="w-8 h-8 rounded-full border border-[#DEB887] flex items-center justify-center text-xs hover:bg-[#654321] hover:text-[#FAF0E6] transition">
                  in
                </button>
                <button className="w-8 h-8 rounded-full border border-[#DEB887] flex items-center justify-center text-xs hover:bg-[#654321] hover:text-[#FAF0E6] transition">
                  f
                </button>
                <button className="w-8 h-8 rounded-full border border-[#DEB887] flex items-center justify-center text-xs hover:bg-[#654321] hover:text-[#FAF0E6] transition">
                  ig
                </button>
              </div>
            </div>
          </div>

          {/* Main links (from navbar) */}
          <div className="footer-column">
            <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-3">
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-800 hover:text-[#654321] relative inline-block group"
                  >
                    <span>{link.name}</span>
                    <span className="block h-[2px] w-0 bg-[#654321] rounded-full group-hover:w-full transition-all duration-300 origin-left"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories (from mega menu) */}
          <div className="footer-column">
            <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-3">
              Categories
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {megaMenuData.map((cat) => (
                <div key={cat.title}>
                  <p className="font-semibold text-[#654321] mb-1">
                    {cat.title}
                  </p>
                  <ul className="space-y-1">
                    {cat.sub.map((s) => (
                      <li key={s}>
                        <Link
                          href={`/products/${cat.title
                            .toLowerCase()
                            .replace(/ /g, "-")}/${s
                            .toLowerCase()
                            .replace(/ /g, "-")}`}
                          className="text-gray-700 hover:text-[#654321] text-xs"
                        >
                          {s}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer-column">
            <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-3">
              Stay in the loop
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Get early access to drops, exclusive offers and style tips.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-3 max-w-sm"
            >
              <div className="flex items-center rounded-full bg-white border border-[#DEB887]/70 px-3 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#654321] text-[#FAF0E6] hover:bg-[#4f3418] transition"
                >
                  Join
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                By joining, you agree to receive emails from Branded Collection.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#DEB887]/60">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>
              © {new Date().getFullYear()} Branded Collection. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <button className="hover:text-[#654321]">Privacy Policy</button>
              <button className="hover:text-[#654321]">Terms</button>
              <button className="hover:text-[#654321]">
                Returns & Refunds
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
