import crypto from "crypto";
import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Products";
import OrderReservation from "@/models/OrderReservation";
import { sendMail } from "@/utils/sendMail";
import { generateInvoice } from "@/utils/generateInvoice";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDb();
    const body = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;

    if (!token) {
      return Response.json({
        success: false,
        message: "❌ Unauthorized. Please login again.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "MyDevelopement");
    } catch (err) {
      return Response.json({
        success: false,
        message: "❌ Invalid auth token. Please login again.",
      });
    }

    const userId = decoded.userId;

    const {
      razorpay_order_id,
      razorpay_signature,
      razorpay_payment_id,
      reservationId,
    } = body;

    if (!userId) {
      return Response.json({
        success: false,
        message: "❌ UserID missing while saving order.",
      });
    }

    // ---- Signature Verification ----
    const secret = process.env.RAZORPAY_SECRET;
    const hash = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (hash !== razorpay_signature) {
      // Payment verification failed - restore stock
      if (reservationId) {
        await restoreReservationStock(reservationId);
      }

      return Response.json({
        success: false,
        message: "❌ Payment Verification Failed",
      });
    }

    // ---- Find and Confirm Reservation ----
    const reservation = await OrderReservation.findOne({
      _id: reservationId,
      razorpayOrderId: razorpay_order_id,
      user: userId,
      status: "pending",
    });

    if (!reservation) {
      return Response.json({
        success: false,
        message: "❌ Reservation not found or already processed.",
      });
    }

    // Check if reservation expired
    if (new Date() > reservation.expiresAt) {
      // Expired - restore stock
      await restoreReservationStock(reservationId);

      return Response.json({
        success: false,
        message: "⏰ Reservation expired. Stock restored. Please try again.",
      });
    }

    // ---- Convert Reservation to Order ----
    let newOrder = await Order.create({
      user: userId,
      items: reservation.items,
      paymentId: razorpay_payment_id,
      amount: reservation.amount,
      shippingAddress: reservation.shippingAddress,
      status: "paid",
      orderStatus: "orderPlaced",
    });

    // Update reservation status
    reservation.status = "confirmed";
    reservation.razorpayPaymentId = razorpay_payment_id;
    await reservation.save();

    // Populate order for email
    newOrder = await Order.findById(newOrder._id).populate("items.product");

    // Update user order history
    await User.findByIdAndUpdate(
      userId,
      { $push: { orderHistory: { order: newOrder._id } } },
      { new: true },
    );

    // Generate Invoice PDF
    const pdf = await generateInvoice(newOrder);

    // Send Email
    const userDoc = await User.findById(userId);
    await sendMail({
      to: userDoc.email,
      subject: `Order Confirmed - #${newOrder._id}`,
      html: `<p>Your order has been confirmed 🎉</p>`,
      attachments: [{ filename: "invoice.pdf", content: pdf }],
    });

    // Clear Cart
    await User.findByIdAndUpdate(userId, { cart: [] });

    // Update salesCount
    for (const item of reservation.items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { salesCount: item.qty } },
      );
    }

    return Response.json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return Response.json({
      success: false,
      message: "❌ Order processing failed. Please contact support.",
    });
  }
}

/**
 * Helper: Restore stock if reservation fails
 */
async function restoreReservationStock(reservationId) {
  try {
    const reservation = await OrderReservation.findById(reservationId);
    if (reservation && reservation.status === "pending") {
      for (const item of reservation.items) {
        await Product.updateOne(
          { _id: item.product, sizes: { $elemMatch: { size: item.size } } },
          { $inc: { "sizes.$.quantity": item.qty } },
        );
      }
      reservation.status = "cancelled";
      await reservation.save();
    }
  } catch (error) {
    console.error("Stock restoration failed:", error);
  }
}
