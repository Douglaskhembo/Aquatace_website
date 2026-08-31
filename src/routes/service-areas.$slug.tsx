import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MessageCircle, PhoneCall, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { branches, waLink } from "@/lib/business";
import { getServiceArea, serviceAreas } from "@/lib/seo/geo";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export const Route = createFileRoute("/service-areas/$slug")({
  beforeLoad: ({ params }) => {
    if (!getServiceArea(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const area = getServiceArea(params.slug);
    if (!area)
      return { meta: [{ title: "Area not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: area.seoTitle },
        { name: "description", content: area.seoDescription },
        { property: "og:title", content: area.seoTitle },
        { property: "og:description", content: area.seoDescription },
        { property: "og:url", content: `/service-areas/${area.slug}` },
        {
          "script:ld+json": buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Service Areas", path: "/service-areas" },
            { name: area.name, path: `/service-areas/${area.slug}` },
          ]),
        },
      ],
      links: [{ rel: "canonical", href: `/service-areas/${area.slug}` }],
    };
  },
  component: ServiceAreaPage,
});

function ServiceAreaPage() {
  const { slug } = Route.useParams();
  const area = getServiceArea(slug)!;
  const nearestBranches = area.nearestBranchSlugs
    .map((s) => branches.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));
  const primaryBranch = nearestBranches[0];
  const siblingAreas = serviceAreas.filter((a) => a.slug !== area.slug).slice(0, 4);

  return (
    <div className="container-page py-14 md:py-20">
      <nav
        className="flex items-center gap-1 text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link to="/service-areas" className="hover:text-foreground">
          Service Areas
        </Link>
        <span>/</span>
        <span className="text-foreground">{area.name}</span>
      </nav>

      <div className="mt-4 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {area.corridorStops ? "Delivery corridor" : "Delivery area"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Water Refill, Gas Supply &amp; Electronics Delivery in {area.name}
        </h1>
        <p className="mt-3 text-muted-foreground">{area.intro}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {area.corridorStops && (
            <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-lg font-semibold">The route</h2>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  {area.corridorStops.map((stop, i) => (
                    <span key={stop} className="flex items-center gap-2">
                      <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 font-medium">
                        {stop}
                      </span>
                      {i < area.corridorStops!.length - 1 && (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {area.nearbyPlaces.length > 0 && (
            <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-lg font-semibold">Nearby areas we also reach</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {area.nearbyPlaces.map((place) => (
                    <Badge key={place} variant="secondary" className="rounded-full font-normal">
                      {place}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-lg font-semibold">How to order</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Message us on WhatsApp with your exact location — we'll confirm which branch is
                dispatching your order and your delivery window before you pay.
              </p>
              <div className="mt-4">
                <Button asChild className="rounded-full bg-primary text-white hover:bg-primary/90">
                  <a
                    href={waLink(`Hello Aquatace. I'd like to order for delivery in ${area.name}.`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> Order on WhatsApp
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {primaryBranch && (
            <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
              <CardContent className="grid gap-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {nearestBranches.length > 1 ? "Nearest branches" : "Nearest branch"}
                </p>
                {nearestBranches.map((b) => (
                  <Link
                    key={b.slug}
                    to="/branches/$slug"
                    params={{ slug: b.slug }}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-border p-3 text-sm hover:border-primary/60"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-primary" /> {b.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{b.phone}</span>
                  </Link>
                ))}
                <div className="grid gap-2 pt-1">
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <a href={primaryBranch.phoneHref}>
                      <PhoneCall className="mr-2 h-4 w-4" /> Call {primaryBranch.phone}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="grid gap-2 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Other areas we serve
              </p>
              {siblingAreas.map((a) => (
                <Link
                  key={a.slug}
                  to="/service-areas/$slug"
                  params={{ slug: a.slug }}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {a.name}
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
