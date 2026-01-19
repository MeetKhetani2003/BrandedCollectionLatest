export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

import { NextResponse } from "next/server";
import Product from "@/models/Products";
import {
  saveImage,
  deleteImage,
  deleteProductFolder,
} from "@/lib/localImagesStorage";
import { connectDb } from "@/lib/dbConnect";

/** ---------- GET PRODUCTS ---------- */
export async function GET(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);

  const mainCategory = searchParams.get("mainCategory");
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const size = searchParams.get("size");
  const featured = searchParams.get("featured");
  const search = searchParams.get("search");

  const minPriceRaw = searchParams.get("minPrice");
  const maxPriceRaw = searchParams.get("maxPrice");

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);
  const skip = (page - 1) * limit;

  /* ---------------- QUERY BUILD ---------------- */

  const query = {};

  if (mainCategory) query.mainCategory = mainCategory;
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;

  if (featured === "true") query.featured = true;

  if (size) {
    query.sizes = {
      $elemMatch: { size, quantity: { $gt: 0 } },
    };
  }

  const minPrice = Number(minPriceRaw);
  const maxPrice = Number(maxPriceRaw);

  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    query["price.current"] = {};

    if (!Number.isNaN(minPrice)) {
      query["price.current"].$gte = minPrice;
    }

    if (!Number.isNaN(maxPrice) && maxPrice > 0) {
      query["price.current"].$lte = maxPrice;
    }

    // 🛑 safety: if object stayed empty, remove it
    if (Object.keys(query["price.current"]).length === 0) {
      delete query["price.current"];
    }
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { subcategory: { $regex: search, $options: "i" } },
    ];
  }

  /* ---------------- DB FETCH ---------------- */

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),

    Product.countDocuments(query),
  ]);

  return NextResponse.json({
    products,
    hasMore: skip + products.length < total,
    total,
  });
}

/** ---------- CREATE PRODUCT ---------- */
export async function POST(req) {
  try {
    await connectDb();
    const formData = await req.formData();
    const productData = JSON.parse(formData.get("productData"));

    // 1. Create empty product WITHOUT required image
    const product = new Product(productData);
    const productId = product._id.toString();

    // 2. Save front image
    const frontFile = formData.get("imageFront");
    if (!frontFile || frontFile.size === 0) {
      return NextResponse.json(
        { error: "Front image required" },
        { status: 400 },
      );
    }

    product.imageFrontPath = await saveImage({
      buffer: Buffer.from(await frontFile.arrayBuffer()),
      productId,
      filename: "front.webp",
    });

    // 3. Save back image if exists
    const backFile = formData.get("imageBack");
    if (backFile && backFile.size > 0) {
      product.imageBackPath = await saveImage({
        buffer: Buffer.from(await backFile.arrayBuffer()),
        productId,
        filename: "back.webp",
      });
    }

    // 4. Save gallery images
    const galleryFiles = formData.getAll("galleryImages");
    let index = 1;
    product.gallery = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        const path = await saveImage({
          buffer: Buffer.from(await file.arrayBuffer()),
          productId,
          filename: `gallery-${index++}.webp`,
        });
        product.gallery.push({ path });
      }
    }

    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.log(error);
  }
}

/* ---------------------------------- */
/* -------- UPDATE PRODUCT ----------- */
/* ---------------------------------- */
export async function PUT(req) {
  await connectDb();

  const formData = await req.formData();
  const identifier = formData.get("productId"); // slug OR id

  const updates = JSON.parse(formData.get("productData"));

  if (!identifier) {
    return NextResponse.json(
      { error: "Product identifier missing" },
      { status: 400 },
    );
  }

  /* ✅ STEP 1: FIND PRODUCT FIRST */
  const product = await Product.findOne({ slug: identifier });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const productId = product._id.toString();

  /* ✅ STEP 2: UPDATE FIELDS */
  Object.assign(product, updates);

  /* ---------- FRONT IMAGE ---------- */
  const frontFile = formData.get("imageFront");
  if (frontFile && frontFile.size > 0) {
    if (product.imageFrontPath) deleteImage(product.imageFrontPath);

    product.imageFrontPath = await saveImage({
      buffer: Buffer.from(await frontFile.arrayBuffer()),
      productId,
      filename: "front.webp",
    });
  }

  /* ---------- BACK IMAGE ----------- */
  const backFile = formData.get("imageBack");
  if (backFile && backFile.size > 0) {
    if (product.imageBackPath) deleteImage(product.imageBackPath);

    product.imageBackPath = await saveImage({
      buffer: Buffer.from(await backFile.arrayBuffer()),
      productId,
      filename: "back.webp",
    });
  }

  /* ---------- GALLERY -------------- */
  const galleryFiles = formData.getAll("galleryImages");
  if (galleryFiles.length > 0) {
    if (product.gallery?.length) {
      product.gallery.forEach((img) => img.path && deleteImage(img.path));
    }

    product.gallery = [];
    let index = 1;

    for (const file of galleryFiles) {
      if (file.size > 0) {
        const path = await saveImage({
          buffer: Buffer.from(await file.arrayBuffer()),
          productId,
          filename: `gallery-${index++}.webp`,
        });
        product.gallery.push({ path });
      }
    }
  }

  await product.save();
  return NextResponse.json({ success: true, product });
}

/* ---------------------------------- */
/* -------- DELETE PRODUCT ----------- */
/* ---------------------------------- */
export async function DELETE(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const identifier = searchParams.get("id");

  if (!identifier) {
    return NextResponse.json(
      { error: "Product identifier missing" },
      { status: 400 },
    );
  }

  /* ✅ FIND FIRST */
  const product = await Product.findById(identifier);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  deleteProductFolder(product._id.toString());
  await product.deleteOne();

  return NextResponse.json({ success: true });
}
