import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "weekly";

  let startDate = new Date();

  if (range === "weekly") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (range === "monthly") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (range === "yearly") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  } else {
    startDate = new Date(0); // all time
  }

  const orders = await Order.find({
    createdAt: { $gte: startDate },
    status: "paid",
  }).lean();

  // GROUP BY DATE
  const map = {};

  orders.forEach((o) => {
    const date = new Date(o.createdAt).toISOString().split("T")[0];
    map[date] = (map[date] || 0) + o.amount;
  });

  const chartData = Object.entries(map)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, amount]) => ({
      date,
      amount,
    }));

  return NextResponse.json({
    success: true,
    chartData,
    totalSales: orders.reduce((s, o) => s + o.amount, 0),
    totalOrders: orders.length,
  });
}
