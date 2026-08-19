export type CategorySlug = "water" | "gas" | "electronics";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  accent: "water" | "gas" | "electronics";
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  brand: string;
  price: number; // KES — indicative, confirm on WhatsApp
  size?: string;
  productType?: string; // electronics: Earbuds | Earphones | Charger | Power Bank | Cable | Phone Accessory
  description: string;
  specs: { label: string; value: string }[];
  featured?: boolean;
  badge?: string;
  image?: string;
  imagePath?: string; // Supabase Storage object path, used to clean up on delete
  active: boolean;
  sortOrder: number;
}

export const categories: Category[] = [
  {
    slug: "water",
    name: "Drinking Water",
    tagline: "Pure. Fresh. Reliable.",
    description:
      "Clean drinking water refills and bottled water in 500ml, 1L, 10L and 20L for homes, offices and events.",
    accent: "water",
  },
  {
    slug: "gas",
    name: "Cooking Gas",
    tagline: "6kg & 13kg refills.",
    description:
      "Reliable 6kg and 13kg cooking gas supply for households. Call or WhatsApp for today's price and delivery.",
    accent: "gas",
  },
  {
    slug: "electronics",
    name: "Electronics",
    tagline: "Oraimo, Samsung & more.",
    description:
      "Genuine Oraimo earbuds, earphones, chargers, power banks and Samsung accessories — quick delivery across our branches.",
    accent: "electronics",
  },
];

export function getProduct(products: Product[], id: string) {
  return products.find((p) => p.id === id || p.slug === id);
}

export function getProductsByCategory(products: Product[], slug: CategorySlug) {
  return products.filter((p) => p.category === slug);
}

export function getFeatured(products: Product[]) {
  return products.filter((p) => p.featured);
}

export function getRelated(products: Product[], product: Product, limit = 4) {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}
