import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Aquatace" },
      { name: "description", content: "Answers to common questions about ordering, delivery, gas refills and returns." },
      { property: "og:title", content: "Frequently asked questions" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FAQPage,
});

const faqs = [
  { q: "Where do you deliver?", a: "We deliver across Nairobi and surrounding areas. Nationwide delivery is available via courier (1–3 business days)." },
  { q: "How fast is delivery?", a: "Same-day delivery for orders placed before 5 PM in Nairobi. Water and gas typically arrive within 60 minutes." },
  { q: "Do I need an account to order?", a: "No account needed. Just add items to your cart, fill in your delivery details and we'll take it from there." },
  { q: "How do I pay?", a: "You'll pay on delivery via M-Pesa or cash. We confirm the exact amount, including delivery, when we call to confirm your order." },
  { q: "Are your gas cylinders genuine?", a: "Yes — all cylinders are sealed, certified and sourced directly from Total, K-Gas, Pro Gas and Menengai." },
  { q: "Do you deliver?", a: "Yes. The current 10% discount and free delivery offer applies in Membley, Marurui and Kihunguro. Ting'ang'a has a shop but is not part of the current offer." },
  { q: "Can I order on WhatsApp?", a: "Absolutely — use the WhatsApp button anywhere on the site to chat with us directly." },
];

function FAQPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Frequently asked questions</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Everything you need to know about ordering with Aquatace.</p>
      <div className="mt-10 max-w-3xl">
        <Accordion type="single" collapsible className="rounded-3xl border border-border/60 bg-card px-2 shadow-[var(--shadow-soft)]">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`} className="border-b border-border/60 last:border-0">
              <AccordionTrigger className="px-4 text-left text-base font-semibold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
