import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { verifyAdminToken } from "@/lib/auth.server";
import { ensureUploadDir, isAllowedExtension } from "@/lib/media-storage.server";

const ALLOWED_FOLDERS = new Set(["products", "gallery"]);

export const Route = createFileRoute("/api/media/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        const claims = token ? await verifyAdminToken(token) : null;
        if (!claims) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const form = await request.formData();
        const file = form.get("file");
        const folder = form.get("folder");

        if (!(file instanceof File) || typeof folder !== "string" || !ALLOWED_FOLDERS.has(folder)) {
          return new Response(JSON.stringify({ error: "Invalid upload" }), { status: 400 });
        }

        const ext = path.extname(file.name) || ".bin";
        const filename = `${randomUUID()}${ext}`;
        if (!isAllowedExtension(filename)) {
          return new Response(JSON.stringify({ error: "Unsupported file type" }), { status: 400 });
        }

        const dir = await ensureUploadDir(folder);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(dir, filename), buffer);

        const relativePath = `${folder}/${filename}`;
        return new Response(JSON.stringify({ url: `/media/${relativePath}`, path: relativePath }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
