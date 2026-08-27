import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Home,
  ShoppingBag,
  MapPin,
  Phone,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getOrderByNumber } from "@/lib/orders.functions";
import { formatKES } from "@/lib/products";

export const Route = createFileRoute("/order-success")({
  validateSearch: (s) => z.object({ order: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Order confirmed — Aquatace" },
      { name: "description", content: "Your order has been received. Confirmation on the way." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { order } = Route.useSearch();
  const orderNumber = order ?? "";
  const fetchOrder = useServerFn(getOrderByNumber);
  const q = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => fetchOrder({ data: { order_number: orderNumber } }),
    enabled: !!orderNumber,
    staleTime: 60_000,
  });

  const branch = q.data?.branch;
  const orderRow = q.data?.order;
  const items = q.data?.items ?? [];

  const [storedWaUrl, setStoredWaUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!orderNumber) return;
    try {
      setStoredWaUrl(sessionStorage.getItem(`wa:${orderNumber}`));
    } catch {
      /* ignore */
    }
  }, [orderNumber]);

  const fallbackMessage =
    orderRow && branch
      ? `Hi ${branch.name}, this is ${orderRow.customer_name}. My order ${orderRow.order_number} is ready — please confirm delivery. Location: https://www.google.com/maps?q=${orderRow.delivery_lat},${orderRow.delivery_lng}`
      : "";
  const fallbackWa = branch?.whatsapp
    ? `https://wa.me/${branch.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(fallbackMessage)}`
    : null;
  const waHref = storedWaUrl ?? fallbackWa;

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Thank you for your order!
          </h1>
          <p className="mt-3 text-muted-foreground">
            We've received your order and notified the assigned branch. Please confirm via WhatsApp
            for fastest dispatch.
          </p>
        </div>

        <Card className="mt-8 rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Order number
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-2xl font-bold tracking-tight">{orderNumber || "—"}</span>
              {orderNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    navigator.clipboard.writeText(orderNumber);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                </Button>
              )}
            </div>

            {waHref && (
              <a
                href={waHref}
                target="_top"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#1ebe57]"
              >
                <MessageCircle className="h-5 w-5" /> Send your order on WhatsApp
              </a>
            )}
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Tap the button to open WhatsApp with your full order details prefilled.
            </p>

            {q.isLoading && (
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading order details…
              </div>
            )}

            {orderRow && branch && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-primary/5 p-4 text-sm">
                  <p className="font-semibold text-foreground">Fulfilled by {branch.name}</p>
                  <p className="mt-1 text-muted-foreground">
                    Approximately{" "}
                    <span className="font-medium text-foreground">
                      {orderRow.estimated_distance_km} km
                    </span>{" "}
                    away · ETA{" "}
                    <span className="font-medium text-foreground">
                      ~{orderRow.estimated_duration_min} min
                    </span>
                  </p>
                  {branch.opening_hours && (
                    <p className="mt-1 text-xs text-muted-foreground">{branch.opening_hours}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {branch.phone && (
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <a href={`tel:${branch.phone.replace(/\s/g, "")}`}>
                        <Phone className="mr-2 h-4 w-4" /> Call branch
                      </a>
                    </Button>
                  )}
                  {waHref && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full bg-primary hover:bg-primary/90"
                    >
                      <a href={waHref} target="_top" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" /> Confirm on WhatsApp
                      </a>
                    </Button>
                  )}
                </div>

                <div className="rounded-2xl border border-border p-4 text-sm">
                  <p className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      <span className="font-medium text-foreground">Delivery to:</span>{" "}
                      {orderRow.delivery_address}
                    </span>
                  </p>
                  {orderRow.delivery_landmark && (
                    <p className="mt-1 pl-6 text-muted-foreground">
                      <span className="font-medium text-foreground">Landmark:</span>{" "}
                      {orderRow.delivery_landmark}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <ShoppingBag className="h-4 w-4 text-primary" /> Items
                  </p>
                  <ul className="divide-y divide-border rounded-2xl border border-border">
                    {items.map((i, idx) => (
                      <li key={idx} className="flex items-center justify-between p-3 text-sm">
                        <span>
                          <span className="font-medium">{i.quantity}×</span> {i.product_name}
                        </span>
                        <span className="font-medium">{formatKES(Number(i.subtotal_kes))}</span>
                      </li>
                    ))}
                    <li className="flex items-center justify-between bg-muted/40 p-3 text-sm font-semibold">
                      <span>Total</span>
                      <span>{formatKES(Number(orderRow.total_kes))}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {q.isError && (
              <p className="mt-4 text-sm text-destructive">
                Couldn't load order details. Please contact us with your order number.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Go home
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/products">
              <ShoppingBag className="mr-2 h-4 w-4" /> Keep shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
