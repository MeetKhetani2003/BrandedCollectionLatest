import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    await connectDb();
    const { orderId, awbNumber } = await req.json();

    if (!orderId || !awbNumber) {
      return NextResponse.json(
        { success: false, message: "Order ID & AWB required" },
        { status: 400 },
      );
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { awbNumber },
      { new: true },
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("AWB SAVE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save AWB" },
      { status: 500 },
    );
  }
}
