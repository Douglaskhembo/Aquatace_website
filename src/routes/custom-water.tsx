import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Droplet, MessageCircle, PhoneCall, Sparkles, PartyPopper, HeartHandshake, Building2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { business, waLink } from "@/lib/business";

export const Route = createFileRoute("/custom-water")({
  head: () => ({
    meta: [
      { title: "Custom Branded Water — Weddings, Funerals & Events | Aquatace" },
      { name: "description", content: "Personalised Aquatace bottled water for weddings, funerals, corporate meetings, church events and school functions. Custom labels with your names, colours and logo — delivered countrywide in Kenya." },
      { property: "og:title", content: "Custom Branded Water for Events — Aquatace" },
      { property: "og:description", content: "Personalised water bottles for weddings, funerals, meetings and corporate events. Countrywide delivery in Kenya." },
    ],
    links: [{ rel: "canonical", href: "/custom-water" }],
  }),
  component: CustomWaterPage,
});

const EVENT_TYPES = [
  { key: "wedding", label: "Wedding", Icon: HeartHandshake, blurb: "His & Hers names, date, photo or monogram." },
  { key: "funeral", label: "Funeral / Memorial", Icon: Droplet, blurb: "Respectful memorial label with photo, dates and message." },
  { key: "corporate", label: "Corporate / Meetings", Icon: Building2, blurb: "Company logo, brand colours & event name." },
  { key: "party", label: "Birthdays & Parties", Icon: PartyPopper, blurb: "Fun themed labels for birthdays and celebrations." },
  { key: "church", label: "Church / Fundraisers", Icon: Sparkles, blurb: "Custom labels for harambees, dedications and church events." },
  { key: "school", label: "Schools & Graduations", Icon: GraduationCap, blurb: "School crest, class of… and graduation labels." },
];

const SIZES = ["500ml", "1L", "10L", "20L"] as const;

const HERO_TILES = [
  { label: "Wedding", image: "/custom-water/wedding.jpg" },
  { label: "Corporate", image: "/custom-water/corporate.jpg" },
  { label: "Memorial", image: "/custom-water/memorial.jpg" },
  { label: "Birthday", image: "/custom-water/birthday.jpg" },
  { label: "Church", image: "/custom-water/church.jpg" },
  { label: "Graduation", image: "/custom-water/graduation.jpg" },
] as const;

function CustomWaterPage() {
  const [eventType, setEventType] = useState<string>("wedding");
  const [size, setSize] = useState<(typeof SIZES)[number]>("500ml");
  const [qty, setQty] = useState<number>(200);
  const [eventDate, setEventDate] = useState<string>("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const message = useMemo(() => {
    const t = EVENT_TYPES.find((e) => e.key === eventType)?.label ?? eventType;
    return [
      `Hello Aquatace Water & Gas — I'd like to order CUSTOM BRANDED WATER.`,
      `• Event type: ${t}`,
      `• Bottle size: ${size}`,
      `• Quantity: ${qty} bottles`,
      eventDate ? `• Event date: ${eventDate}` : null,
      name ? `• Name / Company: ${name}` : null,
      notes ? `• Notes: ${notes}` : null,
      `Please send a quote and label mockup.`,
    ].filter(Boolean).join("\n");
  }, [eventType, size, qty, eventDate, name, notes]);

  return (
    <div>
      {/* HERO */}
      <section className="gradient-water text-white">
        <div className="container-page grid gap-8 py-12 md:grid-cols-12 md:py-16">
          <div className="md:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/85">Custom branded water</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
              Personalised water for your special day
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
              Weddings, funerals, corporate meetings, church events, birthdays and graduations —
              Aquatace bottled water with <span className="font-semibold">your names, photos, logo and colours</span> on the label. Countrywide delivery across Kenya.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90">
                <a href={waLink(message)} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp for a quote
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/60 bg-transparent text-white hover:bg-white/10">
                <a href={business.phoneHref}><PhoneCall className="mr-2 h-4 w-4" /> {business.phone}</a>
              </Button>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
                {HERO_TILES.map((t) => (
                  <div key={t.label} className="relative flex flex-col items-center justify-end overflow-hidden rounded-2xl bg-white/15 p-2 text-[10px] font-semibold uppercase tracking-widest">
                    {t.image ? (
                      <>
                        <img src={t.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      </>
                    ) : (
                      <Droplet className="relative mb-2 h-8 w-8" />
                    )}
                    <span className="relative text-center leading-tight text-white drop-shadow">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENT TYPES */}
      <section className="container-page mt-12">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Pick your event type</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose the closest match — our design team tailors labels to your theme.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EVENT_TYPES.map((e) => {
            const active = eventType === e.key;
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => setEventType(e.key)}
                className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                  active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-card hover:border-primary/60"
                }`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-primary text-white" : "bg-accent text-primary"}`}>
                  <e.Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">{e.label}</span>
                <span className="text-xs text-muted-foreground">{e.blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* QUOTE FORM */}
      <section className="container-page mt-10 mb-16">
        <Card className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
          <CardContent className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold">Get your quote & label mockup</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill in the basics — we'll reply on WhatsApp with pricing, sample designs and a delivery ETA anywhere in Kenya.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="col-span-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Bottle size
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          size === s ? "border-primary bg-primary text-white" : "border-border bg-card hover:border-primary/60"
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </label>

                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Quantity
                  <input
                    type="number" min={50} step={50} value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 0))}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>

                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Event date
                  <input
                    type="date" value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>

                <label className="col-span-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Your name / company
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John & Jane · Acme Ltd"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>

                <label className="col-span-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Design notes (colours, logo, message)
                  <textarea
                    rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Navy & gold. Attach photo on WhatsApp. Message: 'Together forever — 12.12.2026'."
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild size="lg" className="rounded-full bg-primary text-white hover:bg-primary/90">
                  <a href={waLink(message)} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" /> Send on WhatsApp
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <a href={`mailto:${business.email}?subject=${encodeURIComponent("Custom branded water enquiry")}&body=${encodeURIComponent(message)}`}>
                    Email us instead
                  </a>
                </Button>
              </div>
            </div>

            {/* PREVIEW */}
            <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Message preview</p>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-background p-4 text-xs leading-relaxed text-foreground">{message}</pre>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Minimum order 50 bottles. Final artwork is confirmed before printing. Countrywide delivery from our Membley hub — local pickup available in Nairobi & Kiambu.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
