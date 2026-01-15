import { connectDb } from "@/lib/dbConnect";
import User from "@/models/User";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import "@/models/Order";
import "@/models/Products";
export async function GET() {
  try {
    await connectDb();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return NextResponse.json({ success: false, user: null });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate([
        {
          path: "orderHistory.order",
          populate: {
            path: "items.product",
          },
        },
        { path: "wishlist" },
        { path: "cart.product" },
      ])
      .lean(); // ✅ faster + safer

    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function PATCH(req) {
  try {
    await connectDb();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    console.log("------------------------");

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await req.json(); // expects { addresses, defaultAddress }
    console.log(
      "========================================================",
      body
    );

    await User.findByIdAndUpdate(decoded.userId, {
      addresses: body.addresses,
      defaultAddress: body.defaultAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
