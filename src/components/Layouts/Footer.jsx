"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-column", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: "power3.out",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="mt-20 text-[#2f1b0d]">
      <div className="bg-[#FAF0E6] border-t border-[#DEB887]/60">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* BRAND */}
          <div className="footer-column space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logo.png"
                alt="Branded Collection Logo"
                width={45}
                height={45}
              />

              <div>
                <p className="font-semibold text-lg">Branded Collection</p>
                <p className="text-xs text-gray-600">
                  Premium fits, everyday comfort
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              Discover shirts, tees and denim crafted for comfort and style —
              perfect for work, travel and everyday life.
            </p>

            <div className="flex gap-3 pt-2">
              <div className="w-8 h-8 flex items-center justify-center border border-[#DEB887] rounded-full hover:bg-[#654321] hover:text-white transition cursor-pointer">
                f
              </div>
              <div className="w-8 h-8 flex items-center justify-center border border-[#DEB887] rounded-full hover:bg-[#654321] hover:text-white transition cursor-pointer">
                ig
              </div>
              <div className="w-8 h-8 flex items-center justify-center border border-[#DEB887] rounded-full hover:bg-[#654321] hover:text-white transition cursor-pointer">
                in
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="footer-column">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-4">
              Navigation
            </h3>

            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-700 hover:text-[#654321] transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CATEGORIES */}
          <div className="footer-column">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-4">
              Categories
            </h3>

            <div className="grid grid-cols-3 gap-6">
              {megaMenuData.map((cat) => (
                <div key={cat.title}>
                  <p className="text-sm font-semibold text-[#654321]">
                    {cat.title}
                  </p>

                  <ul className="space-y-1 mt-1">
                    {cat.sub.map((s) => (
                      <li key={s}>
                        <Link
                          href="#"
                          className="text-xs text-gray-700 hover:text-[#654321]"
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
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-[#DEB887]/50">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-2">
            <p>
              © {new Date().getFullYear()} Branded Collection. All rights
              reserved.
            </p>

            <p className="text-gray-500">Designed & Developed with ❤️</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
