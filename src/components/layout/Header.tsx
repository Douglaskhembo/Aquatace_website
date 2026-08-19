import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, Phone, X, MessageCircle } from "lucide-react";
import logoAsset from "@/assets/aquatace-logo.png.asset.json";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { business, waLink } from "@/lib/business";

type NavItem = { to: string; label: string; isHash?: boolean };
const nav: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/custom-water", label: "Custom Water" },
  { to: "/branches", label: "Pickup Points" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-page">
        <div className="flex h-16 items-center gap-6 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" aria-label="Aquatace home">
            <img
              src={logoAsset.url}
              alt="Aquatace Water & Gas"
              className="h-9 w-auto sm:h-10 lg:h-11"
              width={220}
              height={44}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((n) =>
              n.isHash ? (
                <a
                  key={n.to}
                  href={n.to}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {n.label}
                </a>
              ) : (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "rounded-full px-3.5 py-2 text-sm font-semibold bg-secondary text-foreground" }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {n.label}
                </Link>
              )
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <a
              href={business.phoneHref}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:inline-flex"
            >
              <Phone className="h-4 w-4" /> {business.phone}
            </a>
            <Button asChild variant="ghost" size="icon" aria-label={`Cart (${count} items)`} className="relative">
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="hidden rounded-full bg-primary px-4 text-white hover:bg-primary/90 sm:inline-flex"
            >
              <a href={waLink("Hello Aquatace Water & Gas. I want to order today.")} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-1.5 h-4 w-4" /> Order Now
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-4 pt-1">
            <nav className="grid gap-1" aria-label="Mobile primary">
              {nav.map((n) =>
                n.isHash ? (
                  <a
                    key={n.to}
                    href={n.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  >
                    {n.label}
                  </a>
                ) : (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                    activeProps={{ className: "rounded-xl px-3 py-3 text-base font-semibold bg-secondary text-foreground" }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    {n.label}
                  </Link>
                )
              )}
              <a
                href={waLink("Hello Aquatace Water & Gas. I want to order today.")}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-xl bg-primary px-3 py-3 text-white"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
              <a href={business.phoneHref} className="flex items-center gap-2 rounded-xl bg-primary px-3 py-3 text-primary-foreground">
                <Phone className="h-4 w-4" /> Call {business.phone}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
