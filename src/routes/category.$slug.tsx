import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ProductCard, EmptyState } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { categories, getProductsByCategory, type CategorySlug, type Product } from "@/lib/products";
import { productsQueryOptions } from "@/lib/products.functions";
import { listBranches } from "@/lib/branches.functions";
import catWater from "@/assets/cat-water.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";
import gasCylinders from "@/assets/gas-cylinders-kenya.jpg.asset.json";
import { ChevronRight, X } from "lucide-react";

const imgMap: Record<CategorySlug, string> = { water: catWater, gas: gasCylinders.url, electronics: catElectronics };

export const Route = createFileRoute("/category/$slug")({
  beforeLoad: ({ params }) => {
    if (!categories.some((c) => c.slug === params.slug)) throw notFound();
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  head: ({ params }) => {
    const c = categories.find((x) => x.slug === (params.slug as CategorySlug));
    if (!c) return { meta: [{ title: "Category not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${c.name} — Aquatace Water & Gas` },
        { name: "description", content: c.description },
        { property: "og:title", content: `${c.name} — Aquatace` },
        { property: "og:description", content: c.description },
        { property: "og:url", content: `/category/${c.slug}` },
      ],
      links: [{ rel: "canonical", href: `/category/${c.slug}` }],
    };
  },
  component: CategoryPage,
});

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function FilterChips({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string | null; onChange: (v: string | null) => void }) {
  if (options.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            value === null ? "border-primary bg-primary text-white" : "border-border bg-card hover:border-primary/60"
          }`}
        >All</button>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              value === o ? "border-primary bg-primary text-white" : "border-border bg-card hover:border-primary/60"
            }`}
          >{o}</button>
        ))}
      </div>
    </div>
  );
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const c = categories.find((x) => x.slug === (slug as CategorySlug))!;
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const items = getProductsByCategory(products, c.slug);
  const img = imgMap[c.slug];

  // Filters
  const [size, setSize] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);

  const sizeOptions = useMemo(
    () => uniq(items.map((p) => p.size).filter((s): s is string => Boolean(s))),
    [items]
  );
  const brandOptions = useMemo(() => uniq(items.map((p) => p.brand)), [items]);
  const typeOptions = useMemo(
    () => uniq(items.map((p) => p.productType).filter((t): t is string => Boolean(t))),
    [items]
  );

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => listBranches(),
    enabled: c.slug === "gas",
    staleTime: 5 * 60 * 1000,
  });

  const filtered: Product[] = useMemo(() => {
    let list = items;
    if (size) list = list.filter((p) => p.size === size);
    if (brand) list = list.filter((p) => p.brand === brand);
    if (type) list = list.filter((p) => p.productType === type);
    return list;
  }, [items, size, brand, type]);

  const activeCount = [size, brand, type, branchId].filter(Boolean).length;
  const selectedBranch = branches.find((b) => b.id === branchId);

  // Labels per category
  const sizeLabel = c.slug === "water" ? "Volume" : c.slug === "gas" ? "Cylinder size" : "Size";

  return (
    <div>
      <section className={`relative overflow-hidden ${c.accent === "water" ? "gradient-water" : c.accent === "electronics" ? "gradient-electronics" : "gradient-gas"}`}>
        <div className="container-page grid gap-8 py-12 text-white md:grid-cols-12 md:py-16">
          <div className="md:col-span-7 flex flex-col justify-center">
            <nav className="flex items-center gap-1 text-xs text-white/80" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/products" className="hover:text-white">Shop</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white">{c.name}</span>
            </nav>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{c.name}</h1>
            <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">{c.description}</p>
          </div>
          <div className="md:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20">
              <img src={img} alt={c.name} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* FILTER PANEL */}
        <aside className="rounded-3xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)] lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Refine</h2>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => { setSize(null); setBrand(null); setType(null); setBranchId(null); }}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" /> Clear ({activeCount})
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-5">
            {c.slug === "water" && (
              <FilterChips label={sizeLabel} options={sizeOptions} value={size} onChange={setSize} />
            )}

            {c.slug === "gas" && (
              <>
                <FilterChips label={sizeLabel} options={sizeOptions} value={size} onChange={setSize} />
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Pickup point
                  </p>
                  <select
                    value={branchId ?? ""}
                    onChange={(e) => setBranchId(e.target.value || null)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Auto — nearest pickup point</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}{b.area ? ` — ${b.area}` : ""}</option>
                    ))}
                  </select>
                  {selectedBranch && (
                    <p className="text-[11px] text-muted-foreground">
                      Dispatch from <span className="font-medium text-foreground">{selectedBranch.name}</span>
                      {selectedBranch.phone ? ` · ${selectedBranch.phone}` : ""}
                    </p>
                  )}
                </div>
              </>
            )}

            {c.slug === "electronics" && (
              <>
                <FilterChips label="Brand" options={brandOptions} value={brand} onChange={setBrand} />
                <FilterChips label="Type" options={typeOptions} value={type} onChange={setType} />
              </>
            )}
          </div>
        </aside>

        {/* RESULTS */}
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No products match those filters"
                description="Try clearing a filter or picking a different option."
                cta={<Button onClick={() => { setSize(null); setBrand(null); setType(null); }} className="rounded-full">Reset</Button>}
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 grid-cols-3 sm:gap-5">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>

      <div className="h-16" />
    </div>
  );
}
