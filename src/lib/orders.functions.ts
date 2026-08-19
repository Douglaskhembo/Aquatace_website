import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
});

const CreateOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(30).regex(/^\+?[\d\s-]+$/),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),
  }),
  delivery: LocationSchema,
  notes: z.string().max(1000).optional(),
  items: z.array(CartLineSchema).min(1).max(50),
  branch_override_id: z.string().uuid().optional(),
});

export const assignNearestBranch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ lat: z.number().gte(-90).lte(90), lng: z.number().gte(-180).lte(180) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const { haversineKm } = await import("./haversine");
    const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: branches, error } = await supa
      .from("branches")
      .select("id,name,area,latitude,longitude,phone,whatsapp,email,offer_note")
      .eq("active", true);
    if (error) throw new Error(error.message);
    if (!branches || branches.length === 0) throw new Error("No active branches available.");

    // Try Google Routes API compute matrix
    let best: { branch: typeof branches[number]; distance_km: number; duration_min: number } | null = null;
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
              origins: [{ waypoint: { location: { latLng: { latitude: data.lat, longitude: data.lng } } } }],
              destinations: branches.map((b) => ({
                waypoint: { location: { latLng: { latitude: b.latitude, longitude: b.longitude } } },
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
            if (!best || km < best.distance_km) best = { branch, distance_km: km, duration_min: dur };
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
        const km = haversineKm({ lat: data.lat, lng: data.lng }, { lat: b.latitude, lng: b.longitude });
        if (!best || km < best.distance_km) best = { branch: b, distance_km: km, duration_min: km * 3 };
      }
    }

    // Out-of-coverage fallback: if the nearest branch is farther than 15km,
    // route the order to the Membley main branch.
    const OUT_OF_COVERAGE_KM = 15;
    if (best && best.distance_km > OUT_OF_COVERAGE_KM) {
      const membley = branches.find((b) => /membley/i.test(b.name));
      if (membley && membley.id !== best.branch.id) {
        const km = haversineKm({ lat: data.lat, lng: data.lng }, { lat: membley.latitude, lng: membley.longitude });
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { haversineKm } = await import("./haversine");

    // Fetch branches (server side, trusted)
    const { data: branches, error: bErr } = await supabaseAdmin
      .from("branches")
      .select("id,name,area,latitude,longitude,phone,whatsapp,email")
      .eq("active", true);
    if (bErr) throw new Error(bErr.message);
    if (!branches || branches.length === 0) throw new Error("No branches available.");

    // Determine assigned branch
    let assigned = branches[0];
    let bestKm = Infinity;
    if (data.branch_override_id) {
      const found = branches.find((b) => b.id === data.branch_override_id);
      if (found) {
        assigned = found;
        bestKm = haversineKm({ lat: data.delivery.lat, lng: data.delivery.lng }, { lat: found.latitude, lng: found.longitude });
      }
    } else {
      for (const b of branches) {
        const km = haversineKm({ lat: data.delivery.lat, lng: data.delivery.lng }, { lat: b.latitude, lng: b.longitude });
        if (km < bestKm) { bestKm = km; assigned = b; }
      }
      // Out-of-coverage fallback → Membley main branch.
      const OUT_OF_COVERAGE_KM = 15;
      if (bestKm > OUT_OF_COVERAGE_KM) {
        const membley = branches.find((b) => /membley/i.test(b.name));
        if (membley) {
          assigned = membley;
          bestKm = haversineKm({ lat: data.delivery.lat, lng: data.delivery.lng }, { lat: membley.latitude, lng: membley.longitude });
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
              origin: { location: { latLng: { latitude: assigned.latitude, longitude: assigned.longitude } } },
              destination: { location: { latLng: { latitude: data.delivery.lat, longitude: data.delivery.lng } } },
              travelMode: "DRIVE",
              routingPreference: "TRAFFIC_UNAWARE",
            }),
          },
        );
        if (r.ok) {
          const j = (await r.json()) as { routes?: Array<{ distanceMeters?: number; duration?: string }> };
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

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: data.customer.name,
        customer_phone: data.customer.phone,
        customer_email: data.customer.email || null,
        delivery_address: data.delivery.address,
        delivery_lat: data.delivery.lat,
        delivery_lng: data.delivery.lng,
        delivery_notes: data.notes || null,
        assigned_branch_id: assigned.id,
        estimated_distance_km: Math.round(bestKm * 10) / 10,
        estimated_duration_min: durationMin,
        subtotal_kes: subtotal,
        total_kes: subtotal,
        delivery_status: "pending",
      })
      .select("id,order_number")
      .single();
    if (oErr) throw new Error(oErr.message);

    const itemsPayload = data.items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.product_name,
      category: i.category ?? null,
      unit_price_kes: i.unit_price_kes,
      quantity: i.quantity,
      subtotal_kes: i.unit_price_kes * i.quantity,
    }));
    const { error: iErr } = await supabaseAdmin.from("order_items").insert(itemsPayload);
    if (iErr) throw new Error(iErr.message);

    // Fire notifications (best-effort, non-blocking behavior)
    try {
      const { sendOrderNotifications } = await import("./notifications.server");
      await sendOrderNotifications({
        orderNumber,
        customer: { name: data.customer.name, phone: data.customer.phone, email: data.customer.email || null },
        delivery: { ...data.delivery, notes: data.notes || null },
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
  .inputValidator((input: unknown) => z.object({ order_number: z.string().min(6).max(50) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id,order_number,customer_name,customer_phone,customer_email,delivery_address,delivery_lat,delivery_lng,delivery_notes,estimated_distance_km,estimated_duration_min,subtotal_kes,total_kes,delivery_status,created_at,assigned_branch_id",
      )
      .eq("order_number", data.order_number)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;

    const [{ data: branch }, { data: items }] = await Promise.all([
      supabaseAdmin.from("branches").select("id,name,area,phone,whatsapp,email,latitude,longitude,opening_hours").eq("id", order.assigned_branch_id!).maybeSingle(),
      supabaseAdmin.from("order_items").select("product_name,quantity,unit_price_kes,subtotal_kes").eq("order_id", order.id),
    ]);
    return { order, branch, items: items ?? [] };
  });
