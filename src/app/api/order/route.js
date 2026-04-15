import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Products";
import { fetchAwbTracking } from "@/utils/fetchAwbTracking";
import { decrementProductStock } from "@/utils/stockManager";

export async function GET() {
  try {
    await connectDb();

    // 1️⃣ Fetch all orders first
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

    for (const order of orders) {
      try {
        const needsUpdate =
          order.awbNumber &&
          !order.tracking?.completed &&
          (!order.tracking?.lastFetchedAt ||
            now - new Date(order.tracking.lastFetchedAt).getTime() > DAY_24);

        if (needsUpdate) {
          // Verify fetchAwbTracking exists before calling it
          if (typeof fetchAwbTracking === "function") {
            const trackingData = await fetchAwbTracking(order.awbNumber);

            if (trackingData) {
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
        }
      } catch (innerError) {
        // If one order's tracking fails, don't stop the whole request
        console.error(
          `Tracking update failed for order ${order._id}:`,
          innerError,
        );
      }
    }

    // 3️⃣ Convert to plain objects and Return
    const finalOrders = orders.map((o) => o.toObject());

    return NextResponse.json(
      { success: true, orders: finalOrders },
      { status: 200 },
    );
  } catch (error) {
    console.error("ADMIN ORDERS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load orders",
        error: error.message,
      },
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

    // ✅ FINAL STOCK VALIDATION: Check all items still have stock
    for (const item of items) {
      const productId = item.product || item.productId;

      if (!productId) continue;

      const product = await Product.findById(productId);

      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found: ${productId}` },
          { status: 404 },
        );
      }

      const sizeEntry = product.sizes?.find(
        (s) => s.size === (item.size || "Free Size"),
      );

      if (!sizeEntry) {
        return NextResponse.json(
          {
            success: false,
            message: `Size ${item.size || "Free Size"} not available for ${product.name}`,
          },
          { status: 400 },
        );
      }

      if (sizeEntry.quantity < (item.qty || 1)) {
        return NextResponse.json(
          {
            success: false,
            message: `⏰ Sorry! ${product.name} (${item.size || "Free Size"}) is now out of stock. Only ${sizeEntry.quantity} available, but you requested ${item.qty || 1}.`,
          },
          { status: 400 },
        );
      }
    }

    // ✅ ATOMIC STOCK DEDUCTION: Prevent race conditions
    for (const item of items) {
      const productId = item.product || item.productId;
      const qty = item.qty || 1;
      const size = item.size || "Free Size";

      if (!productId) continue;

      const result = await Product.updateOne(
        {
          _id: productId,
          sizes: { $elemMatch: { size: size, quantity: { $gte: qty } } },
        },
        {
          $inc: {
            "sizes.$.quantity": -qty,
          },
        },
      );

      if (result.modifiedCount === 0) {
        const product = await Product.findById(productId);
        const sizeEntry = product?.sizes?.find((s) => s.size === size);
        const availableQty = sizeEntry ? sizeEntry.quantity : 0;

        return NextResponse.json(
          {
            success: false,
            message: `⏰ Too late! ${product?.name} (${size}) is now out of stock. Only ${availableQty} item(s) remaining.`,
          },
          { status: 400 },
        );
      }
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

    // ---- Decrement Product Stock ----
    // Already done atomically above, just update salesCount
    try {
      for (const item of items) {
        const productId = item.product || item.productId;
        const qty = item.qty || 1;

        if (productId) {
          await Product.updateOne(
            { _id: productId },
            { $inc: { salesCount: qty } },
          );
        }
      }
    } catch (stockError) {
      console.error("Failed to update product sales count:", stockError);
    }

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
