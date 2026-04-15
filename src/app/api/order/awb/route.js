// app/api/order/awb/route.js
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getTrackingData } from "@/utils/tirupatiApi";

export async function PATCH(req) {
  try {
    await connectDb();

    const { orderId, awbNumber } = await req.json();
    console.log("AWB Route - Received:", { orderId, awbNumber });

    if (!orderId || !awbNumber) {
      return NextResponse.json(
        { success: false, message: "orderId and awbNumber are required" },
        { status: 400 },
      );
    }

    // Verify the AWB exists/is valid via the API [cite: 5, 24]
    console.log("AWB Route - Fetching tracking data for AWB:", awbNumber);
    const trackingData = await getTrackingData(awbNumber);
    console.log(
      "AWB Route - Tracking API Response:",
      JSON.stringify(trackingData, null, 2),
    );

    if (trackingData.OpStatus !== "SUCCEED") {
      console.error(
        "AWB Route - Invalid AWB. OpStatus:",
        trackingData.OpStatus,
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid AWB Number: " + (trackingData.OpStatus || "Unknown error"),
        },
        { status: 400 },
      );
    }

    console.log("AWB Route - Saving AWB to database...");
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        awbNumber: awbNumber,
        orderStatus: "awbUpdated",
        tracking: {
          status: trackingData.CurStatus,
          lastFetchedAt: new Date(),
          raw: trackingData,
          completed:
            trackingData.CurStatus?.toUpperCase().includes("DELIVERED") ||
            false,
        },
      },
      { new: true },
    );

    console.log(
      "AWB Route - Order saved successfully. AWB:",
      updatedOrder.awbNumber,
    );
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("AWB Route ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
