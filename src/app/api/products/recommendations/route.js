import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import { getCache, setCache } from "@/lib/globalProductChache";

export async function GET(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Product ID required" },
      { status: 400 }
    );
  }

  // Load cache
  let cache = getCache();
  if (!cache.products.length) {
    const dbData = await Products.find().lean({ virtuals: true });
    setCache(dbData);
    cache = getCache();
  }

  const products = cache.products;
  const current = products.find((p) => p._id.toString() === id);

  if (!current) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const currentPrice = current.price?.current || 0;

  /* ---------------- SCORING SYSTEM ---------------- */
  const WEIGHTS = {
    sameCategory: 50,
    sameMainCategory: 30,
    priceSimilarity: 40,
    tagMatch: 15,
    sizeOverlap: 10,
  };

  function scoreProduct(p) {
    if (p._id.toString() === current._id.toString()) return -1;

    let score = 0;

    // Category match
    if (p.category === current.category) {
      score += WEIGHTS.sameCategory;
    } else if (p.mainCategory === current.mainCategory) {
      score += WEIGHTS.sameMainCategory;
    }

    // Price similarity
    const priceDiff = Math.abs((p.price?.current || 0) - currentPrice);
    const priceRatio = priceDiff / (currentPrice || 1);

    if (priceRatio < 0.1) score += WEIGHTS.priceSimilarity;
    else if (priceRatio < 0.25) score += WEIGHTS.priceSimilarity * 0.6;
    else if (priceRatio < 0.4) score += WEIGHTS.priceSimilarity * 0.3;

    // Tag match
    if (current.tags?.length && p.tags?.length) {
      const common = p.tags.filter((t) => current.tags.includes(t));
      score += common.length * WEIGHTS.tagMatch;
    }

    // Size overlap (FIXED)
    if (Array.isArray(current.sizes) && Array.isArray(p.sizes)) {
      const currentSizes = current.sizes.map((s) => s.size);
      const productSizes = p.sizes.map((s) => s.size);
      const common = productSizes.filter((s) => currentSizes.includes(s));
      score += Math.min(
        common.length * WEIGHTS.sizeOverlap,
        WEIGHTS.sizeOverlap
      );
    }

    return score;
  }

  /* ---------------- FINAL RESULT ---------------- */
  const recommendations = products
    .map((p) => ({ ...p, _score: scoreProduct(p) }))
    .filter((p) => p._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8);

  return NextResponse.json({ recommendations });
}
