import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Product from "@/models/Products";
import OrderReservation from "@/models/OrderReservation";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import crypto from "crypto";

/**
 * POST /api/reservation
 * Creates a stock reservation and returns Razorpay order ID
 * Stock is deducted IMMEDIATELY to prevent race conditions
 */
export async function POST(req) {
  try {
    await connectDb();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = jwtDecode(token);
    const userId = user.userId;
    const body = await req.json();
    const { cart, amount, address } = body;

    if (!cart?.length || !amount) {
      return NextResponse.json(
        { success: false, message: "Cart and amount required" },
        { status: 400 },
      );
    }

    // ✅ ATOMIC STOCK RESERVATION: Check AND deduct in one operation
    const reservationItems = [];

    for (const item of cart) {
      const productId = item.productId || item._id;
      const qty = item.qty || 1;
      const size = item.size || item.selectedSize || "Free Size";
      const price = item.price;

      // Atomic check and deduct
      const result = await Product.updateOne(
        {
          _id: productId,
          sizes: { $elemMatch: { size: size, quantity: { $gte: qty } } },
        },
        {
          $inc: { "sizes.$.quantity": -qty },
        },
      );

      if (result.modifiedCount === 0) {
        // Stock deduction failed - another user got it first
        
        // Restore stock for items already processed in this request
        if (reservationItems.length > 0) {
          await restoreStock(reservationItems);
        }

        const product = await Product.findById(productId);
        const sizeEntry = product?.sizes?.find((s) => s.size === size);
        const available = sizeEntry ? sizeEntry.quantity : 0;

        return NextResponse.json(
          {
            success: false,
            message: `⏰ Sorry! ${product?.name} (${size}) is now reserved by another user. Only ${available} item(s) remaining.`,
            outOfStock: true,
          },
          { status: 400 },
        );
      }

      reservationItems.push({
        product: productId,
        productName: item.name || "Product",
        price,
        qty,
        size,
      });
    }

    // ✅ CREATE RESERVATION RECORD
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create Razorpay order for payment
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Save reservation in database
    const reservation = await OrderReservation.create({
      user: userId,
      items: reservationItems,
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      expiresAt,
      shippingAddress: address,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      reservationId: reservation._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      expiresAt,
    });
  } catch (error) {
    console.error("RESERVATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reservation/confirm
 * Confirms reservation after successful payment
 */
export async function PUT(req) {
  try {
    await connectDb();

    const body = await req.json();
    const {
      reservationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Verify signature
    const secret = process.env.RAZORPAY_SECRET;
    const hash = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (hash !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 },
      );
    }

    // Find and confirm reservation
    const reservation = await OrderReservation.findOne({
      _id: reservationId,
      razorpayOrderId: razorpay_order_id,
      status: "pending",
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found or expired" },
        { status: 404 },
      );
    }

    if (new Date() > reservation.expiresAt) {
      // Reservation expired - restore stock
      await restoreStock(reservation.items);
      await reservation.updateOne({ status: "expired" });

      return NextResponse.json(
        {
          success: false,
          message: "⏰ Reservation expired. Stock restored. Please try again.",
        },
        { status: 400 },
      );
    }

    // Update reservation with payment ID
    reservation.razorpayPaymentId = razorpay_payment_id;
    reservation.status = "confirmed";
    await reservation.save();

    return NextResponse.json({
      success: true,
      reservation,
    });
  } catch (error) {
    console.error("CONFIRM RESERVATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reservation/cancel
 * Cancels reservation and restores stock
 */
export async function DELETE(req) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const reservationId = searchParams.get("id");

    if (!reservationId) {
      return NextResponse.json(
        { success: false, message: "Reservation ID required" },
        { status: 400 },
      );
    }

    const reservation = await OrderReservation.findOne({
      _id: reservationId,
      status: "pending",
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found" },
        { status: 404 },
      );
    }

    // Restore stock
    await restoreStock(reservation.items);

    // Mark as cancelled
    reservation.status = "cancelled";
    await reservation.save();

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled. Stock restored.",
    });
  } catch (error) {
    console.error("CANCEL RESERVATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

/**
 * Helper: Restore stock for cancelled/expired reservations
 */
async function restoreStock(items) {
  for (const item of items) {
    console.log(
      `Restoring stock: Product ${item.product}, Size ${item.size}, Qty ${item.qty}`,
    );

    const result = await Product.updateOne(
      { _id: item.product, sizes: { $elemMatch: { size: item.size } } },
      { $inc: { "sizes.$.quantity": item.qty } },
    );

    console.log(`Stock update result:`, result);

    // Verify stock was actually updated
    const updatedProduct = await Product.findById(item.product);
    const sizeEntry = updatedProduct.sizes?.find((s) => s.size === item.size);
    console.log(`New stock for ${item.size}: ${sizeEntry?.quantity || 0}`);
  }
}
