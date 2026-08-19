import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/ProductImage";
import { formatKES, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.2, 0.8, 0.2, 1] }}
      className="group card-lift card-lift-hover overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[var(--shadow-soft)]"
    >
      <Link to="/product/$id" params={{ id: product.slug }} className="block">
        <div className="relative aspect-square">
          <ProductImage category={product.category} label={product.size} image={product.image} className="h-full w-full" size="lg" />
          {product.badge && (
            <Badge className="absolute left-3 top-3 rounded-full bg-background/90 text-foreground shadow">
              {product.badge}
            </Badge>
          )}
          <Button
            variant="ghost" size="icon"
            className="absolute right-2 top-2 rounded-full bg-background/70 backdrop-blur hover:bg-background"
            aria-label="Add to wishlist"
            onClick={(e) => { e.preventDefault(); toast.success("Saved to wishlist"); }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>
      <div className="flex flex-col gap-2 p-2.5 sm:gap-3 sm:p-5">
        <div className="min-w-0">
          <p className="truncate text-[9px] uppercase tracking-wider text-muted-foreground sm:text-xs">{product.brand}</p>
          <Link to="/product/$id" params={{ id: product.slug }} className="mt-0.5 block sm:mt-1">
            <h3 className="line-clamp-2 text-[11px] font-semibold leading-tight group-hover:text-primary sm:text-[15px] sm:leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>
        <div className="flex flex-col items-stretch gap-1.5 pt-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:pt-1">
          <span className="text-[12px] font-bold tracking-tight sm:text-base">{formatKES(product.price)}</span>
          <Button
            size="sm"
            className="h-7 w-full rounded-full px-2 text-[11px] sm:h-9 sm:w-auto sm:text-sm"
            onClick={() => { add(product); toast.success("Added to cart", { description: product.name }); }}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="mr-0.5 h-3 w-3 sm:mr-1 sm:h-4 sm:w-4" /> Add
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function EmptyState({ title, description, cta }: { title: string; description?: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border p-12 text-center">
      <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
