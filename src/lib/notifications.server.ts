// Server-only. Sends order notifications. Best-effort — failures are swallowed by caller.
import type { Branch } from "./branches.functions";

interface OrderNotifPayload {
  orderNumber: string;
  customer: { name: string; phone: string; email: string | null };
  delivery: {
    address: string;
    lat: number;
    lng: number;
    landmark: string | null;
    notes: string | null;
  };
  branch: Pick<
    Branch,
    "id" | "name" | "area" | "phone" | "whatsapp" | "email" | "latitude" | "longitude"
  > & {
    email: string | null;
  };
  items: Array<{ product_name: string; quantity: number; unit_price_kes: number }>;
  subtotal_kes: number;
  distance_km: number;
  duration_min: number;
}

const KES = (n: number) => `KES ${new Intl.NumberFormat("en-KE").format(n)}`;

export async function sendOrderNotifications(p: OrderNotifPayload): Promise<void> {
  const mapsLink = `https://www.google.com/maps?q=${p.delivery.lat},${p.delivery.lng}`;
  const itemsText = p.items
    .map((i) => `• ${i.quantity} × ${i.product_name} — ${KES(i.unit_price_kes * i.quantity)}`)
    .join("\n");

  // Branch email (via Lovable transactional email queue if available)
  await enqueueEmail({
    templateName: "order-branch-alert",
    recipientEmail: p.branch.email || "",
    subject: `New order ${p.orderNumber} · ${p.customer.name}`,
    templateData: {
      orderNumber: p.orderNumber,
      branchName: p.branch.name,
      customerName: p.customer.name,
      customerPhone: p.customer.phone,
      deliveryAddress: p.delivery.address,
      deliveryLandmark: p.delivery.landmark ?? "—",
      mapsLink,
      itemsText,
      subtotal: KES(p.subtotal_kes),
      distance: `${p.distance_km} km`,
      duration: `${p.duration_min} min`,
      notes: p.delivery.notes ?? "—",
    },
    idempotencyKey: `branch-${p.orderNumber}`,
  }).catch((e) => console.warn("branch email skipped", e));

  // Customer email (if provided)
  if (p.customer.email) {
    await enqueueEmail({
      templateName: "order-customer-confirm",
      recipientEmail: p.customer.email,
      subject: `Your Aquatace order ${p.orderNumber} is confirmed`,
      templateData: {
        orderNumber: p.orderNumber,
        customerName: p.customer.name,
        branchName: p.branch.name,
        branchPhone: p.branch.phone || "",
        deliveryAddress: p.delivery.address,
        itemsText,
        subtotal: KES(p.subtotal_kes),
        duration: `${p.duration_min} min`,
      },
      idempotencyKey: `customer-${p.orderNumber}`,
    }).catch((e) => console.warn("customer email skipped", e));
  }
}

async function enqueueEmail(payload: {
  templateName: string;
  recipientEmail: string;
  subject: string;
  templateData: Record<string, unknown>;
  idempotencyKey: string;
}): Promise<void> {
  if (!payload.recipientEmail) return;
  // Attempt to enqueue via Supabase RPC (set up by email_domain--setup_email_infra).
  // If infra isn't set up yet, this fails gracefully.
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // enqueue_email RPC is added by email_domain--setup_email_infra; cast until then.
    const rpc = supabaseAdmin.rpc as unknown as (
      fn: string,
      args: unknown,
    ) => Promise<{ error: { message: string } | null }>;
    const { error } = await rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        template_name: payload.templateName,
        recipient_email: payload.recipientEmail,
        subject: payload.subject,
        template_data: payload.templateData,
        idempotency_key: payload.idempotencyKey,
      },
    });
    if (error) console.warn("enqueue_email error:", error.message);
  } catch (e) {
    console.warn("email infra not ready", e);
  }
}
