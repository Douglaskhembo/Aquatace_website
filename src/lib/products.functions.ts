import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { requireAdminRole } from "@/lib/admin-middleware";
import { getDb } from "./db.server";
import type { CategorySlug, Product } from "./products";

const PRODUCT_SELECT = `id, slug, name, category, brand, price_kes, size, product_type, description,
  specs, featured, badge, image_url, image_path, in_stock, sort_order`;

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  brand: string;
  price_kes: number;
  size: string | null;
  product_type: string | null;
  description: string;
  specs: { label: string; value: string }[];
  featured: boolean;
  badge: string | null;
  image_url: string | null;
  image_path: string | null;
  in_stock: boolean;
  sort_order: number;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    brand: row.brand,
    price: row.price_kes,
    size: row.size ?? undefined,
    productType: row.product_type ?? undefined,
    description: row.description,
    specs: row.specs,
    featured: row.featured,
    badge: row.badge ?? undefined,
    image: row.image_url ?? undefined,
    imagePath: row.image_path ?? undefined,
    active: row.in_stock,
    sortOrder: row.sort_order,
  };
}

export const listProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const db = getDb();
    const { rows } = await db.query<ProductRow>(
      `SELECT ${PRODUCT_SELECT} FROM products WHERE in_stock = true ORDER BY sort_order`,
    );
    return rows.map(toProduct);
  },
);

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async (): Promise<Product[]> => {
    const db = getDb();
    const { rows } = await db.query<ProductRow>(
      `SELECT ${PRODUCT_SELECT} FROM products ORDER BY sort_order`,
    );
    return rows.map(toProduct);
  });

const SpecSchema = z.object({ label: z.string().trim().min(1), value: z.string().trim().min(1) });

const ProductInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  name: z.string().trim().min(1).max(200),
  category: z.enum(["water", "gas", "electronics"]),
  brand: z.string().trim().min(1).max(100),
  price: z.number().positive(),
  size: z.string().trim().max(50).optional().or(z.literal("")),
  productType: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().max(2000).default(""),
  specs: z.array(SpecSchema).max(20).default([]),
  featured: z.boolean().default(false),
  badge: z.string().trim().max(50).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imagePath: z.string().max(500).optional().or(z.literal("")),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((input: unknown) => ProductInputSchema.parse(input))
  .handler(async ({ data }): Promise<Product> => {
    const db = getDb();
    const { rows } = await db.query<ProductRow>(
      `INSERT INTO products
        (slug, name, category, brand, price_kes, size, product_type, description, specs,
         featured, badge, image_url, image_path, in_stock, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING ${PRODUCT_SELECT}`,
      [
        data.slug,
        data.name,
        data.category,
        data.brand,
        data.price,
        data.size || null,
        data.productType || null,
        data.description,
        JSON.stringify(data.specs),
        data.featured,
        data.badge || null,
        data.imageUrl || null,
        data.imagePath || null,
        data.active,
        data.sortOrder,
      ],
    );
    return toProduct(rows[0]);
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((input: unknown) =>
    z.object({ id: z.string().min(1), product: ProductInputSchema }).parse(input),
  )
  .handler(async ({ data }): Promise<Product> => {
    const db = getDb();
    const p = data.product;
    const { rows } = await db.query<ProductRow>(
      `UPDATE products SET
         slug = $1, name = $2, category = $3, brand = $4, price_kes = $5, size = $6,
         product_type = $7, description = $8, specs = $9, featured = $10, badge = $11,
         image_url = $12, image_path = $13, in_stock = $14, sort_order = $15
       WHERE id = $16
       RETURNING ${PRODUCT_SELECT}`,
      [
        p.slug,
        p.name,
        p.category,
        p.brand,
        p.price,
        p.size || null,
        p.productType || null,
        p.description,
        JSON.stringify(p.specs),
        p.featured,
        p.badge || null,
        p.imageUrl || null,
        p.imagePath || null,
        p.active,
        p.sortOrder,
        data.id,
      ],
    );
    if (!rows[0]) throw new Error("Product not found.");
    return toProduct(rows[0]);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<{ imagePath: string | null }> => {
    const db = getDb();
    const { rows } = await db.query<{ image_path: string | null }>(
      `DELETE FROM products WHERE id = $1 RETURNING image_path`,
      [data.id],
    );
    return { imagePath: rows[0]?.image_path ?? null };
  });

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
  staleTime: 5 * 60 * 1000,
});
