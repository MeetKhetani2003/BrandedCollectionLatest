import { notFound } from "next/navigation";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";

export default async function ProductDetails({ params }) {
  const { slug } = await params;

  if (!slug) return notFound();

  await connectDb();

  const product = await Products.findOne({ slug }).lean({ virtuals: true });

  if (!product) return notFound();

  return (
    <div className="bg-[#fff9f4] min-h-screen">
      <ProductDetailsClient product={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}
