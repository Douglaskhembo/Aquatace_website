import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { formatKES, getProduct, getRelated } from "@/lib/products";
import { productsQueryOptions } from "@/lib/products.functions";
import { useCart } from "@/lib/cart";
import { waLink } from "@/lib/business";
import { buildProductSchema } from "@/lib/seo/schema";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ context, params }) => {
    const products = await context.queryClient.ensureQueryData(productsQueryOptions);
    const p = getProduct(products, params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData: p }) => {
    if (!p)
      return { meta: [{ title: "Product not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${p.name} — Aquatace` },
        { name: "description", content: p.description },
        { property: "og:title", content: p.name },
        { property: "og:description", content: p.description },
        { property: "og:url", content: `/product/${p.slug}` },
        { "script:ld+json": buildProductSchema(p) },
      ],
      links: [{ rel: "canonical", href: `/product/${p.slug}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const p = Route.useLoaderData();
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const related = getRelated(products, p);
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <div className="container-page py-8 md:py-12">
      <nav
        className="flex items-center gap-1 text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to="/category/$slug"
          params={{ slug: p.category }}
          className="hover:text-foreground capitalize"
        >
          {p.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-foreground">{p.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-square overflow-hidden rounded-3xl border border-border/60 shadow-[var(--shadow-soft)]"
          >
            <ProductImage
              category={p.category}
              label={p.size}
              image={p.image}
              size="lg"
              className="h-full w-full"
            />
          </motion.div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-xl border border-border/60"
              >
                <ProductImage category={p.category} size="sm" className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {p.brand}
            </Badge>
            {p.badge && <Badge className="rounded-full bg-primary">{p.badge}</Badge>}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{p.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{p.description}</p>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-3xl font-bold tracking-tight">{formatKES(p.price)}</span>
            <span className="pb-1 text-sm text-muted-foreground">incl. VAT</span>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                {qty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="h-12 flex-1 rounded-full text-base"
              onClick={() => {
                add(p, qty);
                toast.success("Added to cart", { description: `${qty} × ${p.name}` });
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to cart
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-full"
              aria-label="Add to wishlist"
              onClick={() => toast.success("Saved to wishlist")}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <Button asChild size="lg" variant="outline" className="mt-3 h-12 w-full rounded-full">
            <a
              href={waLink(
                `Hi Aquatace, I'd like to order ${qty} × ${p.name} (${formatKES(p.price)}).`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Order on WhatsApp
            </a>
          </Button>

          <Separator className="my-8" />

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { Icon: Truck, t: "Fast delivery", d: "Same-day in Nairobi" },
              { Icon: ShieldCheck, t: "Genuine & sealed", d: "Certified products" },
              { Icon: RotateCcw, t: "Easy returns", d: "24-hour policy" },
            ].map((f) => (
              <div key={f.t} className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary">
                  <f.Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.t}</p>
                  <p className="text-xs text-muted-foreground">{f.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Tabs defaultValue="specs">
              <TabsList className="rounded-full">
                <TabsTrigger value="specs" className="rounded-full">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="delivery" className="rounded-full">
                  Delivery
                </TabsTrigger>
              </TabsList>
              <TabsContent value="specs" className="mt-4">
                <dl className="divide-y divide-border rounded-2xl border border-border/60">
                  {p.specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>
              <TabsContent value="delivery" className="mt-4 text-sm text-muted-foreground">
                Orders placed before 5 PM are delivered the same day within Nairobi. Nationwide
                delivery via courier arrives within 1–3 business days.
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
          <div className="mt-6 grid gap-5 grid-cols-3">
            {related.map((r, i) => (
              <ProductCard key={r.id} product={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
