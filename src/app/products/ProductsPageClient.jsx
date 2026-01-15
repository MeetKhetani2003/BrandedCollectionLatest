"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "@/components/Layouts/ProductCard";
import toast from "react-hot-toast";
import HeroSection from "@/components/products/HeroSection";

/* --------------------------------- */
/* -------- CATEGORY MAP ------------ */
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
  },
};

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const PAGE_SIZE = 12;

/* --------------------------------- */
/* -------- MAIN COMPONENT ---------- */
/* --------------------------------- */

export default function ProductsPageClient() {
  const searchParams = useSearchParams();

  /* ---------- URL PARAMS ---------- */

  const rawMainCategory = searchParams.get("mainCategory") || "";

  const urlMainCategory = ["clothes", "shoes", "accessories"].includes(
    rawMainCategory.toLowerCase()
  )
    ? rawMainCategory.toLowerCase()
    : "";

  const urlSearch = searchParams.get("search") || "";
  const urlSize = searchParams.get("size") || "";

  /* ---------- STATE ---------- */

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    search: urlSearch,
    mainCategory: urlMainCategory,
    category: [],
    subcategory: "",
    size: urlSize,
    brand: "",
    discountOnly: false,
    price: [0, 5000],
  });

  /* --------------------------------- */
  /* 🔥 SYNC URL → FILTERS             */
  /* --------------------------------- */

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      mainCategory: urlMainCategory,
      category: [],
      subcategory: "",
      size: "",
    }));
  }, [urlMainCategory]);

  /* --------------------------------- */
  /* -------- FILTER DATA ------------ */
  /* --------------------------------- */

  const mainCategoryMap = CATEGORY_MAP[filters.mainCategory] || {};
  const allCategories = Object.keys(mainCategoryMap);
  const allSubcategories = Array.from(
    new Set(Object.values(mainCategoryMap).flat())
  );

  /* --------------------------------- */
  /* -------- INITIAL LOAD ----------- */
  /* --------------------------------- */

  useEffect(() => {
    async function loadProducts() {
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: PAGE_SIZE.toString(),
          minPrice: filters.price[0],
          maxPrice: filters.price[1],
        });

        if (filters.mainCategory)
          params.set("mainCategory", filters.mainCategory);
        if (filters.category.length)
          params.set("category", filters.category[0]);
        if (filters.subcategory) params.set("subcategory", filters.subcategory);
        if (filters.size) params.set("size", filters.size);
        if (filters.search) params.set("search", filters.search);

        const res = await fetch(`/api/products?${params}`, {
          cache: "no-store",
        });

        const data = await res.json();

        let list = data.products || [];

        /* BRAND FILTER */
        if (filters.brand) {
          list = list.filter((p) => p.brand === filters.brand);
        }

        /* DISCOUNT FILTER */
        if (filters.discountOnly) {
          list = list.filter(
            (p) => p.price?.old && p.price.old > p.price.current
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

  /* --------------------------------- */
  /* -------- LOAD MORE -------------- */
  /* --------------------------------- */

  const loadMore = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        minPrice: filters.price[0],
        maxPrice: filters.price[1],
      });

      if (filters.mainCategory)
        params.set("mainCategory", filters.mainCategory);
      if (filters.category.length) params.set("category", filters.category[0]);
      if (filters.subcategory) params.set("subcategory", filters.subcategory);
      if (filters.size) params.set("size", filters.size);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/products?${params}`, {
        cache: "no-store",
      });

      const data = await res.json();

      let list = data.products || [];

      if (filters.brand) {
        list = list.filter((p) => p.brand === filters.brand);
      }

      if (filters.discountOnly) {
        list = list.filter(
          (p) => p.price?.old && p.price.old > p.price.current
        );
      }

      setProducts((prev) => [...prev, ...list]);
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch {
      toast.error("Failed loading more products");
    }
  };

  /* --------------------------------- */
  /* -------- HELPERS ---------------- */
  /* --------------------------------- */

  const toggleCategory = (c) => {
    setFilters((p) => ({
      ...p,
      category: p.category.includes(c) ? [] : [c],
      subcategory: "",
    }));
  };

  const toggleSize = (s) => {
    setFilters((p) => ({
      ...p,
      size: p.size === s ? "" : s,
    }));
  };
  const slides = [
    { type: "image", url: "/assets/CarouselAssets/banner1.avif" },
    { type: "video", url: "/assets/CarouselAssets/video1.mp4" },
    { type: "image", url: "/assets/CarouselAssets/banner2.avif" },
  ];

  return (
    <div className="min-h-screen bg-[#fff9f4]">
      <HeroSection
        slides={slides}
        search={filters.search}
        setSearch={(v) => setFilters((p) => ({ ...p, search: v }))}
      />

      <div className="flex max-w-7xl mx-auto gap-6 px-4 py-6">
        {/* SIDEBAR */}
        <aside className="hidden md:block w-72 space-y-6">
          {/* SEARCH */}
          <FilterBlock title="Search">
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              className="border px-3 py-2 rounded-md w-full"
              placeholder="Search products..."
            />
          </FilterBlock>

          {/* CATEGORY */}
          {allCategories.length > 0 && (
            <FilterBlock title="Category">
              <div className="flex flex-wrap gap-2">
                {allCategories.map((c) => (
                  <FilterChip
                    key={c}
                    active={filters.category.includes(c)}
                    onClick={() => toggleCategory(c)}
                  >
                    {c}
                  </FilterChip>
                ))}
              </div>
            </FilterBlock>
          )}

          {/* SUBCATEGORY (ALL AT ONCE) */}
          {allSubcategories.length > 0 && (
            <FilterBlock title="Sub Category">
              <div className="flex flex-wrap gap-2">
                {allSubcategories.map((s) => (
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

          {/* SIZE (NOT FOR ACCESSORIES) */}
          {filters.mainCategory !== "accessories" && (
            <FilterBlock title="Size">
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((s) => (
                  <FilterChip
                    key={s}
                    active={filters.size === s}
                    onClick={() => toggleSize(s)}
                  >
                    {s}
                  </FilterChip>
                ))}
              </div>
            </FilterBlock>
          )}

          {/* OFFERS */}
          <FilterBlock title="Offers">
            <FilterChip
              active={filters.discountOnly}
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  discountOnly: !p.discountOnly,
                }))
              }
            >
              On Discount
            </FilterChip>
          </FilterBlock>

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
              className="w-full"
            />
            <p className="text-sm mt-1">
              Up to <span className="font-semibold">₹{filters.price[1]}</span>
            </p>
          </FilterBlock>
        </aside>

        {/* GRID */}
        <div className="flex-1">
          <InfiniteScroll
            dataLength={products.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<p className="text-center py-6">Loading…</p>}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </InfiniteScroll>

          {!products.length && (
            <p className="text-center py-10 text-gray-500">
              No matching products 😢
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
      <h4 className="font-semibold text-[#654321] mb-2">{title}</h4>
      {children}
    </div>
  );
}

function FilterChip({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-3 py-1 text-sm rounded-full border transition ${
        active
          ? "bg-[#654321] text-white border-[#654321]"
          : "border-gray-400 text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
