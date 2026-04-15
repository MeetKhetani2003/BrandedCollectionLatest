"use client";

import Link from "next/link";
import Image from "next/image";
import { redirect, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { CgClose, CgMenu } from "react-icons/cg";
import { FiSearch, FiUser } from "react-icons/fi";
import { Heart, ShoppingCart, User } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import WishlistModal from "./WishlistModal";
import CartModal from "./CartModal";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

/* -------------------------
   COLOR PALETTE (DO NOT TOUCH UI)
------------------------- */
const PALETTE = {
  BG_LIGHT: "bg-[#FAF0E6]",
  BORDER_ACCENT: "border-[#DEB887]",
  TEXT_PRIMARY: "text-[#654321]",
  HOVER_ACCENT: "hover:text-[#654321]",
  ACCENT_BG: "bg-[#654321]",
  OVERLAY: "bg-[#4E342E]",
};

/* -------------------------
   NAV LINKS (Edit URLs only)
------------------------- */
const navLinks = [
  { name: "Clothes", href: "/products?mainCategory=clothes" },
  { name: "Accessories", href: "/products?mainCategory=accessories" },
  { name: "Shoes", href: "/products?mainCategory=shoes" },
  // { name: "New Arrivals", href: "/products?newArrival=true" },
  // { name: "Best Sellers", href: "/products?bestSeller=true" },
  // { name: "About Us", href: "/about-us" },
  // { name: "Contact Us", href: "/contact-us" },
];

const placeholderImage = "/assets/placeholder.jpg";

/* ===================================================================
   NavBar Component - SIMPLIFIED SIDEBAR (no mega menus, no sublinks)
=================================================================== */
const NavBar = () => {
  const pathname = usePathname();
  const isActive = (href) => pathname === href;
  const hasShownLoginToast = useRef(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const headerRef = useRef(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ REMOVED: openMegaMenu, megaMaxHeight, computeMegaMaxHeight, toggleMegaMenu

  const { user, loading, initialized, getUser } = useUserStore();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const wishlistCount = useAppStore((s) => s.wishlist.length);
  const cartCount = useCartStore((s) => s.cartCount());
  const router = useRouter();
  const logout = useUserStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    setIsSidebarOpen(false);
    document.body.style.overflow = "auto";
    toast.success("Logged out successfully");
    router.push("/");
  };

  useEffect(() => {
    getUser();
    fetchCart();
  }, [getUser, fetchCart]);

  useEffect(() => {
    if (initialized && user && !hasShownLoginToast.current) {
      toast.success(
        `Welcome back, ${
          user.firstName && user.lastName
            ? user.firstName + " " + user.lastName
            : user.username
        }! 🎉`,
      );
      hasShownLoginToast.current = true;
    }
  }, [initialized, user]);

  // Search debounce effect
  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setNavLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setResults(data.products || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setNavLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleSidebar = () => {
    const s = !isSidebarOpen;
    setIsSidebarOpen(s);
    document.body.style.overflow = s ? "hidden" : "auto";
  };

  // ✅ SIMPLIFIED: No mega menu toggle, just close sidebar on link click
  const handleLinkClick = () => {
    setIsSidebarOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  /* -------------------------------------------------------------------
     ✅ SIMPLIFIED SidebarContent: Just renders direct links, NO sublinks
  ------------------------------------------------------------------- */
  const SidebarContent = ({ link }) => {
    return (
      <Link
        href={link.href}
        onClick={handleLinkClick}
        className={`block py-4 px-4 font-bold text-lg ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT} border-b ${PALETTE.BORDER_ACCENT}`}
      >
        {link.name}
      </Link>
    );
  };

  /* -------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------- */
  return (
    <header
      ref={headerRef}
      className={`sticky top-0 w-full z-50 ${PALETTE.BG_LIGHT} shadow-md`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center space-x-6">
          <button
            className={`${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT}`}
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? (
              <CgClose className="w-6 h-6" />
            ) : (
              <CgMenu className="w-6 h-6" />
            )}
          </button>

          <ul
            className={`hidden lg:flex space-x-6 text-sm font-semibold uppercase ${PALETTE.TEXT_PRIMARY} h-full`}
          >
            {navLinks.map((link) => (
              <li key={link.name} className="relative group">
                <Link
                  href={link.href}
                  className={`relative py-1 transition-colors ${
                    PALETTE.HOVER_ACCENT
                  } ${
                    isActive(link.href) ? PALETTE.TEXT_PRIMARY : "text-gray-700"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute left-0 -bottom-1 h-0.5 ${
                      PALETTE.ACCENT_BG
                    } transition-all duration-300 ${
                      isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CENTER LOGO */}
        <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
          <Image
            src="/assets/logo.png"
            alt="Brand Logo"
            width={60}
            height={60}
          />
        </Link>

        {/* RIGHT */}
        <div className="flex items-center space-x-4">
          {/* Desktop Search */}
          <div className="hidden sm:block">
            <div className="relative hidden sm:block">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => results.length && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Search products..."
                className={`w-48 lg:w-64 xl:w-80 h-10 border ${PALETTE.BORDER_ACCENT}
      rounded-full pl-4 pr-10 text-sm ${PALETTE.BG_LIGHT}`}
              />
              <FiSearch className="absolute right-3 top-2.5 text-gray-600" />

              {/* Search Dropdown */}
              {open && (
                <div className="absolute top-12 left-0 w-full z-50">
                  <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100">
                    {navLoading && (
                      <div className="px-6 py-4 text-sm text-gray-500">
                        Searching products…
                      </div>
                    )}
                    {!navLoading && results.length === 0 && (
                      <div className="px-6 py-6 text-sm text-gray-500 text-center">
                        No products found
                      </div>
                    )}
                    {!navLoading &&
                      results.map((p) => (
                        <Link
                          key={p._id}
                          href={`/products/${p.slug}`}
                          onClick={() => {
                            setSearch("");
                            setOpen(false);
                          }}
                          className="group flex items-center gap-1 px-5 py-1 transition-all hover:bg-[#faf7f4]"
                        >
                          <div className="w-14 h-14 rounded-xl bg-[#f5f1ec] overflow-hidden flex-shrink-0">
                            <Image
                              src={
                                p.imageFrontPath || "/assets/placeholder.jpg"
                              }
                              alt={p.name}
                              width={56}
                              height={56}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {p.category}{" "}
                              {p.subcategory && `• ${p.subcategory}`}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-[#654321]">
                            ₹{p.price?.current}
                          </div>
                        </Link>
                      ))}
                    {!navLoading && results.length > 0 && (
                      <div className="px-6 py-3 text-xs text-gray-500 bg-[#faf7f4]">
                        Press Enter to view all results
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Overlay */}
          {isMobileSearchOpen && (
            <div className="fixed inset-0 bg-[#FAF0E6] z-[70] flex flex-col animate-in slide-in-from-top duration-300">
              <div className="flex items-center px-4 py-4 border-b border-[#DEB887]">
                <form onSubmit={handleSearch} className="flex-1 relative">
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-12 border border-[#DEB887] rounded-full pl-4 pr-12 text-sm bg-[#FAF0E6] outline-none"
                  />
                  <button type="submit" className="absolute right-4 top-3.5">
                    <FiSearch className="w-5 h-5 text-gray-600" />
                  </button>
                </form>
                <button
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setResults([]);
                  }}
                  className="ml-4 text-[#654321] font-bold"
                >
                  Cancel
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-white">
                {navLoading && (
                  <div className="px-6 py-4 text-sm text-gray-500">
                    Searching products...
                  </div>
                )}
                {!navLoading && search.length >= 2 && results.length === 0 && (
                  <div className="px-6 py-10 text-center">
                    <p className="text-gray-500">
                      No products found for "{search}"
                    </p>
                  </div>
                )}
                {!navLoading &&
                  results.map((p) => (
                    <Link
                      key={p._id}
                      href={`/products/${p.slug}`}
                      onClick={() => {
                        setSearch("");
                        setResults([]);
                        setIsMobileSearchOpen(false);
                      }}
                      className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 hover:bg-gray-50"
                    >
                      <div className="w-16 h-16 rounded-lg bg-[#f5f1ec] overflow-hidden flex-shrink-0">
                        <Image
                          src={p.imageFrontPath || "/assets/placeholder.jpg"}
                          alt={p.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {p.category} {p.subcategory && `• ${p.subcategory}`}
                        </p>
                        <p className="text-sm font-bold text-[#654321] mt-1">
                          ₹{p.price?.current}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* User / Auth */}
          {!initialized || loading ? (
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
          ) : user ? (
            <Link
              href="/profile"
              className="flex items-center text-[#654321] z-40 gap-2"
            >
              <User className="w-6 h-6 text-[#fff] border rounded-full border-[#fff] bg-[#654321]" />
            </Link>
          ) : (
            <Link
              href="/auth"
              onClick={handleLinkClick}
              className="flex flex-col items-center"
            >
              <User className="w-6 h-6 text-[#654321] border rounded-full border-[#654321]" />
            </Link>
          )}

          {/* Wishlist */}
          <button onClick={() => redirect("/whishlist")} className="relative">
            <Heart className="w-6 h-6 text-[#654321]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 text-xs bg-[#654321] text-white rounded-full px-1">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button onClick={() => redirect("/cart")} className="relative">
            <ShoppingCart className="w-6 h-6 text-[#654321]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 text-xs bg-[#654321] text-white rounded-full px-1">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Search Trigger */}
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className={`sm:hidden ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT}`}
            aria-label="Search"
          >
            <FiSearch className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`fixed inset-0 ${PALETTE.OVERLAY} transition-opacity z-40 ${
          isSidebarOpen ? "opacity-40" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* ✅ SIMPLIFIED SIDEBAR PANEL - No mega menus, just direct links */}
      <div
        className={`fixed top-0 left-0 w-80 sm:w-96 h-full ${
          PALETTE.BG_LIGHT
        } shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`${PALETTE.ACCENT_BG} text-white p-4`}>
          {!initialized || loading ? (
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
          ) : user ? (
            <Link
              href="/profile"
              className="hidden md:flex items-center gap-2 text-white max-w-[180px]"
            >
              <User className="w-6 h-6 shrink-0" />
              {user.firstName && user.lastName ? (
                <span>{user.firstName + " " + user.lastName}</span>
              ) : (
                <span>{user.username}</span>
              )}
            </Link>
          ) : (
            <Link
              href="/auth"
              onClick={handleLinkClick}
              className="flex flex-col items-center text-white"
            >
              <User className="w-6 h-6" />
              <span className="text-xs">Signup / Login</span>
            </Link>
          )}
        </div>

        {/* ✅ Simple category links only - NO sublinks, NO mega menus */}
        <div className="py-2">
          {navLinks.map((link) => (
            <SidebarContent key={link.name} link={link} />
          ))}
          <Link
            href="/contact-us"
            onClick={handleLinkClick}
            className={`block py-4 px-4 font-bold text-lg ${PALETTE.TEXT_PRIMARY} border-b ${PALETTE.BORDER_ACCENT}`}
          >
            Contact Us
          </Link>
        </div>

        {user && (
          <div className="mt-6 px-4">
            <button
              onClick={handleLogout}
              className="w-full py-3 text-sm font-semibold text-[#654321] border border-[#DEB887] rounded-lg hover:bg-[#654321] hover:text-white transition-all duration-300"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {wishlistOpen && <WishlistModal close={() => setWishlistOpen(false)} />}
      {cartOpen && <CartModal close={() => setCartOpen(false)} />}
    </header>
  );
};

export default NavBar;
