import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}
