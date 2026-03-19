// "use client";
import dynamic from "next/dynamic";
import CategoriesSection from "@/components/Home/CategoriesSection";
const FeaturedProducts = dynamic(
  () => import("@/components/Home/FeaturedProducts"),
);
const Products = dynamic(() => import("@/components/Home/Products"));
import Hero from "@/components/Home/Hero";

const Home = async () => {
  const slides = [
    { type: "image", url: "/assets/CarouselAssets/banner1.avif" },
    { type: "video", url: "/assets/CarouselAssets/video1.mp4" },
    { type: "image", url: "/assets/CarouselAssets/banner2.avif" },
  ];

  return (
    <div>
      <Hero slides={slides} />
      <FeaturedProducts />
      <CategoriesSection />
      <Products />
    </div>
  );
};

export default Home;
