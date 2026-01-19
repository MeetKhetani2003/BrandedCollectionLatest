import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";

import { NextResponse } from "next/server";

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const safe = escapeRegex(q);
  const regex = new RegExp(safe, "i");

  const products = await Products.aggregate([
    {
      $match: {
        $or: [
          { name: regex },
          { brand: regex },
          { category: regex },
          { subcategory: regex },
          { material: regex },
          { tags: regex },
        ],
      },
    },

    // 🔥 PRIORITY SCORING
    {
      $addFields: {
        priority: {
          $cond: [
            { $regexMatch: { input: "$name", regex: regex } },
            2, // name match = HIGH priority
            1, // other fields = LOW priority
          ],
        },
      },
    },

    { $sort: { priority: -1, createdAt: -1 } },

    { $limit: 8 },

    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        price: 1,
        imageFrontPath: 1,
      },
    },
  ]);

  return NextResponse.json({ products });
}
