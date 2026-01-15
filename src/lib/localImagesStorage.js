import fs from "fs";
import path from "path";

const BASE_UPLOAD_DIR = "/home/u699308042/domains/lightblue-newt-758999.hostingersite.com/nodeapp/public/uploads/products";

if (!BASE_UPLOAD_DIR) {
  throw new Error("UPLOAD_BASE_PATH env variable is missing");
}

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

  // PUBLIC URL (browser-accessible)
  return `/public/uploads/products/${productId}/${filename}`;
}

export function deleteImage(relativePath) {
  if (!relativePath) return;

  // relativePath = /public/uploads/...
  const fullPath = path.join(
    BASE_UPLOAD_DIR,
    relativePath.replace("/public/uploads/products/", "")
  );

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
