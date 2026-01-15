import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbConnect";
import { deleteFromGridFs } from "@/lib/gridFsClient";
import Products from "@/models/Products";

export async function DELETE(req) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const fileId = searchParams.get("fileId");
    const type = searchParams.get("type"); // front | back | gallery

    if (!productId || !fileId || !type) {
      return NextResponse.json(
        { message: "productId, fileId and type are required" },
        { status: 400 }
      );
    }

    const product = await Products.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // 🔥 Remove reference from product
    if (type === "front") {
      product.imageFrontFileId = undefined;
      product.imageFrontFilename = undefined;
    }

    if (type === "back") {
      product.imageBackFileId = undefined;
      product.imageBackFilename = undefined;
    }

    if (type === "gallery") {
      product.gallery = product.gallery.filter(
        (img) => img.fileId.toString() !== fileId
      );
    }

    await product.save(); // ✅ now safe

    // 🔥 Delete file from GridFS
    await deleteFromGridFs(new mongoose.Types.ObjectId(fileId));

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("DELETE IMAGE ERROR:", error);
    return NextResponse.json(
      { message: "Failed to delete image", error: error.message },
      { status: 500 }
    );
  }
}
