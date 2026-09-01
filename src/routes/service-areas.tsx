import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { serviceAreas } from "@/lib/seo/geo";
import { SITE_URL } from "@/lib/seo/config";

export const Route = createFileRoute("/service-areas")({
  head: () => ({
    meta: [
      { title: "Delivery Service Areas | Aquatace Water & Gas" },
      {
        name: "description",
        content:
          "Water, LPG gas and electronics delivery areas around Aquatace's Nairobi and Kiambu branches — Kasarani, Ruiru, Githurai, Kimbo, Tatu City, Juja and the Thika Road corridor.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/service-areas` }],
  }),
  component: ServiceAreasPage,
});

function ServiceAreasPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Delivery coverage
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Service areas</h1>
        <p className="mt-3 text-muted-foreground">
          Real areas around our four branches where we deliver water, LPG cooking gas and
          electronics. See{" "}
          <Link to="/branches" className="font-medium text-primary hover:underline">
            our pickup points
          </Link>{" "}
          or{" "}
          <Link to="/locations" className="font-medium text-primary hover:underline">
            counties we serve
          </Link>{" "}
          for more.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {serviceAreas.map((area) => (
          <Link key={area.slug} to="/service-areas/$slug" params={{ slug: area.slug }}>
            <Card className="card-lift card-lift-hover h-full rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
              <CardContent className="flex items-start gap-3 p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-water text-white">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-semibold">{area.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {area.county
                      ? `${area.county[0].toUpperCase()}${area.county.slice(1)} County`
                      : "Thika Road corridor"}
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
