import fs from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "public/uploads/products");

export async function saveImage({ buffer, productId, filename }) {
  // ✅ Lazy import sharp (CRITICAL FIX)
  const sharp = (await import("sharp")).default;

  const dir = path.join(BASE_DIR, productId);
  fs.mkdirSync(dir, { recursive: true });

  const fullPath = path.join(dir, filename);

  await sharp(buffer)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(fullPath);

  return `/uploads/products/${productId}/${filename}`;
}

export function deleteImage(relativePath) {
  if (!relativePath) return;
  const full = path.join(process.cwd(), "public", relativePath);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

export function deleteProductFolder(productId) {
  const dir = path.join(BASE_DIR, productId);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
