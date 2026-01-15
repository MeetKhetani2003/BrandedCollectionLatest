import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";

/* -------------------------------- */
/* -------- DELETE COUPON ---------- */
/* -------------------------------- */
export async function DELETE(req, { params }) {
  try {
    await connectDb();

    const { id } = params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    await coupon.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
