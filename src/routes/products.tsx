import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ProductCard, EmptyState } from "@/components/ProductCard";
import { categories, type CategorySlug } from "@/lib/products";
import { productsQueryOptions } from "@/lib/products.functions";

export const Route = createFileRoute("/products")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  head: () => ({
    meta: [
      { title: "Shop all products — Aquatace Water & Gas" },
      { name: "description", content: "Browse water refills, bottled water and cooking gas from Aquatace Water & Gas. Filter, search and order in seconds." },
      { property: "og:title", content: "Shop — Aquatace" },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | CategorySlug>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const filtered = useMemo(() => {
    let list = products;
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s));
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return sorted;
  }, [products, q, cat, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="container-page py-10 md:py-14">
      <div className="grid gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">All products</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Shop the store</h1>
        <p className="max-w-2xl text-muted-foreground">Water refills, bottled water and cooking gas — order in seconds.</p>
      </div>

      {/* Controls */}
      <div className="mt-8 grid gap-3 rounded-3xl border border-border/60 bg-card p-3 shadow-[var(--shadow-soft)] sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search products, brands…" className="h-11 rounded-2xl pl-10" aria-label="Search products" />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={cat} onValueChange={(v) => { setCat(v as never); setPage(1); }}>
          <SelectTrigger className="h-11 rounded-2xl sm:w-48"><SlidersHorizontal className="mr-2 h-4 w-4" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-11 rounded-2xl sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-asc">Price · Low to high</SelectItem>
            <SelectItem value="price-desc">Price · High to low</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">{filtered.length} products</span>
        {cat !== "all" && (
          <Badge variant="secondary" className="rounded-full">
            {categories.find((c) => c.slug === cat)?.name}
            <button onClick={() => setCat("all")} className="ml-2" aria-label="Clear category"><X className="h-3 w-3" /></button>
          </Badge>
        )}
      </div>

      {/* Grid */}
      {paged.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No products match your filters"
            description="Try clearing search or picking a different category."
            cta={<Button onClick={() => { setQ(""); setCat("all"); }} className="rounded-full">Reset filters</Button>} />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 grid-cols-3">
          {paged.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full" disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" className="rounded-full" disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      )}

      <div className="mt-16 rounded-3xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Can't find what you're looking for?</p>
        <Button asChild className="mt-3 rounded-full"><Link to="/contact">Contact us</Link></Button>
      </div>
    </div>
  );
}
