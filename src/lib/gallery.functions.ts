import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAdminRole } from "@/lib/admin-middleware";

const GALLERY_COLUMNS = "id,image_url,image_path,alt_text,caption,sort_order";

export interface GalleryImage {
  id: string;
  imageUrl: string;
  imagePath: string | null;
  altText: string;
  caption: string | null;
  sortOrder: number;
}

interface GalleryRow {
  id: string;
  image_url: string;
  image_path: string | null;
  alt_text: string;
  caption: string | null;
  sort_order: number;
}

function toGalleryImage(row: GalleryRow): GalleryImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    imagePath: row.image_path,
    altText: row.alt_text,
    caption: row.caption,
    sortOrder: row.sort_order,
  };
}

function anonClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const listGalleryImages = createServerFn({ method: "GET" }).handler(
  async (): Promise<GalleryImage[]> => {
    const supa = anonClient();
    const { data, error } = await supa.from("gallery_images").select(GALLERY_COLUMNS).order("sort_order");
    if (error) throw new Error(error.message);
    return ((data ?? []) as GalleryRow[]).map(toGalleryImage);
  },
);

export const adminListGalleryImages = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async (): Promise<GalleryImage[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("gallery_images")
      .select(GALLERY_COLUMNS)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return ((data ?? []) as GalleryRow[]).map(toGalleryImage);
  });

const GalleryInputSchema = z.object({
  imageUrl: z.string().trim().url(),
  imagePath: z.string().trim().max(500).optional().or(z.literal("")),
  altText: z.string().trim().max(200).default(""),
  caption: z.string().trim().max(500).optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
});

export const createGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .inputValidator((input: unknown) => GalleryInputSchema.parse(input))
  .handler(async ({ data }): Promise<GalleryImage> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("gallery_images")
      .insert({
        image_url: data.imageUrl,
        image_path: data.imagePath || null,
        alt_text: data.altText,
        caption: data.caption || null,
        sort_order: data.sortOrder,
      })
      .select(GALLERY_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return toGalleryImage(row as GalleryRow);
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<{ imagePath: string | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error: selErr } = await supabaseAdmin
      .from("gallery_images")
      .select("image_path")
      .eq("id", data.id)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);
    const { error } = await supabaseAdmin.from("gallery_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { imagePath: row?.image_path ?? null };
  });
