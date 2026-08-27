import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  MessageCircle,
  Clock,
} from "lucide-react";
import { business, branches } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { LOGO_URL, LOGO_WIDTH, LOGO_HEIGHT } from "@/assets/logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-secondary/40">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <img
              src={LOGO_URL}
              alt="Aquatace Water & Gas"
              className="h-16 w-auto"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
            />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Water refills, bottled water and cooking gas supply for local visibility and fast
              customer ordering.
            </p>
            <p className="mt-4 text-sm font-semibold">Clean. Pure. Reliable.</p>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold">Pickup Points</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {branches.map((b) => (
                <li key={b.slug} className="flex items-start justify-between gap-2">
                  <Link
                    to="/branches/$slug"
                    params={{ slug: b.slug }}
                    className="hover:text-foreground"
                  >
                    {b.name}
                  </Link>
                  <a href={b.phoneHref} className="text-xs tabular-nums hover:text-foreground">
                    {b.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold">Quick links</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/products" className="hover:text-foreground">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/custom-water" className="hover:text-foreground">
                  Custom Water
                </Link>
              </li>
              <li>
                <Link to="/branches" className="hover:text-foreground">
                  Pickup Points
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-foreground">
                  Locations
                </Link>
              </li>
              <li>
                <Link to="/service-areas" className="hover:text-foreground">
                  Service Areas
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-foreground">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold">Get in touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={business.phoneHref} className="hover:text-foreground">
                  {business.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <a
                  href={business.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  WhatsApp us
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={business.emailHref} className="hover:text-foreground">
                  {business.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{business.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{business.hours}</span>
              </li>
            </ul>
            <div className="mt-5 flex gap-2">
              <Button asChild variant="outline" size="icon" className="rounded-full">
                <a href={business.social.facebook} aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="icon" className="rounded-full">
                <a href={business.social.instagram} aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="icon" className="rounded-full">
                <a href={business.social.twitter} aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <p>Serving Marurui · Kihunguro · Membley · Ting'ang'a</p>
        </div>
      </div>
    </footer>
  );
}
