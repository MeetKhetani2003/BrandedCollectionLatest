// jobs/updateTracking.js
import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";
import { fetchAwbTracking } from "./fetchAwbTracking";

export async function updateTrackingAfter24h() {
  await connectDb();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const orders = await Order.find({
    awbNumber: { $exists: true, $ne: "" },
    "tracking.completed": { $ne: true },
    createdAt: { $lte: since24h },
  });

  for (const order of orders) {
    const data = await fetchAwbTracking(order.awbNumber);

    const finalStatus = data.OpStatus?.startsWith("FAILED")
      ? data.OpStatus
      : data.CurStatus || "In Transit";

    order.tracking = {
      status: finalStatus,
      raw: data,
      lastFetchedAt: new Date(),
      completed: data.CurStatus?.includes("DELIVERED"),
    };

    await order.save();
  }
}
