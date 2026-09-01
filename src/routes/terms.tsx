import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo/config";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Aquatace" },
      { name: "description", content: "Terms of use for the Aquatace Water & Gas website and services." },
      { property: "og:url", content: `${SITE_URL}/terms` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>

        <Section title="Ordering">
          Placing an order constitutes an offer to purchase. We confirm every order by email, SMS or WhatsApp before dispatch.
        </Section>
        <Section title="Pricing">
          Prices are in Kenyan Shillings and include VAT where applicable. Delivery fees are calculated at confirmation.
        </Section>
        <Section title="Payment">
          Payment is due on delivery via M-Pesa or cash unless otherwise agreed in writing.
        </Section>
        <Section title="Delivery">
          Delivery times are estimates. Please provide accurate location details to avoid delays.
        </Section>
        <Section title="Returns">
          Water bottles and LPG cylinders cannot be returned once seals are broken, for hygiene and safety reasons.
        </Section>
        <Section title="Liability">
          We aren't liable for indirect losses arising from delays outside our control.
        </Section>
        <Section title="Governing law">
          These terms are governed by the laws of Kenya.
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{children}</p>
    </section>
  );
}
