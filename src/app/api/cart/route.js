import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import Products from "@/models/Products";
import User from "@/models/User";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
/**
 * GET /api/cart
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwtDecode(token);
  console.log(decoded);

  await connectDb();

  const populatedUser = await User.findById(decoded.userId).populate(
    "cart.product"
  );
  const items = populatedUser.cart.map((item) => ({
    _id: item.product._id,
    name: item.product.name,
    qty: item.qty,
    selectedSize: item.size, // ← FINAL
    price: item.product.price,
    imageFront: item.product.imageFront,
  }));
  console.log(items);

  return NextResponse.json({ status: "success", cart: items });
}

/**
 * POST /api/cart
 */
export async function POST(req) {
  try {
    await connectDb();

    const cookieStore = await cookies(); // 👈 required now
    const token = cookieStore.get("auth")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { productId, qty, size } = await req.json();

    const user = await User.findById(decoded.userId);

    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    const exists = user.cart.find(
      (i) => i.product.toString() === productId && i.size === size
    );

    if (exists) {
      exists.qty += qty;
    } else {
      user.cart.push({ product: productId, qty, size });
    }

    await user.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cart
 */
export async function PATCH(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwtDecode(token);

  await connectDb();
  const user = await User.findById(decoded.userId);

  const { productId, selectedSize, qty } = await request.json();

  if (!productId || typeof qty !== "number")
    return NextResponse.json(
      { message: "productId & qty required" },
      { status: 400 }
    );

  const index = user.cart.findIndex(
    (item) =>
      item.product.toString() === productId && item.size === selectedSize
  );

  if (index === -1)
    return NextResponse.json({ message: "Item not found" }, { status: 404 });

  if (qty <= 0) user.cart.splice(index, 1);
  else user.cart[index].qty = qty;

  await user.save();

  return NextResponse.json({ status: "success" });
}

/**
 * DELETE /api/cart
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
  const selectedSize = searchParams.get("size");

  if (!productId)
    return NextResponse.json(
      { message: "productId required" },
      { status: 400 }
    );

  user.cart = user.cart.filter(
    (item) =>
      !(item.product.toString() === productId && item.size === selectedSize)
  );

  await user.save();

  return NextResponse.json({ status: "success" });
}
