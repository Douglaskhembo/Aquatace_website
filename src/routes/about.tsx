import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Heart, Leaf, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — Aquatace Water & Gas" },
      { name: "description", content: "Aquatace is a Kenyan supplier of water refills, bottled water and cooking gas. Built on trust, delivered with care." },
      { property: "og:title", content: "About Aquatace Water & Gas" },
      { property: "og:description", content: "Clean. Pure. Reliable." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page py-16 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">About</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            A modern Kenyan essentials store, built for busy lives.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Aquatace Water &amp; Gas was founded to make everyday errands effortless.
            One trusted local supplier for the two things every home needs — clean drinking water and cooking gas — serving Marurui, Kihunguro, Membley and Ting'ang'a.
          </p>
        </div>
      </section>

      <section className="container-page mt-16 grid gap-4 md:grid-cols-4">
        {[
          { Icon: Users, k: "10,000+", v: "Happy customers" },
          { Icon: Award, k: "6+ years", v: "Serving Nairobi" },
          { Icon: Leaf, k: "100%", v: "Certified products" },
          { Icon: Heart, k: "4.9★", v: "Average rating" },
        ].map((s) => (
          <Card key={s.v} className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-primary"><s.Icon className="h-5 w-5" /></div>
              <p className="mt-4 text-2xl font-bold">{s.k}</p>
              <p className="text-sm text-muted-foreground">{s.v}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="container-page mt-20 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Our mission</h2>
          <p className="mt-4 text-muted-foreground">
            To make the essentials effortless. We combine reliable products, fair prices and honest service so you can
            focus on what matters most.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Our values</h2>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li><span className="font-semibold text-foreground">Trust.</span> Sealed, certified and genuine — every time.</li>
            <li><span className="font-semibold text-foreground">Speed.</span> Same-day delivery across Nairobi.</li>
            <li><span className="font-semibold text-foreground">Care.</span> Real humans, quick to help, always.</li>
          </ul>
        </div>
      </section>

      <section className="container-page mt-20 rounded-3xl bg-primary p-10 text-primary-foreground md:p-14">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Ready to order?</h2>
        <p className="mt-3 max-w-xl text-primary-foreground/85">Browse our products or reach out — we're one tap away.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary" className="rounded-full"><Link to="/products">Shop products</Link></Button>
          <Button asChild size="lg" className="rounded-full bg-white/15 text-primary-foreground hover:bg-white/25"><Link to="/contact">Contact us</Link></Button>
        </div>
      </section>
    </div>
  );
}
