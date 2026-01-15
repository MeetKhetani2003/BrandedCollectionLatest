"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function Hero({ slides = [] }) {
  if (!slides.length) return null;

  return (
    <div className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] xl:h-[95vh] mt-4">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3500 }}
        loop
        pagination={{ clickable: true }}
        speed={800}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full overflow-hidden bg-[#f5f5f5]">
              {slide.type === "image" && (
                <img
                  src={slide.url}
                  alt={slide.alt || "Banner"}
                  className="w-full h-full object-cover"
                />
              )}

              {slide.type === "video" && (
                <video
                  src={slide.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
