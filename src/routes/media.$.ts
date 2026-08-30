import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { readFile, stat } from "node:fs/promises";
import { mimeTypeFor, resolveUploadPath } from "@/lib/media-storage.server";

export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = params._splat ?? "";
        const resolved = resolveUploadPath(splat);
        if (!resolved) return new Response("Not found", { status: 404 });

        try {
          const stats = await stat(resolved);
          if (!stats.isFile()) return new Response("Not found", { status: 404 });
          const buffer = await readFile(resolved);
          return new Response(buffer, {
            headers: {
              "Content-Type": mimeTypeFor(resolved),
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  },
});
