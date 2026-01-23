"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "@/components/Layouts/ProductCard";
import toast from "react-hot-toast";
import HeroSection from "@/components/products/HeroSection";

/* --------------------------------- */
/* -------- CONSTANTS & MAPS -------- */
/* --------------------------------- */

const CATEGORY_MAP = {
  clothes: {
    Shirts: [
      "Half Sleeve",
      "Full Sleeve",
      "Linen",
      "Embroidered",
      "Designer",
      "Office Wear",
      "Check",
      "Plain",
      "Imported",
      "Denim",
    ],
    "Polo T-Shirts": [],
    "Round Neck T-Shirts": ["Crew Neck", "Drop Shoulder", "Oversized"],
    "Winter Wear": ["Jackets", "Sweaters", "Sweatshirts"],
    Denim: [
      "Ankle Fit",
      'Straight Fit (14")',
      "Comfort Narrow",
      'Regular Fit (16", 18")',
      "Baggy Fit",
    ],
    "Cotton / Chinos": ["Ankle Fit", "Comfort Fit"],
    "Formal Pants": ["Ankle Fit", "Straight Fit", "Comfort Fit"],
    "Track Pants": [
      "Dry Fit Fabric",
      "Cotton Fleece Fabric",
      "Ankle Fit",
      "Straight Fit",
    ],
    "Dry Fit T-Shirts": ["Round Neck", "Collar Free"],
  },
  shoes: {
    Shoes: ["Sports Shoes", "Sneakers"],
    Slippers: ["Flip Flops", "Strap Slippers"],
    Crocs: ["Men", "Women"],
  },
  accessories: {
    "Perfume / Deo": ["Replica", "Indian Made", "Premium Collection"],
    Deodorants: ["Gas Deo", "Water Deo"],
    Watches: ["Analog", "Battery", "Automatic"],
    Googles: ["Men's Googles", "Women's Googles"],
    Wallets: ["Wallets", "Purses"],
    Belts: ["Men's Belts", "Women's Belts"],
    Caps: ["Caps", "Hats"],
  },
};

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const PAGE_SIZE = 12;

const slides = [
  { type: "image", url: "/assets/CarouselAssets/banner1.avif" },
  { type: "video", url: "/assets/CarouselAssets/video1.mp4" },
  { type: "image", url: "/assets/CarouselAssets/banner2.avif" },
];

