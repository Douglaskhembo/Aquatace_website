export const business = {
  name: "Aquatace Water & Gas",
  shortName: "Aquatace",
  tagline: "Clean. Pure. Reliable.",
  description:
    "Water refills, bottled water and cooking gas supply — serving Marurui, Kihunguro, Membley and Ting'ang'a.",
  phone: "0707 201072",
  phoneHref: "tel:+254707201072",
  whatsapp: "254707201072",
  whatsappHref: "https://wa.me/254707201072",
  email: "orders@aquatacetcommodities.co.ke",
  emailHref: "mailto:orders@aquatacetcommodities.co.ke",
  address: "Serving Marurui, Kihunguro, Membley & Ting'ang'a — Kenya",
  mapUrl: "https://maps.google.com/?q=Marurui,Nairobi,Kenya",
  hours: "Mon–Sun · 7:00 AM – 9:00 PM",
  offer: {
    title: "10% Discount + Free Delivery",
    areas: "Membley, Marurui & Kihunguro",
    contactLabel: "Membley Branch",
    contactPhone: "0707 201072",
    contactWa: "254707201072",
  },
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    twitter: "https://twitter.com/",
  },
} as const;

export type BranchInfo = {
  slug: string;
  name: string;
  blurb: string;
  available: string;
  serves: string;
  phone: string; // display
  phoneHref: string; // tel:
  whatsapp: string; // digits only, e.g. 254795199701
  offer?: string;
  featured?: boolean;
  /** County the branch sits in — for LocalBusiness schema and county-level SEO pages. */
  county: "Nairobi" | "Kiambu";
  /** Full postal-style address, for LocalBusiness schema. */
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
};

export const branches: BranchInfo[] = [
  {
    slug: "marurui",
    name: "Marurui",
    blurb: "Water and gas service point.",
    available: "Water refills, bottled water, 6kg gas, 13kg gas",
    serves: "Thome, Ridgeways and its environs",
    phone: "0795 199 701",
    phoneHref: "tel:+254795199701",
    whatsapp: "254795199701",
    offer: "10% discount + free delivery",
    featured: true,
    county: "Nairobi",
    address: "Marurui, Nairobi",
    latitude: -1.228,
    longitude: 36.8536,
    openingHours: "Mon-Sun 07:00-21:00",
  },
  {
    slug: "kihunguro",
    name: "Kihunguro",
    blurb: "Water and gas service point.",
    available: "Water refills, bottled water, 6kg gas, 13kg gas",
    serves: "Kamakis, Thika Super Highway and its environs",
    phone: "0713 727 229",
    phoneHref: "tel:+254713727229",
    whatsapp: "254713727229",
    offer: "10% discount + free delivery",
    featured: true,
    county: "Kiambu",
    address: "Kihunguro, Ruiru",
    latitude: -1.153,
    longitude: 36.97,
    openingHours: "Mon-Sun 07:00-21:00",
  },
  {
    slug: "membley",
    name: "Membley",
    blurb: "Branch serving customers around Membley. Main contact for the featured offer.",
    available: "Gas supply and selected water products",
    serves: "Membley and its environs",
    phone: "0707 201 072",
    phoneHref: "tel:+254707201072",
    whatsapp: "254707201072",
    offer: "10% discount + free delivery",
    featured: true,
    county: "Kiambu",
    address: "Membley Estate, Ruiru",
    latitude: -1.165,
    longitude: 36.955,
    openingHours: "Mon-Sun 07:00-21:00",
  },
  {
    slug: "tinganga",
    name: "Ting'ang'a",
    blurb: "Shop location for water and gas enquiries.",
    available: "Water refills, bottled water, 6kg gas, 13kg gas",
    serves: "Kiambu, Githunguri and its environs",
    phone: "0112 819 068",
    phoneHref: "tel:+254112819068",
    whatsapp: "254112819068",
    offer: "Shop location — no current offer",
    county: "Kiambu",
    address: "Ting'ang'a, Kiambu",
    latitude: -1.155,
    longitude: 36.81,
    openingHours: "Mon-Sun 07:00-21:00",
  },
];

export function waLink(message: string, phone: string = business.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
