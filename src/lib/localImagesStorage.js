import fs from "fs";
import path from "path";

const UPLOAD_DIR =
  process.env.NODE_ENV === "production"
    ? "/home/u699308042/domains/lightblue-newt-758999.hostingersite.com/nodeapp/uploads"
    : path.join(process.cwd(), "uploads");

export async function saveImage({ buffer, productId, filename }) {
  const dir = path.join(UPLOAD_DIR, productId);
  fs.mkdirSync(dir, { recursive: true });

  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, buffer);

  return `/uploads/${productId}/${filename}`;
}

export function deleteProductFolder(productId) {
  const dir = path.join(UPLOAD_DIR, productId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
