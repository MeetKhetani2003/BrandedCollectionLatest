import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Product from "@/models/Products";
import OrderReservation from "@/models/OrderReservation";
import { connectDb } from "@/lib/dbConnect";

/**
 * Helper: Get total reserved quantity for a product/size across all pending reservations
 */
async function getReservedQuantity(productId, size) {
  const reservations = await OrderReservation.aggregate([
    {
      $match: {
        status: "pending",
        expiresAt: { $gt: new Date() }, // Only active reservations
      },
    },
    { $unwind: "$items" },
    {
      $match: {
        "items.product": new (require("mongoose").Types.ObjectId)(productId),
        "items.size": size,
      },
    },
    {
      $group: {
        _id: null,
        totalReserved: { $sum: "$items.qty" },
      },
    },
  ]);

  return reservations.length > 0 ? reservations[0].totalReserved : 0;
}

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

  // ✅ ADD STOCK INFORMATION TO EACH ITEM
  const cartWithStock = await Promise.all(
    safeCart.map(async (item) => {
      const size = item.selectedSize || "General";

      // Get actual stock from Product
      const sizeEntry = item.product.sizes?.find((s) => s.size === size);
      const stockQuantity = sizeEntry ? sizeEntry.quantity : 0;

      // Get reserved quantity (from pending reservations)
      const reservedQty = await getReservedQuantity(
        item.product._id.toString(),
        size,
      );

      // Available = Stock - Reserved
      const available = Math.max(0, stockQuantity - reservedQty);

      console.log(
        `Cart item: ${item.product.name}, Size: ${size}, Stock: ${stockQuantity}, Reserved: ${reservedQty}, Available: ${available}`,
      );

      return {
        productId: item.product._id.toString(),
        name: item.product.name,
        price: item.product.price.current,
        image: item.product.imageFrontFileId
          ? `/api/images/${item.product.imageFrontFileId}`
          : null,
        size: size,
        qty: item.qty,
        // ✅ Stock info for frontend
        stockQuantity: stockQuantity,
        reservedQuantity: reservedQty,
        availableQuantity: available,
        isOutOfStock: available === 0,
      };
    }),
  );

  return NextResponse.json(cartWithStock);
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
      { status: 401 },
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const { productId, size = "General" } = await req.json();

  if (!productId) {
    return NextResponse.json(
      { success: false, message: "productId required" },
      { status: 400 },
    );
  }

  const user = await User.findById(decoded.userId);

  // ✅ STOCK VALIDATION
  const product = await Product.findById(productId);

  if (!product) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 },
    );
  }

  const sizeEntry = product.sizes?.find((s) => s.size === size);

  if (!sizeEntry) {
    return NextResponse.json(
      { success: false, message: `Size ${size} not available` },
      { status: 400 },
    );
  }

  // ✅ CHECK RESERVED QUANTITY (other users who are paying)
  const reservedQty = await getReservedQuantity(productId, size);
  const actualAvailable = sizeEntry.quantity - reservedQty;

  // Check total quantity in cart + requested quantity
  const existing = user.cart.find(
    (i) => i.product.toString() === productId && i.selectedSize === size,
  );

  const currentQtyInCart = existing ? existing.qty : 0;
  const qtyToAdd = 1; // Default qty
  const totalRequested = currentQtyInCart + qtyToAdd;

  if (actualAvailable < totalRequested) {
    return NextResponse.json(
      {
        success: false,
        message: `Only ${actualAvailable} item(s) available. ${reservedQty} reserved by other users.`,
      },
      { status: 400 },
    );
  }

  if (existing) {
    existing.qty += qtyToAdd;
  } else {
    user.cart.push({
      product: productId,
      selectedSize: size,
      qty: qtyToAdd,
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
    (i) => i.product.toString() === productId && i.selectedSize === size,
  );

  if (!item)
    return NextResponse.json({ success: false, msg: "Item not found" });

  // ✅ STOCK VALIDATION when increasing quantity
  if (qty > item.qty) {
    const product = await Product.findById(productId);

    if (product) {
      const sizeEntry = product.sizes?.find((s) => s.size === size);

      if (sizeEntry && sizeEntry.quantity < qty) {
        // Check reserved quantity
        const reservedQty = await getReservedQuantity(productId, size);
        const actualAvailable = sizeEntry.quantity - reservedQty;

        if (actualAvailable < qty) {
          return NextResponse.json(
            {
              success: false,
              message: `Only ${actualAvailable} item(s) available. ${reservedQty} reserved by other users.`,
            },
            { status: 400 },
          );
        }
      }
    }
  }

  if (qty <= 0) {
    user.cart = user.cart.filter(
      (i) => !(i.product.toString() === productId && i.selectedSize === size),
    );
  } else {
    item.qty = qty;
  }

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
    (i) => !(i.product.toString() === productId && i.selectedSize === size),
  );

  await user.save();

  return NextResponse.json({ success: true });
}
