import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, MessageCircle, PhoneCall, Navigation, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { branches, waLink } from "@/lib/business";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "Pickup Points — Aquatace Water & Gas" },
      {
        name: "description",
        content:
          "Aquatace pickup points in Marurui, Kihunguro, Membley and Ting'ang'a. We deliver countrywide across Kenya — call or WhatsApp to order.",
      },
      { property: "og:title", content: "Pickup Points — Aquatace Water & Gas" },
      {
        property: "og:description",
        content: "Walk-in pickup points plus nationwide delivery across Kenya.",
      },
    ],
    links: [{ rel: "canonical", href: "/branches" }],
  }),
  component: BranchesPage,
});

function BranchesPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Pickup points
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Walk-in & pickup locations
        </h1>
        <p className="mt-3 text-muted-foreground">
          We're primarily an online store serving all of Kenya. These are our walk-in pickup points
          across Nairobi and Kiambu. Outside these areas? Our{" "}
          <span className="font-semibold text-foreground">Membley hub</span> coordinates nationwide
          delivery — order from anywhere in Kenya.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {branches.map((b, i) => (
          <motion.div
            key={b.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <Card className="card-lift card-lift-hover h-full rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-water text-white">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-xl font-bold">{b.name}</h2>
                      <p className="text-sm text-muted-foreground">{b.blurb}</p>
                    </div>
                  </div>
                  {b.featured && (
                    <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                      Offer
                    </Badge>
                  )}
                </div>
                <dl className="mt-5 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-semibold text-foreground">Available:</dt>
                    <dd className="text-muted-foreground">{b.available}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-semibold text-foreground">Also serves:</dt>
                    <dd className="text-muted-foreground">{b.serves}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-semibold text-foreground">
                      Call / WhatsApp:
                    </dt>
                    <dd>
                      <a href={b.phoneHref} className="font-semibold text-primary hover:underline">
                        {b.phone}
                      </a>
                      {b.offer && (
                        <span className="ml-2 text-xs text-muted-foreground italic">
                          — {b.offer}
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    asChild
                    className="rounded-full bg-primary text-white hover:bg-primary/90"
                  >
                    <a
                      href={waLink(
                        `Hello Aquatace Water & Gas. I want help from the ${b.name} pickup point.`,
                        b.whatsapp,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <a href={b.phoneHref}>
                      <PhoneCall className="mr-2 h-4 w-4" /> Call
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <a
                      href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Navigation className="mr-2 h-4 w-4" /> Directions
                    </a>
                  </Button>
                </div>
                <Link
                  to="/branches/$slug"
                  params={{ slug: b.slug }}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View branch details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <div className="mt-5 overflow-hidden rounded-2xl border border-border/60">
                  <iframe
                    title={`Map pin for Aquatace ${b.name}`}
                    src={`https://www.google.com/maps?q=${b.latitude},${b.longitude}&output=embed`}
                    className="h-40 w-full"
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
