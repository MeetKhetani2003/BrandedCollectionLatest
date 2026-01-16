"use client";
import React, { useEffect, useRef, useState } from "react";
import ProductCard from "../Layouts/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Optional fallback dummy data
const dummyProducts = [
  {
    _id: "1",
    name: "Oversized Anime Tee",
    category: "T-Shirts",
    price: { current: 999 },
    imageFront: "/dummy/front1.jpg",
    imageBack: "/dummy/back1.jpg",
    availableSizes: ["S", "M", "L", "XL"],
  },
  {
    _id: "2",
    name: "Minimal Hoodie",
    category: "Hoodies",
    price: { current: 1899 },
    imageFront: "/dummy/front2.jpg",
    imageBack: "/dummy/back2.jpg",
    availableSizes: ["M", "L", "XL"],
  },
];

export default function FeaturedProducts() {
  const swiperRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch only featured products from backend
  const fetchFeatured = async () => {
    try {
      const res = await fetch("/api/products?featured=true", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      if (data?.products?.length > 0) {
        setProducts(data.products);
      } else {
        setProducts(dummyProducts);
      }
    } catch (err) {
      console.log("Featured Fetch Error:", err);
      setProducts(dummyProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400">
        Loading Featured Products...
      </div>
    );
  }

  return (
    <section className="py-12 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ---- HEADING ---- */}
        <div className="text-center mb-10">
          <p className="text-[12px] tracking-[0.25em] text-neutral-500 uppercase">
            Curated Picks
          </p>
          <h2 className="font-semibold text-[26px] md:text-[32px] tracking-wide text-neutral-900 mt-2">
            FEATURED PRODUCTS
          </h2>
          <span className="block mx-auto w-20 h-[2px] mt-3 bg-neutral-900 rounded-full"></span>
        </div>

        {/* ---- SLIDER ---- */}
        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop
          pagination={{
            el: ".featured-pagination",
            clickable: true,
            dynamicBullets: true,
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          spaceBetween={24}
        >
          {products.map((item) => (
            <SwiperSlide key={item._id}>
              <ProductCard product={item} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ✅ Pagination OUTSIDE cards */}
        <div className="featured-pagination flex justify-center mt-6" />
      </div>
    </section>
  );
}
