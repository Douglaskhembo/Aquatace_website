import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminRole } from "@/lib/admin-middleware";
import { getDb } from "./db.server";

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

const GALLERY_SELECT = "id, image_url, image_path, alt_text, caption, sort_order";

export const listGalleryImages = createServerFn({ method: "GET" }).handler(
  async (): Promise<GalleryImage[]> => {
    const db = getDb();
    const { rows } = await db.query<GalleryRow>(
      `SELECT ${GALLERY_SELECT} FROM gallery_images ORDER BY sort_order`,
    );
    return rows.map(toGalleryImage);
  },
);

export const adminListGalleryImages = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async (): Promise<GalleryImage[]> => {
    const db = getDb();
    const { rows } = await db.query<GalleryRow>(
      `SELECT ${GALLERY_SELECT} FROM gallery_images ORDER BY sort_order`,
    );
    return rows.map(toGalleryImage);
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
    const db = getDb();
    const { rows } = await db.query<GalleryRow>(
      `INSERT INTO gallery_images (image_url, image_path, alt_text, caption, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${GALLERY_SELECT}`,
      [data.imageUrl, data.imagePath || null, data.altText, data.caption || null, data.sortOrder],
    );
    return toGalleryImage(rows[0]);
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<{ imagePath: string | null }> => {
    const db = getDb();
    const { rows } = await db.query<{ image_path: string | null }>(
      `DELETE FROM gallery_images WHERE id = $1 RETURNING image_path`,
      [data.id],
    );
    return { imagePath: rows[0]?.image_path ?? null };
  });
