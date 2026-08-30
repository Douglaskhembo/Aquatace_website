import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db.server";

const CartLineSchema = z.object({
  product_id: z.string().min(1).max(100),
  product_name: z.string().min(1).max(200),
  category: z.string().max(50).optional(),
  unit_price_kes: z.number().nonnegative(),
  quantity: z.number().int().min(1).max(999),
});

const LocationSchema = z.object({
  address: z.string().min(3).max(500),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  landmark: z.string().trim().max(200).optional(),
});

const CreateOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(30)
      .regex(/^\+?[\d\s-]+$/),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),
  }),
  delivery: LocationSchema,
  notes: z.string().max(1000).optional(),
  items: z.array(CartLineSchema).min(1).max(50),
  branch_override_id: z.string().uuid().optional(),
});

interface BranchRow {
  id: string;
  name: string;
  area: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  offer_note?: string | null;
}

const ACTIVE_BRANCHES_SQL = `SELECT id, name, area, latitude, longitude, phone, whatsapp, email, offer_note
  FROM branches WHERE active = true`;

export const assignNearestBranch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ lat: z.number().gte(-90).lte(90), lng: z.number().gte(-180).lte(180) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { haversineKm } = await import("./haversine");
    const db = getDb();
    const { rows: branches } = await db.query<BranchRow>(ACTIVE_BRANCHES_SQL);
    if (!branches || branches.length === 0) throw new Error("No active branches available.");

    // Try Google Routes API compute matrix
    let best: {
      branch: (typeof branches)[number];
      distance_km: number;
      duration_min: number;
    } | null = null;
    try {
      const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
      const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
      if (LOVABLE_API_KEY && GOOGLE_MAPS_API_KEY) {
        const res = await fetch(
          "https://connector-gateway.lovable.dev/google_maps/routes/distanceMatrix/v2:computeRouteMatrix",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
              "Content-Type": "application/json",
              "X-Goog-FieldMask": "originIndex,destinationIndex,distanceMeters,duration,status",
            },
            body: JSON.stringify({
              origins: [
                { waypoint: { location: { latLng: { latitude: data.lat, longitude: data.lng } } } },
              ],
              destinations: branches.map((b) => ({
                waypoint: {
                  location: { latLng: { latitude: b.latitude, longitude: b.longitude } },
                },
              })),
              travelMode: "DRIVE",
              routingPreference: "TRAFFIC_UNAWARE",
            }),
          },
        );
        if (res.ok) {
          const rows = (await res.json()) as Array<{
            destinationIndex: number;
            distanceMeters?: number;
            duration?: string;
            status?: { code?: number };
          }>;
          for (const row of rows) {
            if (row.status?.code && row.status.code !== 0) continue;
            if (typeof row.distanceMeters !== "number") continue;
            const km = row.distanceMeters / 1000;
            const dur = row.duration ? parseFloat(row.duration) / 60 : km * 2;
            const branch = branches[row.destinationIndex];
            if (!branch) continue;
            if (!best || km < best.distance_km)
              best = { branch, distance_km: km, duration_min: dur };
          }
        } else {
          console.warn("Routes API failed", res.status, await res.text().catch(() => ""));
        }
      }
    } catch (e) {
      console.warn("Routes API error, falling back to haversine", e);
    }

    if (!best) {
      // Haversine fallback
      for (const b of branches) {
        const km = haversineKm(
          { lat: data.lat, lng: data.lng },
          { lat: b.latitude, lng: b.longitude },
        );
        if (!best || km < best.distance_km)
          best = { branch: b, distance_km: km, duration_min: km * 3 };
      }
    }

    // Out-of-coverage fallback: if the nearest branch is farther than 15km,
    // route the order to the Membley main branch.
    const OUT_OF_COVERAGE_KM = 15;
    if (best && best.distance_km > OUT_OF_COVERAGE_KM) {
      const membley = branches.find((b) => /membley/i.test(b.name));
      if (membley && membley.id !== best.branch.id) {
        const km = haversineKm(
          { lat: data.lat, lng: data.lng },
          { lat: membley.latitude, lng: membley.longitude },
        );
        best = { branch: membley, distance_km: km, duration_min: km * 3 };
      }
    }

    return {
      branch: best!.branch,
      distance_km: Math.round(best!.distance_km * 10) / 10,
      duration_min: Math.round(best!.duration_min),
      all_branches: branches,
    };
  });

