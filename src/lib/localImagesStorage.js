import fs from "fs";
import path from "path";

/**
 * process.cwd() === /home/.../nodeapp
 * Files go into: nodeapp/public/uploads/products
 * Public URL:     /public/uploads/products
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

  // ✅ MUST match Hostinger public URL
  return `/public/uploads/products/${productId}/${filename}`;
}

export function deleteImage(relativePath) {
  if (!relativePath) return;

  // relativePath already starts with /public/...
  const fullPath = path.join(process.cwd(), relativePath);
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
