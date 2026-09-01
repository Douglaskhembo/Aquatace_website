import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { counties } from "@/lib/seo/geo";
import { SITE_URL } from "@/lib/seo/config";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Counties We Deliver To | Aquatace Water & Gas" },
      {
        name: "description",
        content:
          "Aquatace delivers purified water, LPG cooking gas and electronics across Nairobi and Kiambu counties, with dispatch to Murang'a County coordinated via our Membley hub.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/locations` }],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Where we deliver
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Counties we serve</h1>
        <p className="mt-3 text-muted-foreground">
          Our four branches are concentrated in Nairobi and Kiambu counties. Outside that core area,
          our Membley hub coordinates nationwide dispatch.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counties.map((county) => (
          <Link key={county.slug} to="/locations/$slug" params={{ slug: county.slug }}>
            <Card className="card-lift card-lift-hover h-full rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
              <CardContent className="flex items-start gap-3 p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-water text-white">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-semibold">{county.name} County</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {county.hasPhysicalBranch
                      ? `${county.branchSlugs.length} branch${county.branchSlugs.length > 1 ? "es" : ""}`
                      : "Delivery only"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
