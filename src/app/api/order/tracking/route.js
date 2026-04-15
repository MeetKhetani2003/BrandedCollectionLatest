import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { fetchAwbTracking } from "@/utils/fetchAwbTracking";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    console.log("Tracking Route - Fetching order:", orderId);

    const order = await Order.findById(orderId);

    console.log("Tracking Route - Order found:", order?._id?.toString());
    console.log("Tracking Route - order.awbNumber:", order?.awbNumber);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (!order.awbNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "AWB Number missing. Please scan/save the AWB first.",
        },
        { status: 400 },
      );
    }

    console.log("Tracking Route - Fetching tracking for AWB:", order.awbNumber);
    const trackingData = await fetchAwbTracking(order.awbNumber);
    console.log(
      "Tracking Route - API Response:",
      JSON.stringify(trackingData, null, 2),
    );

    // Guard against the "UN-AUTHORIZED ACCESS" response from the API
    if (trackingData.OpStatus && trackingData.OpStatus.includes("FAILED")) {
      return NextResponse.json(
        {
          success: false,
          message: "Courier API Error: " + trackingData.OpStatus,
        },
        { status: 401 },
      );
    }

    order.tracking = {
      status: trackingData.CurStatus || "In Transit",
      lastFetchedAt: new Date(),
      raw: trackingData,
      completed:
        trackingData.CurStatus?.toUpperCase().includes("DELIVERED") || false,
    };

    await order.save();
    console.log("Tracking Route - Tracking saved successfully");

    return NextResponse.json({ success: true, tracking: order.tracking });
  } catch (err) {
    console.error("TRACKING ROUTE ERROR:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Tracking failed" },
      { status: 500 },
    );
  }
}
