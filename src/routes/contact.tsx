import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { business, waLink } from "@/lib/business";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — Aquatace" },
      { name: "description", content: "Reach Aquatace by phone, WhatsApp or email. We're open 7 days a week across Nairobi." },
      { property: "og:title", content: "Contact Aquatace" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);
  return (
    <div className="container-page py-12 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Contact</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">We'd love to hear from you.</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Questions, custom orders, bulk requests — we're here every day.</p>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={async (e) => {
              e.preventDefault(); setSending(true);
              await new Promise((r) => setTimeout(r, 600));
              setSending(false);
              (e.target as HTMLFormElement).reset();
              toast.success("Message sent — we'll get back to you shortly.");
            }} className="grid gap-5">
              <div className="grid gap-1.5"><Label htmlFor="c-name">Name</Label><Input id="c-name" required autoComplete="name" /></div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="grid gap-1.5"><Label htmlFor="c-email">Email</Label><Input id="c-email" type="email" required autoComplete="email" /></div>
                <div className="grid gap-1.5"><Label htmlFor="c-phone">Phone</Label><Input id="c-phone" type="tel" autoComplete="tel" /></div>
              </div>
              <div className="grid gap-1.5"><Label htmlFor="c-msg">Message</Label><Textarea id="c-msg" rows={5} required /></div>
              <Button type="submit" size="lg" className="h-12 rounded-full" disabled={sending}>
                {sending ? "Sending…" : <><Send className="mr-2 h-4 w-4" /> Send message</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {[
            { Icon: Phone, title: "Call us", value: business.phone, href: business.phoneHref },
            { Icon: MessageCircle, title: "WhatsApp", value: business.phone, href: waLink("Hi Aquatace, I have a question.") },
            { Icon: Mail, title: "Email", value: business.email, href: business.emailHref },
            { Icon: MapPin, title: "Visit us", value: business.address, href: business.mapUrl },
          ].map((c) => (
            <a key={c.title} href={c.href} target={c.title === "WhatsApp" || c.title === "Visit us" ? "_blank" : undefined} rel="noreferrer"
              className="group card-lift card-lift-hover flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary"><c.Icon className="h-5 w-5" /></div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.title}</p>
                <p className="mt-0.5 truncate font-semibold group-hover:text-primary">{c.value}</p>
              </div>
            </a>
          ))}
          <div className="mt-2 overflow-hidden rounded-3xl border border-border/60 shadow-[var(--shadow-soft)]">
            <iframe title="Map" src="https://www.google.com/maps?q=Nairobi&output=embed" className="h-64 w-full" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
}