function generateOrderNumber(): string {
  const now = new Date();
  const ymd = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(
    now.getUTCDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `AQT-${ymd}-${rand}`;
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const { haversineKm } = await import("./haversine");
    const pool = getDb();
    const { rows: branches } = await pool.query<BranchRow>(
      `SELECT id, name, area, latitude, longitude, phone, whatsapp, email FROM branches WHERE active = true`,
    );
    if (!branches || branches.length === 0) throw new Error("No branches available.");

    // Determine assigned branch
    let assigned = branches[0];
    let bestKm = Infinity;
    if (data.branch_override_id) {
      const found = branches.find((b) => b.id === data.branch_override_id);
      if (found) {
        assigned = found;
        bestKm = haversineKm(
          { lat: data.delivery.lat, lng: data.delivery.lng },
          { lat: found.latitude, lng: found.longitude },
        );
      }
    } else {
      for (const b of branches) {
        const km = haversineKm(
          { lat: data.delivery.lat, lng: data.delivery.lng },
          { lat: b.latitude, lng: b.longitude },
        );
        if (km < bestKm) {
          bestKm = km;
          assigned = b;
        }
      }
      // Out-of-coverage fallback → Membley main branch.
      const OUT_OF_COVERAGE_KM = 15;
      if (bestKm > OUT_OF_COVERAGE_KM) {
        const membley = branches.find((b) => /membley/i.test(b.name));
        if (membley) {
          assigned = membley;
          bestKm = haversineKm(
            { lat: data.delivery.lat, lng: data.delivery.lng },
            { lat: membley.latitude, lng: membley.longitude },
          );
        }
      }
    }

    // Try to enrich with Routes API duration
    let durationMin = Math.round(bestKm * 3);
    try {
      const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
      const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
      if (LOVABLE_API_KEY && GOOGLE_MAPS_API_KEY) {
        const r = await fetch(
          "https://connector-gateway.lovable.dev/google_maps/routes/directions/v2:computeRoutes",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
              "Content-Type": "application/json",
              "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
            },
            body: JSON.stringify({
              origin: {
                location: {
                  latLng: { latitude: assigned.latitude, longitude: assigned.longitude },
                },
              },
              destination: {
                location: { latLng: { latitude: data.delivery.lat, longitude: data.delivery.lng } },
              },
              travelMode: "DRIVE",
              routingPreference: "TRAFFIC_UNAWARE",
            }),
          },
        );
        if (r.ok) {
          const j = (await r.json()) as {
            routes?: Array<{ distanceMeters?: number; duration?: string }>;
          };
          const route = j.routes?.[0];
          if (route?.distanceMeters) bestKm = route.distanceMeters / 1000;
          if (route?.duration) durationMin = Math.round(parseFloat(route.duration) / 60);
        }
      }
    } catch (e) {
      console.warn("Routes enrich failed", e);
    }

    const subtotal = data.items.reduce((n, i) => n + i.unit_price_kes * i.quantity, 0);
    const orderNumber = generateOrderNumber();

    const client = await pool.connect();
    let orderId: string;
    try {
      await client.query("BEGIN");
      const { rows: orderRows } = await client.query<{ id: string; order_number: string }>(
        `INSERT INTO orders
          (order_number, customer_name, customer_phone, customer_email, delivery_address,
           delivery_lat, delivery_lng, delivery_landmark, delivery_notes, assigned_branch_id,
           estimated_distance_km, estimated_duration_min, subtotal_kes, total_kes, delivery_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'pending')
         RETURNING id, order_number`,
        [
          orderNumber,
          data.customer.name,
          data.customer.phone,
          data.customer.email || null,
          data.delivery.address,
          data.delivery.lat,
          data.delivery.lng,
          data.delivery.landmark || null,
          data.notes || null,
          assigned.id,
          Math.round(bestKm * 10) / 10,
          durationMin,
          subtotal,
          subtotal,
        ],
      );
      orderId = orderRows[0].id;

      for (const item of data.items) {
        await client.query(
          `INSERT INTO order_items
            (order_id, product_id, product_name, category, unit_price_kes, quantity, subtotal_kes)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            orderId,
            item.product_id,
            item.product_name,
            item.category ?? null,
            item.unit_price_kes,
            item.quantity,
            item.unit_price_kes * item.quantity,
          ],
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    // Fire notifications (best-effort, non-blocking behavior)
    try {
      const { sendOrderNotifications } = await import("./notifications.server");
      await sendOrderNotifications({
        orderNumber,
        customer: {
          name: data.customer.name,
          phone: data.customer.phone,
          email: data.customer.email || null,
        },
        delivery: {
          ...data.delivery,
          landmark: data.delivery.landmark || null,
          notes: data.notes || null,
        },
        branch: assigned,
        items: data.items,
        subtotal_kes: subtotal,
        distance_km: Math.round(bestKm * 10) / 10,
        duration_min: durationMin,
      });
    } catch (e) {
      console.error("Notification send failed", e);
    }

    return { order_number: orderNumber };
  });

export const getOrderByNumber = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ order_number: z.string().min(6).max(50) }).parse(input),
  )
  .handler(async ({ data }) => {
    const db = getDb();
    const { rows: orderRows } = await db.query(
      `SELECT id, order_number, customer_name, customer_phone, customer_email, delivery_address,
              delivery_lat, delivery_lng, delivery_landmark, delivery_notes, estimated_distance_km,
              estimated_duration_min, subtotal_kes, total_kes, delivery_status, created_at,
              assigned_branch_id
       FROM orders WHERE order_number = $1`,
      [data.order_number],
    );
    const order = orderRows[0];
    if (!order) return null;

    const [{ rows: branchRows }, { rows: items }] = await Promise.all([
      db.query(
        `SELECT id, name, area, phone, whatsapp, email, latitude, longitude, opening_hours
         FROM branches WHERE id = $1`,
        [order.assigned_branch_id],
      ),
      db.query(
        `SELECT product_name, quantity, unit_price_kes, subtotal_kes
         FROM order_items WHERE order_id = $1`,
        [order.id],
      ),
    ]);
    return { order, branch: branchRows[0] ?? null, items: items ?? [] };
  });
