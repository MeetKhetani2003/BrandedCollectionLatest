import { NextResponse } from "next/server";
import Products from "@/models/Products";
import { connectDb } from "@/lib/dbConnect";
import { getCache, setCache } from "@/lib/globalProductChache";

export async function GET(req) {
  await connectDb();

  const cache = getCache();

  // Load cache first time only
  if (!cache.products.length) {
    const dbData = await Products.find().lean();
    setCache(dbData);
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  if (!query) return NextResponse.json({ suggestions: [] });

  const suggestions = [];

  cache.products.forEach((p) => {
    const fields = [
      p.name,
      p.brand,
      p.material,
      ...(p.tags || []),
      ...(p.availableSizes || []),
    ];

    fields.forEach((field) => {
      if (
        field &&
        field.toLowerCase().includes(query) &&
        !suggestions.includes(field)
      ) {
        suggestions.push(field);
      }
    });
  });

  return NextResponse.json({
    suggestions: suggestions.slice(0, 10), // limit
  });
}
