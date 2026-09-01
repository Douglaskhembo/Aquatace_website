import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/ProductImage";
import { EmptyState } from "@/components/ProductCard";
import { formatKES } from "@/lib/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Aquatace" },
      { name: "description", content: "Review your cart and proceed to checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove, subtotal, count } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState title="Your cart is empty" description="Browse our shop and add products to get started."
          cta={<Button asChild className="rounded-full"><Link to="/products">Continue shopping <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>} />
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your cart</h1>
      </div>
      <p className="mt-2 text-muted-foreground">{count} item{count === 1 ? "" : "s"} in cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {lines.map((l) => (
            <Card key={l.product.id} className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
              <CardContent className="flex items-center gap-4 p-4">
                <Link to="/product/$id" params={{ id: l.product.slug }} className="shrink-0">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl sm:h-24 sm:w-24">
                    <ProductImage
                      category={l.product.category}
                      image={l.product.image}
                      size="sm"
                      className="h-full w-full"
                    />
                  </div>
                </Link>
                <div className="grid min-w-0 flex-1 gap-1">
                  <Link to="/product/$id" params={{ id: l.product.slug }} className="min-w-0">
                    <h2 className="truncate text-base font-semibold hover:text-primary">{l.product.name}</h2>
                  </Link>
                  <p className="text-xs text-muted-foreground">{l.product.brand}{l.product.size && ` · ${l.product.size}`}</p>
                  <p className="text-sm font-semibold">{formatKES(l.product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-full border border-border">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setQty(l.product.id, l.qty - 1)} aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></Button>
                    <span className="w-7 text-center text-sm font-semibold">{l.qty}</span>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setQty(l.product.id, l.qty + 1)} aria-label="Increase"><Plus className="h-3.5 w-3.5" /></Button>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" onClick={() => remove(l.product.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium">{formatKES(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="font-medium">Calculated at checkout</dd></div>
              </dl>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-end justify-between">
                <span className="text-sm text-muted-foreground">Estimated total</span>
                <span className="text-2xl font-bold tracking-tight">{formatKES(subtotal)}</span>
              </div>
              <Button asChild size="lg" className="mt-6 h-12 w-full rounded-full text-base">
                <Link to="/checkout">Proceed to checkout <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
                <Link to="/products">Continue shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
