import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { branches, waLink } from "@/lib/business";
import { getCounty, getServiceArea } from "@/lib/seo/geo";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export const Route = createFileRoute("/locations/$slug")({
  beforeLoad: ({ params }) => {
    if (!getCounty(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const county = getCounty(params.slug);
    if (!county)
      return { meta: [{ title: "County not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: county.seoTitle },
        { name: "description", content: county.seoDescription },
        { property: "og:title", content: county.seoTitle },
        { property: "og:description", content: county.seoDescription },
        { property: "og:url", content: `/locations/${county.slug}` },
        {
          "script:ld+json": buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Locations", path: "/locations" },
            { name: `${county.name} County`, path: `/locations/${county.slug}` },
          ]),
        },
      ],
      links: [{ rel: "canonical", href: `/locations/${county.slug}` }],
    };
  },
  component: CountyPage,
});

function CountyPage() {
  const { slug } = Route.useParams();
  const county = getCounty(slug)!;
  const countyBranches = county.branchSlugs
    .map((s) => branches.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));
  const countyAreas = county.serviceAreaSlugs
    .map((s) => getServiceArea(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

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
        <Link to="/locations" className="hover:text-foreground">
          Locations
        </Link>
        <span>/</span>
        <span className="text-foreground">{county.name}</span>
      </nav>

      <div className="mt-4 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {county.hasPhysicalBranch ? "Branches + delivery" : "Delivery area"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Water, LPG Gas &amp; Electronics Delivery in {county.name} County
        </h1>
        <p className="mt-3 text-muted-foreground">{county.intro}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {countyBranches.length > 0 && (
          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="grid gap-3 p-6 md:p-8">
              <h2 className="text-lg font-semibold">Branches in {county.name}</h2>
              {countyBranches.map((b) => (
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
            </CardContent>
          </Card>
        )}

        {countyAreas.length > 0 && (
          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="grid gap-3 p-6 md:p-8">
              <h2 className="text-lg font-semibold">Service areas in {county.name}</h2>
              <div className="flex flex-wrap gap-2">
                {countyAreas.map((a) => (
                  <Link key={a.slug} to="/service-areas/$slug" params={{ slug: a.slug }}>
                    <Badge
                      variant="secondary"
                      className="rounded-full font-normal hover:bg-primary/10 hover:text-primary"
                    >
                      {a.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {county.otherPlaces.length > 0 && (
          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)] lg:col-span-2">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-lg font-semibold">Other areas we reach in {county.name}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {county.otherPlaces.map((place) => (
                  <Badge key={place} variant="secondary" className="rounded-full font-normal">
                    {place}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)] lg:col-span-2">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6 md:p-8">
            <div>
              <h2 className="text-lg font-semibold">Ready to order?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Message us your exact location on WhatsApp and we'll confirm delivery details.
              </p>
            </div>
            <Button asChild className="rounded-full bg-primary text-white hover:bg-primary/90">
              <a
                href={waLink(
                  `Hello Aquatace. I'd like to order for delivery in ${county.name} County.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Order on WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
