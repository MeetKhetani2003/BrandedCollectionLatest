import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import User from "@/models/User";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

/**
 * GET /api/wishlist
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwtDecode(token);

  await connectDb();

  const user = await User.findById(decoded.userId).populate("wishlist");

  return NextResponse.json({
    status: "success",
    wishlist: user.wishlist,
  });
}

/**
 * POST /api/wishlist
 */
export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwtDecode(token);

  await connectDb();

  const user = await User.findById(decoded.userId);

  const { productId } = await request.json();
  if (!productId)
    return NextResponse.json(
      { message: "productId is required" },
      { status: 400 }
    );

  const exists = user.wishlist.some((id) => id.toString() === productId);
  if (!exists) {
    user.wishlist.push(productId);
    await user.save();
  }

  return NextResponse.json({ status: "success" });
}

/**
 * DELETE /api/wishlist
 */
export async function DELETE(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwtDecode(token);

  await connectDb();

  const user = await User.findById(decoded.userId);

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId)
    return NextResponse.json(
      { message: "productId is required" },
      { status: 400 }
    );

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  return NextResponse.json({ status: "success" });
}
