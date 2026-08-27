import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { categories } from "@/lib/products";
import { listProducts } from "@/lib/products.functions";
import { branches } from "@/lib/business";
import { serviceAreas, counties } from "@/lib/seo/geo";
import { SITE_URL as BASE_URL } from "@/lib/seo/config";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const products = await listProducts();
        const staticPaths = [
          "/",
          "/products",
          "/about",
          "/contact",
          "/faq",
          "/privacy",
          "/terms",
          "/branches",
          "/locations",
          "/service-areas",
        ];
        const catPaths = categories.map((c) => `/category/${c.slug}`);
        const productPaths = products.map((p) => `/product/${p.slug}`);
        const branchPaths = branches.map((b) => `/branches/${b.slug}`);
        const locationPaths = counties.map((c) => `/locations/${c.slug}`);
        const serviceAreaPaths = serviceAreas.map((a) => `/service-areas/${a.slug}`);
        const all = [
          ...staticPaths,
          ...catPaths,
          ...productPaths,
          ...branchPaths,
          ...locationPaths,
          ...serviceAreaPaths,
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...all.map(
            (p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`,
          ),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
