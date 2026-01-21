"use client";

import Link from "next/link";
import Image from "next/image";
import { redirect, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { CgClose, CgMenu } from "react-icons/cg";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { FiSearch, FiUser, FiLogIn } from "react-icons/fi";
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
  { name: "Clothes", href: "/products?mainCategory=clothes", mega: true },
  {
    name: "Accessories",
    href: "/products?mainCategory=accessories",
    mega: true,
  },
  { name: "Shoes", href: "/products?mainCategory=shoes", mega: true },

  // { name: "New Arrivals", href: "/products?newArrival=true" },
  // { name: "Best Sellers", href: "/products?bestSeller=true" },

  // { name: "About Us", href: "/about-us" },
  // { name: "Contact Us", href: "/contact-us" },
];

/* -------------------------
   MEGA MENU DATA (safe to edit titles)
------------------------- */
const sidebarMegaData = {
  Clothes: [
    {
      title: "Shirts",
      subs: [
        { label: "Half Sleeve", image: "/assets/halfsleve.webp" },
        { label: "Full Sleeve", image: "/assets/halfsleve.webp" },
        { label: "Linen", image: "/assets/halfsleve.webp" },
        { label: "Embroidered", image: "/assets/halfsleve.webp" },
        { label: "Designer", image: "/assets/halfsleve.webp" },
        { label: "Office Wear", image: "/assets/halfsleve.webp" },
        { label: "Check", image: "/assets/halfsleve.webp" },
        { label: "Plain", image: "/assets/halfsleve.webp" },
        { label: "Imported", image: "/assets/halfsleve.webp" },
        { label: "Denim", image: "/assets/halfsleve.webp" },
      ],
    },
    {
      title: "T-Shirts",
      subs: [
        { label: "Polo T-Shirts", image: "/assets/halfsleve.webp" },
        { label: "Round Neck T-Shirts", image: "/assets/halfsleve.webp" },
        { label: "Full Sleeve T-Shirts", image: "/assets/halfsleve.webp" },
        { label: "Dry Fit T-Shirts", image: "/assets/halfsleve.webp" },
      ],
    },
  ],

  Footwear: [
    {
      title: "Shoes",
      subs: [
        { label: "Sports Shoes", image: "/assets/halfsleve.webp" },
        { label: "Sneakers", image: "/assets/halfsleve.webp" },
      ],
    },
    {
      title: "Slippers",
      subs: [
        { label: "Flip Flops", image: "/assets/halfsleve.webp" },
        { label: "Strap Slippers", image: "/assets/halfsleve.webp" },
      ],
    },
  ],

  Accessories: [
    {
      title: "Perfume / Deo",
      subs: [
        { label: "Replica", image: "/assets/halfsleve.webp" },
        { label: "Indian Made", image: "/assets/halfsleve.webp" },
        { label: "Premium Collection", image: "/assets/halfsleve.webp" },
      ],
    },
  ],
};

const placeholderImage = "/assets/placeholder.jpg";

