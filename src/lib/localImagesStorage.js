import fs from "fs";
import path from "path";

/**
 * This MUST point to nodeapp/public
 * process.cwd() === /home/.../nodeapp
 */
const BASE_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "products"
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

  // URL that browser can access
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
  const dir = path.join(BASE_UPLOAD_DIR, productId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
