import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin,
  MessageCircle,
  PhoneCall,
  Clock,
  Navigation,
  Droplet,
  Flame,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { branches, waLink } from "@/lib/business";
import { branchLocalContent } from "@/lib/seo/geo";
import { buildBranchSchema, buildBreadcrumbSchema } from "@/lib/seo/schema";

export const Route = createFileRoute("/branches/$slug")({
  beforeLoad: ({ params }) => {
    if (!branches.some((b) => b.slug === params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const branch = branches.find((b) => b.slug === params.slug);
    if (!branch)
      return { meta: [{ title: "Branch not found" }, { name: "robots", content: "noindex" }] };
    const content = branchLocalContent[branch.slug];
    return {
      meta: [
        { title: content.seoTitle },
        { name: "description", content: content.seoDescription },
        { property: "og:title", content: content.seoTitle },
        { property: "og:description", content: content.seoDescription },
        { property: "og:url", content: `/branches/${branch.slug}` },
        { "script:ld+json": buildBranchSchema(branch, content.nearbyAreas) },
        {
          "script:ld+json": buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Pickup Points", path: "/branches" },
            { name: branch.name, path: `/branches/${branch.slug}` },
          ]),
        },
      ],
      links: [{ rel: "canonical", href: `/branches/${branch.slug}` }],
    };
  },
  component: BranchDetailPage,
});

function BranchDetailPage() {
  const { slug } = Route.useParams();
  const branch = branches.find((b) => b.slug === slug)!;
  const content = branchLocalContent[branch.slug];
  const directionsUrl = `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`;
  const embedUrl = `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}&output=embed`;

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
        <Link to="/branches" className="hover:text-foreground">
          Pickup Points
        </Link>
        <span>/</span>
        <span className="text-foreground">{branch.name}</span>
      </nav>

      <div className="mt-4 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Aquatace pickup point
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Water &amp; Gas Refill Supply — Aquatace {branch.name}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Aquatace's {branch.name} branch serves customers in {branch.address} and the surrounding
          areas. {content.areaNote}
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="grid gap-5 p-6 md:p-8">
              <h2 className="text-lg font-semibold">What's available here</h2>
              <p className="text-sm text-muted-foreground">{branch.available}.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-2xl border border-border p-3 text-sm">
                  <Droplet className="h-4 w-4 shrink-0 text-primary" /> Water
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-border p-3 text-sm">
                  <Flame className="h-4 w-4 shrink-0 text-primary" /> Cooking gas
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                  <Tv className="h-4 w-4 shrink-0" /> Electronics — online only
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Electronics and our full water and gas catalogue are also available to order online
                for delivery, dispatched via our{" "}
                <Link
                  to="/branches/$slug"
                  params={{ slug: "membley" }}
                  className="font-medium text-primary hover:underline"
                >
                  Membley hub
                </Link>{" "}
                where this branch doesn't stock an item directly.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="grid gap-4 p-6 md:p-8">
              <h2 className="text-lg font-semibold">Areas we serve near {branch.name}</h2>
              <div className="flex flex-wrap gap-2">
                {content.nearbyAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    {area}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Outside these areas? Our{" "}
                <Link
                  to="/branches/$slug"
                  params={{ slug: "membley" }}
                  className="font-medium text-primary hover:underline"
                >
                  Membley hub
                </Link>{" "}
                coordinates nationwide dispatch — order from anywhere in Kenya.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="p-0">
              <iframe
                title={`Map of Aquatace ${branch.name}`}
                src={embedUrl}
                className="h-64 w-full rounded-3xl"
                loading="lazy"
              />
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="grid gap-4 p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Location
                  </p>
                  <p className="text-sm font-medium">{branch.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hours
                  </p>
                  <p className="text-sm font-medium">Mon–Sun · 7:00 AM – 9:00 PM</p>
                </div>
              </div>
              <div className="grid gap-2 pt-2">
                <Button
                  asChild
                  className="w-full rounded-full bg-primary text-white hover:bg-primary/90"
                >
                  <a
                    href={waLink(
                      `Hello Aquatace. I want to order from the ${branch.name} branch.`,
                      branch.whatsapp,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp this branch
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-full">
                  <a href={branch.phoneHref}>
                    <PhoneCall className="mr-2 h-4 w-4" /> Call {branch.phone}
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-full">
                  <a href={directionsUrl} target="_blank" rel="noreferrer">
                    <Navigation className="mr-2 h-4 w-4" /> Get directions
                  </a>
                </Button>
              </div>
              {branch.offer && (
                <p className="rounded-2xl bg-primary/5 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Current offer:</span>{" "}
                  {branch.offer}.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