/* ===================================================================
   NavBar Component (drop-in replacement)
   - computes inline maxHeight for open mega menu
   - makes mega body scrollable with overscroll containment
=================================================================== */
const NavBar = () => {
  const pathname = usePathname();
  const isActive = (href) => pathname === href;
  const hasShownLoginToast = useRef(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [navLoading, setNavLoading] = useState(false);

  const headerRef = useRef(null); // used to compute available space
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState("Clothes");

  const [megaMaxHeight, setMegaMaxHeight] = useState(0);

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
  // console.log(user);
  function toSlug(label) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  // console.log(user);

  // compute available height for mega menu body
  const computeMegaMaxHeight = (menuOpenName) => {
    // If no menu open, we don't care
    if (!menuOpenName) {
      setMegaMaxHeight(0);
      return;
    }

    // headerRef may be null on first render; fallback to 160px header height
    const headerEl = headerRef.current;
    let headerBottom = 160; // fallback
    if (headerEl) {
      const rect = headerEl.getBoundingClientRect();
      headerBottom = rect.bottom; // distance from top of viewport to bottom of header
    }

    const buffer = 16; // small gap from bottom
    const available = Math.max(window.innerHeight - headerBottom - buffer, 160); // at least 160px
    setMegaMaxHeight(available);
  };

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

  // recompute when window resizes, orientation change, or openMegaMenu changes
  useEffect(() => {
    computeMegaMaxHeight(openMegaMenu);

    const onResize = () => computeMegaMaxHeight(openMegaMenu);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [openMegaMenu]);
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
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [search]);

  const toggleSidebar = () => {
    const s = !isSidebarOpen;
    setIsSidebarOpen(s);
    document.body.style.overflow = s ? "hidden" : "auto";
  };

  const toggleMegaMenu = (menu) => {
    const newName = openMegaMenu === menu ? null : menu;
    setOpenMegaMenu(newName);
    // compute immediately (helps on fast opens)
    setTimeout(() => computeMegaMaxHeight(newName), 30);
  };

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
    document.body.style.overflow = "auto";
  };
  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/products?search=${encodeURIComponent(search.trim())}`);

    setSearch(""); // optional: clear input
  };

  /* -------------------------------------------------------------------
     SidebarContent: renders mega menus exactly like your old UI
     - when open: the .megaBody uses inline style maxHeight in px and
       overflowY: "auto" with overscrollBehavior 'contain' so it scrolls
       inside the panel and does not propagate scroll to body.
  ------------------------------------------------------------------- */
  const SidebarContent = ({ link }) => {
    const isMega = link.mega;
    const isOpen = openMegaMenu === link.name;
    const data = sidebarMegaData[link.name];

    if (isMega) {
      return (
        <div key={link.name} className={`border-b ${PALETTE.BORDER_ACCENT}`}>
          <button
            onClick={() => toggleMegaMenu(link.name)}
            className={`w-full text-left  px-4 font-bold flex justify-between pt-3 items-center text-lg ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT}`}
          >
            {link.name}
            <span className="text-xl text-gray-700">
              {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
            </span>
          </button>

          {/* MEGA BODY */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            // we toggle the visual open/close via opacity + inline maxHeight on inner container
          >
            {/* inner wrapper that becomes scrollable with a computed maxHeight */}
            <div
              className="p-2 "
              style={{
                maxHeight: isOpen ? `${megaMaxHeight}px` : 0,
                overflowY: "hidden",

                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                transition: "max-height 300ms ease",
              }}
            >
              {/* FEATURED COLLECTIONS (keeps same UI) */}
              {/* <h3
                className={`text-xs font-semibold uppercase ${PALETTE.TEXT_PRIMARY} mb-2`}
              >
                FEATURED COLLECTIONS
              </h3> */}

              {/* <div className="grid grid-cols-4 gap-2">
                {["SALE", "Topwear", "Bottomwear", "Sneakers"].map(
                  (title, i) => {
                    const href = `/products?mainCategory=${link.name.toLowerCase()}&category=${title
                      .toLowerCase()
                      .replace(/ /g, "-")}`;
                    return (
                      <Link
                        key={i}
                        href={href}
                        onClick={handleLinkClick}
                        className="flex flex-col items-center text-center text-xs font-medium"
                      >
                        <div className="w-full aspect-square overflow-hidden rounded-full border border-gray-100 mb-1">
                          <Image
                            src={placeholderImage}
                            alt={title}
                            width={60}
                            height={60}
                            className="object-cover"
                          />
                        </div>
                        {title}
                      </Link>
                    );
                  }
                )}
              </div> */}

              {/* TOP CATEGORIES */}
              <h3
                className={`text-xs font-semibold uppercase ${PALETTE.TEXT_PRIMARY} pt-2 ml-2 mb-2`}
              >
                Top Categories
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {data
                  ?.flatMap((d) => d.subs)
                  .slice(0, 8)
                  .map((sub, i) => {
                    const label = typeof sub === "string" ? sub : sub.label;

                    const href = `/products?mainCategory=${link.name.toLowerCase()}&category=${encodeURIComponent(
                      label,
                    )}`;

                    return (
                      <Link
                        key={i}
                        href={href}
                        onClick={handleLinkClick}
                        className="flex flex-col items-center text-center text-xs font-medium"
                      >
                        <div className="w-full aspect-square overflow-hidden rounded-lg border border-gray-100 mb-1">
                          <Image
                            src={sub.image || placeholderImage}
                            alt={sub.label}
                            width={60}
                            height={60}
                          />
                        </div>
                        {sub.label}
                      </Link>
                    );
                  })}
              </div>

              {/* DETAILED CATEGORY LIST */}
              {/* data?.map((cat, i) => (
                <div key={i} className="pt-2">
                  <h4
                    className={`text-sm font-bold ${PALETTE.TEXT_PRIMARY} mb-2`}
                  >
                    {cat.title}
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700 pl-2">
                    {cat.subs.map((s, si) => {
                      const label = typeof s === "string" ? s : s.label;

                      const href = `/products?mainCategory=${link.name.toLowerCase()}&category=${encodeURIComponent(
                        cat.title
                      )}&subcategory=${encodeURIComponent(label)}`;

                      return (
                        <li key={si}>
                          <Link href={href}>{label}</Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))} */}
            </div>
          </div>
        </div>
      );
    }

    // non-mega link
    return (
      <Link
        key={link.name}
        href={link.href}
        onClick={handleLinkClick}
        className={`block py-4 px-4 font-bold text-lg ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT} border-b ${PALETTE.BORDER_ACCENT}`}
      >
        {link.name}
      </Link>
    );
  };

  /* -------------------------------------------------------------------
     RENDER - keep exact UI structure
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
            {navLinks
              .filter((l) => !l.mega)
              .map((link) => (
                <li key={link.name} className="relative group">
                  <Link
                    href={link.href}
                    className={`relative py-1 transition-colors ${
                      PALETTE.HOVER_ACCENT
                    } ${
                      isActive(link.href)
                        ? PALETTE.TEXT_PRIMARY
                        : "text-gray-700"
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute left-0 -bottom-1 h-0.5 ${
                        PALETTE.ACCENT_BG
                      } transition-all duration-300 ${
                        isActive(link.href)
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                </li>
              ))}

            {/* mega parents shown as links */}
            {navLinks
              .filter((l) => l.mega)
              .map((link) => (
                <li key={link.name} className="relative group">
                  <Link
                    href={`/products?mainCategory=${link.name.toLowerCase()}`}
                    className={`relative py-1 font-semibold transition-colors ${PALETTE.HOVER_ACCENT} text-gray-700`}
                  >
                    {link.name}
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

              {/* 🔽 SEARCH DROPDOWN */}
              {open && (
                <div className="absolute top-12 left-0 w-full z-50">
                  <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100">
                    {/* LOADING */}
                    {navLoading && (
                      <div className="px-6 py-4 text-sm text-gray-500">
                        Searching products…
                      </div>
                    )}

                    {/* EMPTY */}
                    {!navLoading && results.length === 0 && (
                      <div className="px-6 py-6 text-sm text-gray-500 text-center">
                        No products found
                      </div>
                    )}

                    {/* RESULTS */}
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
                          {/* IMAGE */}
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

                          {/* TEXT */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {p.name}
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              {p.category}{" "}
                              {p.subcategory && `• ${p.subcategory}`}
                            </p>
                          </div>

                          {/* PRICE */}
                          <div className="text-sm font-semibold text-[#654321]">
                            ₹{p.price?.current}
                          </div>
                        </Link>
                      ))}

                    {/* FOOTER */}
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

          {!initialized || loading ? (
            // skeleton / placeholder
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
          ) : user ? (
            <Link
              href="/profile"
              className="flex items-center text-[#654321] z-40 gap-2"
            >
              <User className="w-6 h-6 text-[#fff] border rounded-full border-[#fff] bg-[#654321] " />
              {/* {user.firstName && user.lastName ? (
                <span>{user.firstName + " " + user.lastName}</span>
              ) : (
                <span>{user.username}</span>
              )} */}
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

          <button onClick={() => redirect("/whishlist")} className="relative">
            <Heart className="w-6 h-6 text-[#654321]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 text-xs bg-[#654321] text-white rounded-full px-1">
                {wishlistCount}
              </span>
            )}
          </button>

          <button onClick={() => redirect("/cart")} className="relative">
            <ShoppingCart className="w-6 h-6 text-[#654321]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 text-xs bg-[#654321] text-white rounded-full px-1">
                {cartCount}
              </span>
            )}
          </button>

          <button
            className={`sm:hidden ${PALETTE.TEXT_PRIMARY} ${PALETTE.HOVER_ACCENT}`}
            aria-label="Search"
          >
            <FiSearch className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* OVERLAY */}
      <div
        className={`fixed inset-0 ${PALETTE.OVERLAY} transition-opacity z-40 ${
          isSidebarOpen ? "opacity-40" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* SIDEBAR PANEL */}
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

          {/* <p className="text-sm font-medium text-center">
            Shop the exclusive Men's Collection
            <span className="ml-1 text-yellow-300">🔥</span>
          </p> */}
        </div>

        <div className="py-2">
          {navLinks.map((l) => (
            <SidebarContent key={l.name} link={l} />
          ))}
          <Link
            href="/about-us"
            onClick={handleLinkClick}
            className={`block py-4 px-4 font-bold text-lg ${PALETTE.TEXT_PRIMARY} border-b ${PALETTE.BORDER_ACCENT}`}
          >
            About Us
          </Link>

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
