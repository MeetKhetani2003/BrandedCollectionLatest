"use client";
import Image from "next/image";
import Link from "next/link";

const CategoryCard = ({ cat }) => (
  <Link href={cat.href} className="category-card group cursor-pointer">
    <div className="overflow-hidden bg-gradient-to-b from-neutral-100 to-neutral-50 border border-neutral-200 shadow-[0_3px_10px_rgba(0,0,0,0.07)] transition duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)]">
      <div className="relative w-full h-40 sm:h-60">
        <Image
          src={cat.image}
          alt={cat.title}
          fill
          priority={false} // avoids SSR race mismatch
          sizes="(max-width:768px) 50vw, 25vw" // 🧠 REQUIRED for stable hydration
          className="object-cover transition duration-300 group-hover:scale-110"
        />
      </div>
    </div>

    <p className="text-sm text-center mt-4 tracking-wider font-medium text-neutral-700 transition duration-300 group-hover:text-black group-hover:tracking-wide">
      {cat.title}
    </p>

    <div className="mx-auto mt-1 h-[2px] w-0 bg-neutral-800 transition-all duration-300 group-hover:w-12"></div>
  </Link>
);

export default CategoryCard;
