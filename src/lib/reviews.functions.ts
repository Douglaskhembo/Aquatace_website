import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db.server";

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ReviewsSummary {
  count: number;
  avg: number;
}

interface ReviewRow {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

const REVIEW_SELECT = "id, customer_name, rating, comment, created_at";

const ListReviewsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(20).default(5),
});

// Real reviews always take priority. Fabricated (is_seed) rows only pad the
// first page when there aren't enough real reviews yet, and never appear on
// later pages — so once 5 real reviews exist, seed rows stop showing at all.
export const listReviews = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => ListReviewsSchema.parse(input))
  .handler(async ({ data }) => {
    const db = getDb();
    const offset = (data.page - 1) * data.pageSize;

    const [{ rows: realRows }, { rows: countRows }, { rows: summaryRows }] = await Promise.all([
      db.query<ReviewRow>(
        `SELECT ${REVIEW_SELECT} FROM reviews WHERE is_seed = false
         ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [data.pageSize, offset],
      ),
      db.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM reviews WHERE is_seed = false`,
      ),
      db.query<{
        real_count: string;
        real_avg: string | null;
        seed_count: string;
        seed_avg: string | null;
      }>(
        `SELECT
           COUNT(*) FILTER (WHERE is_seed = false)::text AS real_count,
           AVG(rating) FILTER (WHERE is_seed = false)::text AS real_avg,
           COUNT(*) FILTER (WHERE is_seed = true)::text AS seed_count,
           AVG(rating) FILTER (WHERE is_seed = true)::text AS seed_avg
         FROM reviews`,
      ),
    ]);

    let rows = realRows;
    if (data.page === 1 && rows.length < data.pageSize) {
      const need = data.pageSize - rows.length;
      const { rows: seedRows } = await db.query<ReviewRow>(
        `SELECT ${REVIEW_SELECT} FROM reviews WHERE is_seed = true
         ORDER BY created_at DESC LIMIT $1`,
        [need],
      );
      rows = [...rows, ...seedRows];
    }

    const realTotal = parseInt(countRows[0]?.count ?? "0", 10);
    const s = summaryRows[0];
    const realCount = parseInt(s?.real_count ?? "0", 10);
    const summary: ReviewsSummary =
      realCount > 0
        ? { count: realCount, avg: parseFloat(s?.real_avg ?? "0") }
        : { count: parseInt(s?.seed_count ?? "0", 10), avg: parseFloat(s?.seed_avg ?? "0") };

    return {
      reviews: rows.map(toReview),
      hasMore: offset + data.pageSize < realTotal,
      summary,
    };
  });

const CreateReviewSchema = z.object({
  order_number: z.string().trim().max(50).optional(),
  customer_name: z.string().trim().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const createReview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateReviewSchema.parse(input))
  .handler(async ({ data }): Promise<Review> => {
    const db = getDb();

    let orderId: string | null = null;
    if (data.order_number) {
      const { rows } = await db.query<{ id: string }>(
        `SELECT id FROM orders WHERE order_number = $1`,
        [data.order_number],
      );
      orderId = rows[0]?.id ?? null;
    }

    try {
      const { rows } = await db.query<ReviewRow>(
        `INSERT INTO reviews (order_id, customer_name, rating, comment, is_seed)
         VALUES ($1, $2, $3, $4, false)
         RETURNING ${REVIEW_SELECT}`,
        [orderId, data.customer_name, data.rating, data.comment || null],
      );
      return toReview(rows[0]);
    } catch (e) {
      if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "23505") {
        throw new Error("You've already left feedback for this order.");
      }
      throw e;
    }
  });
