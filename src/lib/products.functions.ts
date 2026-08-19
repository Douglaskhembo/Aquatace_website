import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { requireAdminRole } from "@/lib/admin-middleware";
import type { CategorySlug, Product } from "./products";

const PRODUCT_COLUMNS =
  "id,slug,name,category,brand,price_kes,size,product_type,description,specs,featured,badge,image_url,image_path,in_stock,sort_order";

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

function anonClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const listProducts = createServerFn({ method: "GET" }).handler(async (): Promise<Product[]> => {
  const supa = anonClient();
  const { data, error } = await supa
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("in_stock", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return ((data ?? []) as ProductRow[]).map(toProduct);
});

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async (): Promise<Product[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return ((data ?? []) as ProductRow[]).map(toProduct);
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

function toRow(input: z.infer<typeof ProductInputSchema>) {
  return {
    slug: input.slug,
    name: input.name,
    category: input.category,
    brand: input.brand,
    price_kes: input.price,
    size: input.size || null,
    product_type: input.productType || null,
    description: input.description,
    specs: input.specs,
    featured: input.featured,
    badge: input.badge || null,
    image_url: input.imageUrl || null,
    image_path: input.imagePath || null,
    in_stock: input.active,
    sort_order: input.sortOrder,
  };
}

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((input: unknown) => ProductInputSchema.parse(input))
  .handler(async ({ data }): Promise<Product> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .insert({ id: crypto.randomUUID(), ...toRow(data) })
      .select(PRODUCT_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return toProduct(row as ProductRow);
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((input: unknown) =>
    z.object({ id: z.string().min(1), product: ProductInputSchema }).parse(input),
  )
  .handler(async ({ data }): Promise<Product> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .update(toRow(data.product))
      .eq("id", data.id)
      .select(PRODUCT_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return toProduct(row as ProductRow);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<{ imagePath: string | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error: selErr } = await supabaseAdmin
      .from("products")
      .select("image_path")
      .eq("id", data.id)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { imagePath: row?.image_path ?? null };
  });

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
  staleTime: 5 * 60 * 1000,
});
