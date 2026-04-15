import { Suspense } from "react";
import AdminProducts from "./AdminProducts";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading products…</div>}>
      <AdminProducts />
    </Suspense>
  );
}
