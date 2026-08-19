import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { categories } from "@/lib/products";
import { listProducts } from "@/lib/products.functions";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const products = await listProducts();
        const staticPaths = ["/", "/products", "/about", "/contact", "/faq", "/privacy", "/terms"];
        const catPaths = categories.map((c) => `/category/${c.slug}`);
        const productPaths = products.map((p) => `/product/${p.slug}`);
        const all = [...staticPaths, ...catPaths, ...productPaths];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...all.map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
