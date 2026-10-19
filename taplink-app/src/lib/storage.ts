import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import sharp from "sharp";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveAvatar(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("File too large. Maximum size is 5 MB.");
  }

  await ensureUploadDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${nanoid()}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Re-encode and resize to strip metadata and enforce dimensions
  await sharp(buffer)
    .resize(400, 400, { fit: "cover", position: "center" })
    .webp({ quality: 85 })
    .toFile(filepath);

  return `/uploads/${filename}`;
}

export async function deleteFile(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const filename = path.basename(url);
  const filepath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filepath);
  } catch {
    // File may not exist; ignore
  }
}
