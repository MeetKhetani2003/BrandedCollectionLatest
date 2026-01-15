import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";

/* -------- CREATE COUPON -------- */
export async function POST(req) {
  try {
    await connectDb();
    const body = await req.json();

    const {
      code,
      type,
      value,
      minOrderValue = 0,
      maxDiscount,
      expiryDate,
      usageLimit,
      isActive = true,
    } = body;

    // REQUIRED CHECKS
    if (!code || !type || !value || !expiryDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type === "percent" && value > 100) {
      return NextResponse.json(
        { success: false, message: "Percent discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "Coupon already exists" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minOrderValue,
      maxDiscount: type === "percent" ? maxDiscount || null : null,
      expiryDate,
      usageLimit: usageLimit || null,
      isActive,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

/* -------- GET ALL COUPONS -------- */
export async function GET() {
  try {
    await connectDb();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}
