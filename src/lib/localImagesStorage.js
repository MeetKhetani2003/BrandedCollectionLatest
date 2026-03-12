import fs from "fs";
import path from "path";

/**
 * process.cwd() is /home/u748179017/domains/.../nodejs
 * We use ".." to move up and enter "public_html"
 */
const BASE_UPLOAD_DIR = path.join(
  process.cwd(),
  "..",
  "public_html",
  "uploads",
  "products",
);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function saveImage({ buffer, productId, filename }) {
  const productDir = path.join(BASE_UPLOAD_DIR, productId);
  ensureDir(productDir);

  const filePath = path.join(productDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  // ✅ RETURN URL: We remove "/public_html" from the URL
  // because the domain points directly to that folder.
  return `/uploads/products/${productId}/${filename}`;
}

export function deleteImage(relativePath) {
  if (!relativePath) return;

  // relativePath looks like: /uploads/products/123/img.jpg
  // We reconstruct the full path to public_html to delete it
  const fullPath = path.join(process.cwd(), "..", "public_html", relativePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export function deleteProductFolder(productId) {
  const dir = path.join(BASE_UPLOAD_DIR, productId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
