import { connectDb } from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order"; // ✅ REGISTER
import Product from "@/models/Products"; // ✅ REGISTER
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const users = await User.find()
      .populate([
        {
          path: "wishlist",
          select: "name price imageFrontFileId",
        },
        {
          path: "cart.product",
          select: "name price imageFrontFileId",
        },
        {
          path: "orderHistory.order",
          populate: {
            path: "items.product",
            select: "name price",
          },
        },
      ])
      .select(
        "username email firstName lastName wishlist cart orderHistory role isActive createdAt number",
      )
      .lean();

    console.log(users);
    const formattedUsers = users.map((u) => ({
      _id: u._id,
      name:
        u.username || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "—",
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      orders: u.orderHistory || [],
      createdAt: u.createdAt, // ✅ PASS TO FRONTEND
      phoneNumber: u.number || "—", // ✅ PASS TO FRONTEND
      wishlist:
        u.wishlist?.map((p) => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          image: p.imageFrontFileId
            ? `/api/images/${p.imageFrontFileId}`
            : null,
        })) || [],

      cart:
        u.cart?.map((c) => ({
          _id: c.product?._id,
          name: c.product?.name,
          price: c.product?.price,
          qty: c.qty,
          selectedSize: c.selectedSize,
          image: c.product?.imageFrontFileId
            ? `/api/images/${c.product.imageFrontFileId}`
            : null,
        })) || [],
    }));

    return NextResponse.json(
      { success: true, users: formattedUsers },
      { status: 200 },
    );
  } catch (error) {
    console.error("ADMIN USER LIST ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load users",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
