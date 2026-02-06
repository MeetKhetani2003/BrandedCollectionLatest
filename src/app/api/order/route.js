import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Products";

export async function GET() {
  try {
    await connectDb();

    // 1️⃣ Fetch orders first
    const orders = await Order.find()
      .populate([
        { path: "user", select: "email username firstName lastName" },
        {
          path: "items.product",
          select: "name price imageFrontFileId slug",
        },
      ])
      .sort({ createdAt: -1 });

    const now = Date.now();
    const DAY_24 = 24 * 60 * 60 * 1000;

    // 2️⃣ Auto-update tracking (NO new API)
    for (const order of orders) {
      if (
        order.awbNumber &&
        !order.tracking?.completed &&
        (!order.tracking?.lastFetchedAt ||
          now - new Date(order.tracking.lastFetchedAt).getTime() > DAY_24)
      ) {
        const trackingData = await fetchAwbTracking(order.awbNumber);

        const isFailed = trackingData.OpStatus?.startsWith("FAILED");

        const finalStatus = isFailed
          ? trackingData.OpStatus
          : trackingData.CurStatus || "In Transit";

        order.tracking = {
          status: finalStatus,
          raw: trackingData,
          lastFetchedAt: new Date(),
          completed:
            trackingData.CurStatus?.toUpperCase().includes("DELIVERED") ||
            false,
        };

        await order.save();
      }
    }

    // 3️⃣ Convert to plain objects AFTER updates
    const finalOrders = orders.map((o) => o.toObject());

    return NextResponse.json(
      { success: true, orders: finalOrders },
      { status: 200 },
    );
  } catch (error) {
    console.error("ADMIN ORDERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load orders" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await connectDb();

    const body = await req.json();
    const {
      user,
      customerName,
      customerEmail,
      items,
      amount,
      paymentId,
      status,
    } = body;

    if (!items?.length || !amount) {
      return NextResponse.json(
        { success: false, message: "Items & amount required" },
        { status: 400 },
      );
    }

    const order = await Order.create({
      user: user || null,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      items,
      amount,
      paymentId: paymentId || `offline_${Date.now()}`,
      status: status || "paid",
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
// DELETE ORDER (Admin)
export async function DELETE(req) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    await Order.deleteOne({ _id: orderId });

    return NextResponse.json(
      { success: true, message: "Order deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
