"use client";

import dynamic from "next/dynamic";
const SwiperContainer = dynamic(() => import("./HeroClient"), { ssr: false });

export default function Hero(props) {
  return <SwiperContainer {...props} />;
}
