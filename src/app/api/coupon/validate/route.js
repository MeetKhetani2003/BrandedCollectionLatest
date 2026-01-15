import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  try {
    await connectDb();
    const { code, cartTotal } = await req.json();

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon)
      return NextResponse.json({ message: "Invalid coupon" }, { status: 400 });

    if (coupon.expiryDate < new Date())
      return NextResponse.json({ message: "Coupon expired" }, { status: 400 });

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return NextResponse.json(
        { message: "Coupon usage limit reached" },
        { status: 400 }
      );

    if (cartTotal < coupon.minOrderValue)
      return NextResponse.json(
        {
          message: `Minimum order ₹${coupon.minOrderValue} required`,
        },
        { status: 400 }
      );

    // CALCULATE DISCOUNT
    let discount = 0;

    if (coupon.type === "flat") {
      discount = coupon.value;
    } else {
      discount = Math.floor((cartTotal * coupon.value) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
