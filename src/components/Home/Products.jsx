"use client";

import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import FilterTabs from "../Home/FiltersTabs";
import ProductCard from "../Layouts/ProductCard";
import { useProductsStore } from "@/store/useProductStore";

export default function Products() {
  const { products, fetchProducts, hasMore } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-[#fff9f4]">
      <FilterTabs />

      <InfiniteScroll
        dataLength={products.length}
        next={fetchProducts}
        hasMore={hasMore}
        loader={<p className="text-center py-6">Loading...</p>}
      >
        <div className="grid max-w-7xl mx-auto grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
