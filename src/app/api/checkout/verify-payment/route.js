import crypto from "crypto";
import { connectDb } from "@/lib/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendMail } from "@/utils/sendMail";
import { generateInvoice } from "@/utils/generateInvoice";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export async function POST(req) {
  await connectDb();
  const body = await req.json();
  const cookieStore = await cookies();
  const token = cookieStore.get("auth").value;
  const user = jwtDecode(token);
  const userId = user.userId;
  const {
    razorpay_order_id,
    razorpay_signature,
    razorpay_payment_id,
    cart,
    amount,
    address, // from frontend
    // userId, // IMPORTANT → Required
  } = body;

  // ---- FIX: If still missing → return error
  if (!userId) {
    return Response.json({
      success: false,
      message: "❌ UserID missing while saving order.",
    });
  }
  const userData = await User.findOne({ _id: userId });
  // ---- Signature Verification
  const secret = process.env.RAZORPAY_SECRET;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (hash !== razorpay_signature) {
    return Response.json({
      success: false,
      message: "❌ Payment Verification Failed",
    });
  }

  // ---- Format Items for MongoDB Order Model
  const formattedItems = cart.map((item) => ({
    product: item.productId || item._id, // auto fix if naming mismatch
    qty: item.qty,
    size: item.size || item.selectedSize || "Free Size",
    price: item.price,
  }));

  // ---- Save Order
  let newOrder = await Order.create({
    user: userId,
    items: formattedItems,
    paymentId: razorpay_payment_id,
    amount,
    shippingAddress: address,
    status: "paid",
  });

  newOrder = await Order.findById(newOrder._id).populate("items.product");
  const newuserData = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        orderHistory: { order: newOrder._id },
      },
    },
    { new: true }
  );

  // ---- Generate Invoice PDF
  const pdf = await generateInvoice(newOrder);

  // ---- Send Email
  const userDoc = await User.findById(userId);

  await sendMail({
    to: userDoc.email,
    subject: `Order Confirmed - #${newOrder._id}`,
    html: `<p>Your order has been confirmed 🎉</p>`,
    attachments: [{ filename: "invoice.pdf", content: pdf }],
  });

  // ---- CLEAR CART
  await User.findByIdAndUpdate(userId, { cart: [] });

  return Response.json({ success: true, orderId: newOrder._id });
}
