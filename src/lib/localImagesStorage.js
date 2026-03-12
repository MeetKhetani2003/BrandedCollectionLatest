import fs from "fs";
import path from "path";

/**
 * ABSOLUTE PATH: This tells the server exactly where the folder is.
 * This works even if GitHub moves your code folder.
 */
const BASE_UPLOAD_DIR =
  "/home/u748179017/domains/darkorange-flamingo-321246.hostingersite.com/public_html/uploads/products";

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

  // ✅ RETURN URL: The browser sees public_html as the root "/",
  // so we only return the part after public_html.
  return `/uploads/products/${productId}/${filename}`;
}

export function deleteImage(relativePath) {
  if (!relativePath) return;

  // relativePath looks like: /uploads/products/123/img.jpg
  // We join the root path with the relative path to find the file
  const fullPath = path.join(
    "/home/u748179017/domains/darkorange-flamingo-321246.hostingersite.com/public_html",
    relativePath,
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
