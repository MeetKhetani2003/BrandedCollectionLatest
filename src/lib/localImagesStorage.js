import fs from "fs";
import path from "path";

const PUBLIC_HTML =
  "/home/u748179017/domains/brandedcollections.in/public_html";
const BASE_UPLOAD_DIR = path.join(PUBLIC_HTML, "uploads", "products");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function saveImage({ buffer, productId, filename }) {
  const productDir = path.join(BASE_UPLOAD_DIR, productId);
  ensureDir(productDir);

  const filePath = path.join(productDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  // public_html/uploads is publicly reachable as /uploads
  return `/uploads/products/${productId}/${filename}`;
}

export function deleteImage(relativePath) {
  if (!relativePath) return;

  // expects relativePath like "/uploads/products/..../file.jpg"
  const safeRelative = relativePath.replace(/^\/+/, "");
  const fullPath = path.join(PUBLIC_HTML, safeRelative);

  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

export function deleteProductFolder(productId) {
  const folderPath = path.join(BASE_UPLOAD_DIR, productId);

  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}
