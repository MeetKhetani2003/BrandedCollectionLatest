import fs from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "public/uploads/products");

export async function saveImage({ buffer, productId, filename }) {
  const dir = path.join(BASE_DIR, productId);

  // ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fullPath = path.join(dir, filename);

  // write file directly
  fs.writeFileSync(fullPath, buffer);

  return `/uploads/products/${productId}/${filename}`;
}

export function deleteImage(relativePath) {
  if (!relativePath) return;

  const fullPath = path.join(process.cwd(), "public", relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export function deleteProductFolder(productId) {
  const dir = path.join(BASE_DIR, productId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
