"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroClient({ slides = [] }) {
  if (!slides.length) return null;

  return (
    <div className="w-full">
      <div className="max-w-full mx-4">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, pauseOnMouseEnter: true }}
          loop
          navigation
          pagination={{ clickable: true }}
          speed={650}
          className="hero-swiper"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[520px]  overflow-hidden bg-[#f5f5f5] relative ">
                {slide.type === "image" && (
                  <img
                    src={slide.url}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                  />
                )}
                {slide.type === "video" && (
                  <video
                    src={slide.url}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
