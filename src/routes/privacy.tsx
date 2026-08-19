import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Aquatace" },
      { name: "description", content: "How Aquatace collects, uses and protects your personal information." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <article className="prose mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>

        <Section title="Information we collect">
          We collect the information you provide at checkout — your name, phone number, delivery location and,
          optionally, your email. We also collect basic technical information (device type, pages viewed) to improve our service.
        </Section>
        <Section title="How we use it">
          We use your information to process and deliver your orders, contact you about your order (via email, SMS
          and WhatsApp) and improve our service. We don't sell your data to third parties.
        </Section>
        <Section title="Sharing">
          We share only the minimum information needed with our delivery partners so they can reach you.
        </Section>
        <Section title="Retention">
          We keep order records for as long as necessary for legal and business purposes.
        </Section>
        <Section title="Your rights">
          You can request access to, correction of, or deletion of your personal data at any time by contacting us.
        </Section>
        <Section title="Contact">
          Questions about this policy? Email us at <a href="mailto:orders@aquatacet.co.ke" className="underline">orders@aquatacet.co.ke</a>.
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
