import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ProductCard";
import { formatKES } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { DeliveryMap, type DeliveryLocation } from "@/components/checkout/DeliveryMap";
import { BranchAssignment, type AssignedBranch } from "@/components/checkout/BranchAssignment";
import { createOrder } from "@/lib/orders.functions";
import { business } from "@/lib/business";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Aquatace" },
      { name: "description", content: "Complete your order with location-based branch delivery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

interface FormState {
  name: string;
  phone: string;
  email: string;
}
type Errors = Partial<Record<keyof FormState | "location", string>>;

function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const submit = useServerFn(createOrder);
  const [form, setForm] = useState<FormState>({ name: "", phone: "", email: "" });
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const [assigned, setAssigned] = useState<AssignedBranch | null>(null);
  const [branchOverride, setBranchOverride] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="No items to checkout"
          description="Add some products first."
          cta={
            <Button asChild className="rounded-full">
              <Link to="/products">Shop products</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const update = <K extends keyof FormState>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!/^\+?\d[\d\s-]{7,}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Enter a valid email or leave blank.";
    if (!location) e.location = "Pin your delivery location on the map.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validate() || !location) return;
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || undefined,
          },
          delivery: {
            address: location.address,
            lat: location.lat,
            lng: location.lng,
            landmark: location.landmark,
          },
          notes: location.instructions,
          items: lines.map((l) => ({
            product_id: l.product.id,
            product_name: l.product.name,
            category: l.product.category,
            unit_price_kes: l.product.price,
            quantity: l.qty,
          })),
          branch_override_id: branchOverride ?? undefined,
        },
      });

      // Build WhatsApp order message so the customer sees + confirms the order in-chat.
      // The maps link is a plain Google Maps URL (no API involved) so the delivery
      // person can tap it and navigate straight to the pinned coordinates.
      const itemLines = lines
        .map((l) => `• ${l.qty} × ${l.product.name} — ${formatKES(l.product.price * l.qty)}`)
        .join("\n");
      const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      const msg =
        `*New Order ${res.order_number}*\n\n` +
        `👤 ${form.name.trim()}\n` +
        `📞 ${form.phone.trim()}\n` +
        (form.email.trim() ? `✉️ ${form.email.trim()}\n` : "") +
        `\n*Items*\n${itemLines}\n\n` +
        `*Subtotal:* ${formatKES(subtotal)}\n` +
        (assigned ? `*Pickup point:* ${assigned.name}\n` : "") +
        `\n🚚 *DELIVERY INFORMATION*\n\n` +
        `Address: ${location.address}\n` +
        (location.landmark ? `Landmark: ${location.landmark}\n` : "") +
        (location.instructions ? `Instructions: ${location.instructions}\n` : "") +
        `\n📍 Delivery Location:\n${mapLink}`;

      const waPhone =
        (assigned as { whatsapp?: string | null } | null)?.whatsapp?.replace(/\D/g, "") ||
        business.whatsapp;
      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
      try {
        sessionStorage.setItem(`wa:${res.order_number}`, waUrl);
      } catch {
        /* ignore */
      }
      clear();
      navigate({ to: "/order-success", search: { order: res.order_number } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not place order. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-4 rounded-full">
        <Link to="/cart">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to cart
        </Link>
      </Button>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Checkout</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Enter your delivery details. We'll route your order to the nearest branch automatically.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]" noValidate>
        <div className="space-y-6">
          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="grid gap-5 p-6 md:p-8">
              <h2 className="text-lg font-semibold">Your details</h2>
              <Field id="name" label="Full name" error={errors.name}>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jane Wanjiku"
                  autoComplete="name"
                  required
                />
              </Field>
              <div className="grid gap-5 md:grid-cols-2">
                <Field id="phone" label="Phone number" error={errors.phone}>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+254 712 345 678"
                    autoComplete="tel"
                    required
                  />
                </Field>
                <Field id="email" label="Email (optional)" error={errors.email}>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="grid gap-5 p-6 md:p-8">
              <div>
                <h2 className="text-lg font-semibold">Delivery location</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search, use your current location, or drop a pin on the map.
                </p>
              </div>
              <DeliveryMap value={location} onChange={setLocation} />
              {errors.location && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.location}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="grid gap-4 p-6 md:p-8">
              <h2 className="text-lg font-semibold">Fulfilment branch</h2>
              <BranchAssignment
                lat={location?.lat ?? null}
                lng={location?.lng ?? null}
                onAssign={setAssigned}
                branchOverrideId={branchOverride}
                onOverride={setBranchOverride}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">Order summary</h2>
              </div>
              <ul className="mt-4 divide-y divide-border">
                {lines.map((l) => (
                  <li key={l.product.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.qty} × {formatKES(l.product.price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatKES(l.product.price * l.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">On confirmation</span>
                </div>
                {assigned && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="font-medium">{assigned.name}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Estimated total</span>
                <span className="text-2xl font-bold tracking-tight">{formatKES(subtotal)}</span>
              </div>
              <Button
                type="submit"
                size="lg"
                className="mt-6 h-12 w-full rounded-full bg-[#25D366] text-base text-white hover:bg-[#1ebe57]"
                disabled={submitting || !location}
              >
                {submitting ? (
                  "Placing order…"
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Send order via WhatsApp
                  </>
                )}
              </Button>
              <p className="mt-3 rounded-xl bg-amber-50 p-2.5 text-center text-xs text-amber-900">
                <span className="font-semibold">Required:</span> we'll open WhatsApp with your order
                details — you must send that message to confirm your order. WhatsApp is the only way
                to confirm or reach us about your order.
              </p>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