export default function ProductsPageClient() {
  const searchParams = useSearchParams();

  /* ---------- STATE ---------- */
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Toggles for "See More" expansion
  const [showAllCats, setShowAllCats] = useState(false);
  const [showAllSubs, setShowAllSubs] = useState(false);

  const rawMainCategory = searchParams.get("mainCategory") || "";
  const urlMainCategory = ["clothes", "shoes", "accessories"].includes(
    rawMainCategory.toLowerCase(),
  )
    ? rawMainCategory.toLowerCase()
    : "";

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    mainCategory: urlMainCategory,
    category: [],
    subcategory: "",
    size: searchParams.get("size") || "",
    brand: "",
    discountOnly: false,
    price: [0, 5000],
  });

  /* ---------- SYNC URL → FILTERS ---------- */
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      mainCategory: urlMainCategory,
      category: [],
      subcategory: "",
    }));
  }, [urlMainCategory]);

  /* ---------- FILTER LOGIC DATA ---------- */
  const mainCategoryMap = CATEGORY_MAP[filters.mainCategory] || {};
  const allCategories = Object.keys(mainCategoryMap);
  const allSubcategories = Array.from(
    new Set(Object.values(mainCategoryMap).flat()),
  );

  // FIX: Defining the visible variables properly
  const visibleCategories = showAllCats
    ? allCategories
    : allCategories.slice(0, 6);
  const visibleSubcategories = showAllSubs
    ? allSubcategories
    : allSubcategories.slice(0, 6);

  /* ---------- HELPERS ---------- */
  const clearFilters = () => {
    setFilters({
      search: "",
      mainCategory: urlMainCategory,
      category: [],
      subcategory: "",
      size: "",
      brand: "",
      discountOnly: false,
      price: [0, 5000],
    });
    toast.success("Filters cleared");
  };

  /* ---------- FETCHING LOGIC ---------- */
  useEffect(() => {
    async function loadProducts() {
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: PAGE_SIZE.toString(),
          minPrice: filters.price[0].toString(),
          maxPrice: filters.price[1].toString(),
        });

        if (filters.mainCategory)
          params.set("mainCategory", filters.mainCategory);
        if (filters.category.length)
          params.set("category", filters.category[0]);
        if (filters.subcategory) params.set("subcategory", filters.subcategory);
        if (filters.size) params.set("size", filters.size);
        if (filters.search) params.set("search", filters.search);

        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();

        let list = data.products || [];
        if (filters.brand) list = list.filter((p) => p.brand === filters.brand);
        if (filters.discountOnly) {
          list = list.filter(
            (p) => p.price?.old && p.price.old > p.price.current,
          );
        }

        setProducts(list);
        setHasMore(data.hasMore);
        setPage(2);
      } catch (err) {
        toast.error("Error loading products");
      }
    }
    loadProducts();
  }, [filters]);

  const loadMore = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        minPrice: filters.price[0].toString(),
        maxPrice: filters.price[1].toString(),
      });

      if (filters.mainCategory)
        params.set("mainCategory", filters.mainCategory);
      if (filters.category.length) params.set("category", filters.category[0]);
      if (filters.subcategory) params.set("subcategory", filters.subcategory);
      if (filters.size) params.set("size", filters.size);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      let list = data.products || [];
      if (filters.brand) list = list.filter((p) => p.brand === filters.brand);

      setProducts((prev) => [...prev, ...list]);
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch {
      toast.error("Failed loading more products");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f4]">
      <HeroSection
        slides={slides}
        search={filters.search}
        setSearch={(v) => setFilters((p) => ({ ...p, search: v }))}
      />

      <div className="flex max-w-7xl mx-auto gap-10 px-4 py-8 relative">
        {/* SIDEBAR - STICKY */}
        <aside className="hidden md:block w-72 space-y-8 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
          <div className="flex items-center justify-between border-b pb-4 border-orange-200">
            <h3 className="font-bold text-xl text-[#654321]">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Clear All
            </button>
          </div>

          {/* CATEGORY */}
          {allCategories.length > 0 && (
            <FilterBlock title="Category">
              <div className="flex flex-wrap gap-2">
                {visibleCategories.map((c) => (
                  <FilterChip
                    key={c}
                    active={filters.category.includes(c)}
                    onClick={() =>
                      setFilters((p) => ({
                        ...p,
                        category: p.category.includes(c) ? [] : [c],
                        subcategory: "",
                      }))
                    }
                  >
                    {c}
                  </FilterChip>
                ))}
              </div>
              {allCategories.length > 6 && (
                <button
                  onClick={() => setShowAllCats(!showAllCats)}
                  className="mt-2 text-xs font-bold text-[#654321] underline"
                >
                  {showAllCats ? "Show Less" : "See More +"}
                </button>
              )}
            </FilterBlock>
          )}

          {/* SUBCATEGORY - RESTORED & FIXED */}
          {allSubcategories.length > 0 && (
            <FilterBlock title="Sub Category">
              <div className="flex flex-wrap gap-2">
                {visibleSubcategories.map((s) => (
                  <FilterChip
                    key={s}
                    active={filters.subcategory === s}
                    onClick={() =>
                      setFilters((p) => ({
                        ...p,
                        subcategory: p.subcategory === s ? "" : s,
                      }))
                    }
                  >
                    {s}
                  </FilterChip>
                ))}
              </div>
              {allSubcategories.length > 6 && (
                <button
                  onClick={() => setShowAllSubs(!showAllSubs)}
                  className="mt-2 text-xs font-bold text-[#654321] underline"
                >
                  {showAllSubs ? "Show Less" : "See More +"}
                </button>
              )}
            </FilterBlock>
          )}

          {/* BRAND */}
          <FilterBlock title="Brand">
            <FilterChip
              active={filters.brand === "Branded Collection"}
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  brand:
                    p.brand === "Branded Collection"
                      ? ""
                      : "Branded Collection",
                }))
              }
            >
              Branded Collection
            </FilterChip>
          </FilterBlock>

          {/* SIZE */}
          {filters.mainCategory !== "accessories" && (
            <FilterBlock title="Size">
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((s) => (
                  <FilterChip
                    key={s}
                    active={filters.size === s}
                    onClick={() =>
                      setFilters((p) => ({ ...p, size: p.size === s ? "" : s }))
                    }
                  >
                    {s}
                  </FilterChip>
                ))}
              </div>
            </FilterBlock>
          )}

          {/* PRICE */}
          <FilterBlock title="Price">
            <input
              type="range"
              min="0"
              max="5000"
              value={filters.price[1]}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  price: [0, Number(e.target.value)],
                }))
              }
              className="w-full accent-[#654321]"
            />
            <p className="text-sm mt-2 font-medium">
              Up to ₹{filters.price[1]}
            </p>
          </FilterBlock>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          {/* DYNAMIC HEADING */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold font-mono text-[#654321] capitalize">
              In {filters.mainCategory || "All"} Collection
            </h1>
            <div className="h-1 w-20 bg-[#654321] mt-2 rounded-full"></div>
          </div>

          <InfiniteScroll
            dataLength={products.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<p className="text-center py-6 font-medium">Loading...</p>}
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </InfiniteScroll>

          {products.length === 0 && (
            <p className="text-center py-10 text-gray-500">
              No products found for these filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- */
/* -------- UI HELPERS -------------- */
/* --------------------------------- */

function FilterBlock({ title, children }) {
  return (
    <div>
      <h4 className="font-bold text-[#654321] mb-3 text-xs uppercase tracking-widest">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FilterChip({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-3 py-1.5 text-xs rounded-md border transition-all duration-200 ${
        active
          ? "bg-[#654321] text-white border-[#654321]"
          : "border-gray-300 text-gray-700 hover:border-[#654321] bg-white"
      }`}
    >
      {children}
    </button>
  );
}
