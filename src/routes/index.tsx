import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ArrowRight, Droplet, MessageCircle, Zap, Headphones, Truck, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { ReviewsSection } from "@/components/ReviewsSection";
import { waLink } from "@/lib/business";
import { productsQueryOptions } from "@/lib/products.functions";
import { GAS_CATEGORY_IMAGE_URL } from "@/assets/gas-category-image";
import catWater from "@/assets/cat-water.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";
import { SITE_URL } from "@/lib/seo/config";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  head: () => ({
    meta: [
      { title: "Aquatace Water & Gas — Water Refills & Cooking Gas Delivery in Nairobi" },
      { name: "description", content: "Shop water refills, bottled water, 6kg & 13kg cooking gas and electronics. Delivery across Marurui, Kihunguro, Membley and Ting'ang'a." },
      { property: "og:title", content: "Aquatace Water & Gas — Water Refills & Cooking Gas Delivery in Nairobi" },
      { property: "og:description", content: "Shop water refills, bottled water, 6kg & 13kg cooking gas and electronics. Delivery across Marurui, Kihunguro, Membley and Ting'ang'a." },
      { property: "og:image", content: `${SITE_URL}/branding/aquatace-logo-web.webp` },
      { name: "twitter:image", content: `${SITE_URL}/branding/aquatace-logo-web.webp` },
      { property: "og:url", content: SITE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Home,
});

const CATEGORY_TILES = [
  { slug: "water" as const, name: "Water", img: catWater, Icon: Droplet, count: "500ml – 20L" },
  { slug: "gas" as const, name: "Gas", img: GAS_CATEGORY_IMAGE_URL, Icon: Zap, count: "6kg & 13kg" },
  { slug: "electronics" as const, name: "Electronics", img: catElectronics, Icon: Headphones, count: "Oraimo · Samsung" },
];

function Home() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const list = featured.length >= 4 ? featured : products.slice(0, 8);

  return (
    <div>
      {/* HERO — compact ecommerce banner */}
      <section className="gradient-hero">
        <div className="container-page grid gap-6 py-8 md:grid-cols-12 md:gap-8 md:py-14">
          <div className="md:col-span-7 flex flex-col justify-center">
            <h1 className="text-[26px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Water · Gas · Electronics
              </span>
              <br />Delivered to your door.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Order online — countrywide dispatch from our Membley hub.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-2.5">
              <Button asChild size="lg" className="h-11 rounded-full">
                <Link to="/products">Shop now <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-full">
                <a href={waLink("Hello Aquatace, I want to order.")} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-3xl bg-white p-2 shadow-[var(--shadow-elevated)] ring-1 ring-black/5 aspect-[4/3]">
              <Link to="/category/$slug" params={{ slug: "water" }} className="group relative row-span-2 block overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary">
                <img src={catWater} alt="Aquatace drinking water" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">Water</span>
              </Link>
              <Link to="/category/$slug" params={{ slug: "gas" }} className="group relative block overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary">
                <img src={GAS_CATEGORY_IMAGE_URL} alt="Cooking gas cylinders" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">Gas</span>
              </Link>
              <Link to="/category/$slug" params={{ slug: "electronics" }} className="group relative block overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary">
                <img src={catElectronics} alt="Electronics — Oraimo & Samsung" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">Electronics</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS — compact 3-in-a-row, no images */}
      <section className="container-page mt-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {CATEGORY_TILES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border/60 bg-card px-2 py-4 text-center shadow-[var(--shadow-soft)] transition-all hover:border-primary hover:bg-accent sm:py-5"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-white sm:h-11 sm:w-11">
                <c.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-sm font-semibold sm:text-base">{c.name}</p>
              <p className="hidden text-[11px] text-muted-foreground sm:block">{c.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CUSTOM WATER BANNER */}
      <section className="container-page mt-8">
        <Link
          to="/custom-water"
          className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-3xl gradient-water p-5 text-white shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex items-start gap-3 sm:items-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30">
              <Droplet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/85">New · Custom branded water</p>
              <p className="mt-0.5 text-base font-bold sm:text-lg">Personalised bottles for weddings, funerals, meetings & events</p>
              <p className="mt-0.5 text-xs text-white/90 sm:text-sm">Your names, photo, logo & colours — delivered countrywide.</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition group-hover:bg-white/90">
            Get a quote <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>




      {/* FEATURED PRODUCTS */}
      <section className="container-page mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Best sellers</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Shop popular items</h2>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/products">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 grid-cols-3">
          {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="container-page mt-14">
        <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
          <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
            {[
              { Icon: Truck, title: "Nationwide delivery", desc: "Countrywide dispatch from our Membley hub." },
              { Icon: ShieldCheck, title: "Genuine products", desc: "Trusted brands only." },
              { Icon: MapPin, title: "Smart routing", desc: "We auto-assign your nearest pickup point." },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
                  <f.Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* REVIEWS */}
      <ReviewsSection />
    </div>
  );
}
