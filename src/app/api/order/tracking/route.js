import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { fetchAwbTracking } from "@/utils/fetchAwbTracking";
import { NextResponse } from "next/server";
export async function GET(req) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const order = await Order.findById(orderId);

    if (!order || !order.awbNumber) {
      return NextResponse.json(
        { success: false, message: "AWB not found for this order" },
        { status: 400 },
      );
    }

    const trackingData = await fetchAwbTracking(order.awbNumber);

    order.tracking = {
      status: trackingData.CurStatus,
      lastFetchedAt: new Date(),
      raw: trackingData,
    };

    await order.save();
    console.log(order);

    return NextResponse.json({
      success: true,
      tracking: trackingData,
    });
  } catch (err) {
    console.error("TRACKING ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tracking" },
      { status: 500 },
    );
  }
}
