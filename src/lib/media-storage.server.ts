import { mkdir } from "node:fs/promises";
import path from "node:path";

export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export function mimeTypeFor(filePath: string): string {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

export function isAllowedExtension(filePath: string): boolean {
  return path.extname(filePath).toLowerCase() in MIME_TYPES;
}

/**
 * Resolves a user-supplied relative path against UPLOADS_DIR, rejecting any
 * path that escapes it (e.g. via `../`).
 */
export function resolveUploadPath(relativePath: string): string | null {
  const resolved = path.resolve(UPLOADS_DIR, relativePath);
  const base = path.resolve(UPLOADS_DIR) + path.sep;
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

export async function ensureUploadDir(subfolder: string): Promise<string> {
  const dir = path.join(UPLOADS_DIR, subfolder);
  await mkdir(dir, { recursive: true });
  return dir;
}
