import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { rm } from "node:fs/promises";
import { verifyAdminToken } from "@/lib/auth.server";
import { resolveUploadPath } from "@/lib/media-storage.server";

export const Route = createFileRoute("/api/media/delete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        const claims = token ? await verifyAdminToken(token) : null;
        if (!claims) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const body = (await request.json().catch(() => null)) as { path?: string } | null;
        if (!body?.path) {
          return new Response(JSON.stringify({ error: "Missing path" }), { status: 400 });
        }

        const resolved = resolveUploadPath(body.path);
        if (!resolved) {
          return new Response(JSON.stringify({ error: "Invalid path" }), { status: 400 });
        }

        await rm(resolved, { force: true });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
