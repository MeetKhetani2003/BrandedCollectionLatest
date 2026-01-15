// "use client";
import CategoriesSection from "@/components/Home/CategoriesSection";
import FeaturedProducts from "@/components/Home/FeaturedProducts";
import Hero from "@/components/Home/Hero";
import Products from "@/components/Home/Products";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { getCookie, getCookies } from "cookies-next";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

const Home = async () => {
  const slides = [
    { type: "image", url: "/assets/CarouselAssets/banner1.avif" },
    { type: "video", url: "/assets/CarouselAssets/video1.mp4" },
    { type: "image", url: "/assets/CarouselAssets/banner2.avif" },
  ];
  // const cookieStore = await cookies(); // <-- NEW REQUIRED
  // const token = cookieStore.get("auth")?.value;
  // // console.log(jwtDecode(token));

  // if (!token) redirect("/auth");

  // try {
  //   jwt.verify(token, process.env.JWT_SECRET);
  // } catch {
  //   redirect("/auth");
  // }
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
