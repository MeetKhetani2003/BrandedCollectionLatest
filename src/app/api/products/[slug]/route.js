import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";

export async function GET(req, context) {
  try {
    await connectDb();

    // ✅ FIX: await params
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: "Product slug missing" },
        { status: 400 }
      );
    }

    const product = await Products.findOne({ slug }).lean({
      virtuals: true,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
