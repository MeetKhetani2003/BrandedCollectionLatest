import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import OrderReservation from "@/models/OrderReservation";
import Product from "@/models/Products";

/**
 * POST /api/reservation/cleanup
 * Manual endpoint to clean up expired reservations
 * Should be called periodically or via cron job
 */
export async function POST() {
  try {
    await connectDb();

    const now = new Date();

    // Find all expired pending reservations
    const expiredReservations = await OrderReservation.find({
      status: "pending",
      expiresAt: { $lt: now },
    });

    let restored = 0;

    for (const reservation of expiredReservations) {
      // Restore stock
      for (const item of reservation.items) {
        await Product.updateOne(
          { _id: item.product, sizes: { $elemMatch: { size: item.size } } },
          { $inc: { "sizes.$.quantity": item.qty } }
        );
      }

      // Mark as expired
      reservation.status = "expired";
      await reservation.save();

      restored++;
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${restored} expired reservations`,
      restored,
    });
  } catch (error) {
    console.error("CLEANUP ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reservation/stats
 * Get statistics about current reservations
 */
export async function GET() {
  try {
    await connectDb();

    const now = new Date();

    const [pending, confirmed, expired, cancelled] = await Promise.all([
      OrderReservation.countDocuments({ status: "pending" }),
      OrderReservation.countDocuments({ status: "confirmed" }),
      OrderReservation.countDocuments({ status: "expired" }),
      OrderReservation.countDocuments({ status: "cancelled" }),
    ]);

    const expiringSoon = await OrderReservation.countDocuments({
      status: "pending",
      expiresAt: { $lt: new Date(Date.now() + 5 * 60 * 1000) }, // Next 5 minutes
    });

    return NextResponse.json({
      success: true,
      stats: {
        pending,
        confirmed,
        expired,
        cancelled,
        expiringSoon,
      },
    });
  } catch (error) {
    console.error("STATS ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
