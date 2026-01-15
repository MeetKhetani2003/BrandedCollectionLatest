import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDb } from "@/lib/dbConnect";

/* =========================
   GET CART
========================= */
export async function GET() {
  await connectDb();

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return NextResponse.json([]);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId).populate("cart.product");

  // 🔥 FILTER OUT BROKEN CART ITEMS
  const safeCart = user.cart.filter((item) => item.product);

  // 🔥 OPTIONAL: auto-clean DB
  if (safeCart.length !== user.cart.length) {
    user.cart = safeCart;
    await user.save();
  }

  return NextResponse.json(
    safeCart.map((item) => ({
      productId: item.product._id.toString(),
      name: item.product.name,
      price: item.product.price.current,
      image: item.product.imageFrontFileId
        ? `/api/images/${item.product.imageFrontFileId}`
        : null,
      size: item.selectedSize || "General",
      qty: item.qty,
    }))
  );
}

/* =========================
   ADD / UPDATE
========================= */
export async function POST(req) {
  await connectDb();

  const cookieStore = await cookies(); // ✅ FIX
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Login Required" },
      { status: 401 }
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const { productId, size = "General" } = await req.json();

  if (!productId) {
    return NextResponse.json(
      { success: false, message: "productId required" },
      { status: 400 }
    );
  }

  const user = await User.findById(decoded.userId);

  const existing = user.cart.find(
    (i) => i.product.toString() === productId && i.selectedSize === size
  );

  if (existing) {
    existing.qty += 1;
  } else {
    user.cart.push({
      product: productId,
      selectedSize: size,
      qty: 1,
    });
  }

  await user.save();

  return NextResponse.json({ success: true });
}

/* =========================
   UPDATE QTY
========================= */
export async function PATCH(req) {
  await connectDb();

  const cookieStore = await cookies(); // ✅ FIX
  const token = cookieStore.get("auth")?.value;

  if (!token) return NextResponse.json({ success: false }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const size = searchParams.get("size");
  const { qty } = await req.json();

  const user = await User.findById(decoded.userId);

  const item = user.cart.find(
    (i) => i.product.toString() === productId && i.selectedSize === size
  );

  if (!item)
    return NextResponse.json({ success: false, msg: "Item not found" });

  item.qty = qty;
  await user.save();

  return NextResponse.json({ success: true });
}

/* =========================
   REMOVE
========================= */
export async function DELETE(req) {
  await connectDb();

  const cookieStore = await cookies(); // ✅ FIX
  const token = cookieStore.get("auth")?.value;

  if (!token) return NextResponse.json({ success: false }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const size = searchParams.get("size");

  const user = await User.findById(decoded.userId);

  user.cart = user.cart.filter(
    (i) => !(i.product.toString() === productId && i.selectedSize === size)
  );

  await user.save();

  return NextResponse.json({ success: true });
}
