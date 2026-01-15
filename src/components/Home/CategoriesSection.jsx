"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories } from "@/data/Categories";

// 1. Import Swiper components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles (you might need to adjust the path based on your setup)
import "swiper/css";
import "swiper/css/pagination";
import CategoryCard from "./CategoryCard";

gsap.registerPlugin(ScrollTrigger);

// Utility function to chunk the categories array for the mobile carousel
const chunkArray = (array, size) => {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

// We want 2 rows and 2 columns per slide on mobile (total 4 cards per slide)
const MOBILE_CHUNK_SIZE = 4;
const chunkedCategories = chunkArray(categories, MOBILE_CHUNK_SIZE);

// const CategoryCard = ({ cat }) => (
//   <Link href={cat.href} className="category-card group cursor-pointer">
//     {/* CARD */}
//     <div
//       className="
//         overflow-hidden
//         bg-gradient-to-b from-neutral-100 to-neutral-50
//         border border-neutral-200
//         shadow-[0_3px_10px_rgba(0,0,0,0.07)]
//         transition-all
//         duration-500
//         group-hover:scale-[1.03]
//         group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)]
//       "
//     >
//       <div className="relative w-full h-40 sm:h-60">
//         {" "}
//         {/* Adjusted height for better mobile fit */}
//         <Image
//           src={cat.image}
//           alt={cat.title}
//           fill
//           className="
//             object-cover
//             transition-all
//             duration-500
//             group-hover:scale-110
//           "
//         />
//       </div>
//     </div>

//     {/* TITLE */}
//     <p className="text-sm tracking-wider text-center mt-4 text-neutral-700 font-medium transition-all duration-500 group-hover:text-black group-hover:tracking-wide">
//       {cat.title}
//     </p>

//     {/* Underline animation */}
//     <div className="mx-auto mt-1 h-[2px] w-0 bg-neutral-800 transition-all duration-500 group-hover:w-12"></div>
//   </Link>
// );

const CategoriesSection = () => {
  const sectionRef = useRef(null);

  // State to track if the screen is mobile (optional, but helpful for debugging/conditional logic)
  const [isMobile, setIsMobile] = useState(false);

  // GSAP animation for the PC (non-carousel) view
  useEffect(() => {
    if (!sectionRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const cards = sectionRef.current.querySelectorAll(".category-card");

      gsap.from(cards, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    });

    mm.add("(max-width: 767px)", () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    });

    return () => {
      mm.revert();
    };
  }, []);

  // --- RENDERING LOGIC ---

  // PC / Tablet View (sm and up) - Standard Grid
  const pcGrid = (
    <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {categories.map((cat, index) => (
        <CategoryCard key={index} cat={cat} />
      ))}
    </div>
  );

  // Mobile View (up to md) - Swiper Carousel
  const mobileCarousel = (
    <div className="md:hidden">
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={10}
        slidesPerView={1} // Only one chunk/slide visible at a time
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="category-swiper"
      >
        {chunkedCategories.map((chunk, slideIndex) => (
          <SwiperSlide key={slideIndex}>
            {/* This div is the 2x2 grid for the current slide */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2 pb-10">
              {chunk.map((cat, cardIndex) => (
                <CategoryCard key={cardIndex} cat={cat} />
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  return (
    <section className="w-full py-16 px-4 md:px-6 select-none" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-semibold text-[26px] md:text-[30px] tracking-wider text-neutral-800 mb-10">
          CATEGORIES
        </h2>

        {pcGrid}
        {mobileCarousel}
      </div>
    </section>
  );
};

export default CategoriesSection;
