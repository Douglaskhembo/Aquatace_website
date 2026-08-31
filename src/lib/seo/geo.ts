// Local-SEO content data: real service areas and counties around Aquatace's four
// physical branches (see `branches` in @/lib/business). This is presentation/content
// data only — it never feeds order routing or delivery-fee logic, which continues to
// live in orders.functions.ts against the `branches` table.
//
// Every area listed here is a place Aquatace genuinely delivers to or near. Areas the
// business hasn't confirmed coverage for are deliberately left out rather than guessed.

export type CountySlug = "nairobi" | "kiambu" | "muranga";

export interface BranchLocalContent {
  /** Areas immediately around the branch, beyond the short `serves` line in business.ts. */
  nearbyAreas: string[];
  /** One extra sentence of area-specific colour for the branch page, in addition to `blurb`. */
  areaNote: string;
  seoTitle: string;
  seoDescription: string;
}

/** Keyed by branch slug (business.ts `branches[].slug`). */
export const branchLocalContent: Record<string, BranchLocalContent> = {
  marurui: {
    nearbyAreas: [
      "Kasarani",
      "Thome",
      "Ridgeways",
      "Mirema",
      "Garden Estate",
      "Roysambu",
      "Zimmerman",
      "Githurai",
      "Mwiki",
      "Kahawa",
    ],
    areaNote:
      "Marurui sits inside Kasarani, so this branch is usually the fastest for water and gas orders anywhere along the Kasarani side of Thika Road.",
    seoTitle: "Aquatace Marurui — Water & Gas Refill Supply in Kasarani",
    seoDescription:
      "Need gas refill or gas supply in Marurui? Order purified drinking water and LPG cooking gas refills from Aquatace's Marurui branch, serving Kasarani, Thome, Ridgeways, Roysambu and Zimmerman. Call or WhatsApp 0795 199 701.",
  },
  kihunguro: {
    nearbyAreas: [
      "Ruiru",
      "Ruiru Town",
      "Githurai",
      "Kimbo",
      "Kahawa Sukari",
      "Kahawa Wendani",
      "Kamakis",
      "Juja",
      "Thika Road",
    ],
    areaNote:
      "Kihunguro sits right on the Thika Road/Ruiru corridor, putting most of Ruiru town and the Kahawa Sukari/Kahawa Wendani estates within easy reach.",
    seoTitle: "Aquatace Kihunguro — Water & Gas Refill Supply in Ruiru",
    seoDescription:
      "Need gas refill or gas supply in Ruiru? Aquatace's Kihunguro branch delivers water refills and LPG cooking gas across Ruiru, Kahawa Sukari, Kahawa Wendani and Kamakis. Call or WhatsApp 0713 727 229.",
  },
  membley: {
    nearbyAreas: [
      "Ruiru",
      "Ruiru Town",
      "Kihunguro",
      "Kimbo",
      "Gitambaya",
      "Githurai",
      "Kahawa Sukari",
      "Kahawa Wendani",
      "Kenyatta University",
      "Tatu City",
      "Eastern Bypass",
      "Kamakis",
      "Juja",
      "OJ",
    ],
    areaNote:
      "Membley's position near Thika Road, Kenyatta University, Kamakis and Tatu City makes it our main coordination point for orders further out along this corridor — including nationwide dispatch outside our core Nairobi/Kiambu coverage.",
    seoTitle: "Aquatace Membley — Water & Gas Refill Supply Near Kenyatta University",
    seoDescription:
      "Need gas refill or gas supply in Membley? Order water and LPG gas refills for delivery in Membley, Ruiru and nearby Tatu City and Kenyatta University from Aquatace. Call or WhatsApp 0707 201 072.",
  },
  tinganga: {
    nearbyAreas: [
      "Kiambu",
      "Kiambu Town",
      "Ndumberi",
      "Riabai",
      "Kiambaa",
      "Thindigua",
      "Githunguri",
    ],
    areaNote:
      "Ting'ang'a reaches Kiambu town and its immediate neighbourhoods — Ndumberi, Riabai, Kiambaa and Thindigua — and, depending on your exact location, as far as Ruaka, Karuri or Muchatha.",
    seoTitle: "Aquatace Ting'ang'a — Water & Gas Refill Supply in Kiambu",
    seoDescription:
      "Need gas refill or gas supply in Kiambu? Aquatace's Ting'ang'a shop serves Kiambu town, Ndumberi, Riabai and Kiambaa with water refills and LPG cooking gas. Call or WhatsApp 0112 819 068.",
  },
};

export interface ServiceArea {
  slug: string;
  name: string;
  /** Nairobi/Kiambu, or omitted for the Thika Road corridor, which spans both. */
  county?: CountySlug;
  /** Branch slugs most relevant to this area, in priority order. */
  nearestBranchSlugs: string[];
  /** Real neighbouring places mentioned in the copy — not separate pages. */
  nearbyPlaces: string[];
  /** Set only for the Thika Road corridor page. */
  corridorStops?: string[];
  intro: string;
  seoTitle: string;
  seoDescription: string;
}

export const serviceAreas: ServiceArea[] = [
  {
    slug: "kasarani",
    name: "Kasarani",
    county: "nairobi",
    nearestBranchSlugs: ["marurui"],
    nearbyPlaces: [
      "Thome",
      "Ridgeways",
      "Mirema",
      "Garden Estate",
      "Roysambu",
      "Zimmerman",
      "Mwiki",
      "Kahawa",
    ],
    intro:
      "Aquatace's Marurui branch sits inside Kasarani, so water refill and cooking gas orders from Kasarani and its surrounding estates — Thome, Ridgeways, Mirema, Garden Estate, Roysambu, Zimmerman and Mwiki — are usually among the fastest we dispatch. Electronics and the rest of our online catalogue deliver here too, on the same WhatsApp order process as everywhere else we serve.",
    seoTitle: "Gas Refill & Water Supply in Kasarani, Marurui | Aquatace",
    seoDescription:
      "Looking for gas refill or gas supply in Marurui or Kasarani? Order purified drinking water and LPG cooking gas for delivery in Kasarani, Thome, Ridgeways and Roysambu from Aquatace's Marurui branch. Order via WhatsApp.",
  },
  {
    slug: "ruiru",
    name: "Ruiru",
    county: "kiambu",
    nearestBranchSlugs: ["kihunguro", "membley"],
    nearbyPlaces: [
      "Kimbo",
      "Githurai",
      "Gitambaya",
      "Kahawa Sukari",
      "Kahawa Wendani",
      "Kamakis",
      "Varsityville",
      "Mwihoko",
      "Tatu City",
      "Juja",
    ],
    intro:
      "Ruiru is home to two Aquatace branches — Kihunguro on the Thika Road side and Membley Estate nearby — so most of Ruiru town and its estates (Kimbo, Kahawa Sukari, Kahawa Wendani, Kamakis, Gitambaya, Varsityville and Mwihoko) fall within easy reach of at least one of them. Whichever branch is closer handles dispatch; water refills, bottled water, 6kg/13kg gas and our online electronics catalogue can all be ordered on WhatsApp.",
    seoTitle: "Water Refill & Gas Delivery in Ruiru | Aquatace",
    seoDescription:
      "Aquatace's Kihunguro and Membley branches deliver purified water and LPG cooking gas across Ruiru town, Kimbo, Kahawa Sukari and Kamakis. Order via WhatsApp.",
  },
  {
    slug: "githurai",
    name: "Githurai",
    county: "nairobi",
    nearestBranchSlugs: ["marurui", "kihunguro", "membley"],
    nearbyPlaces: ["Kahawa", "Roysambu", "Zimmerman", "Kimbo", "Mwiki"],
    intro:
      "Githurai straddles the Nairobi/Kiambu boundary along Thika Road, so orders here are dispatched from whichever branch is closer — our Marurui branch on the Kasarani side, or Kihunguro and Membley on the Ruiru side. All three stock water refills and cooking gas, and our full catalogue, including electronics, ships here as well.",
    seoTitle: "Water & LPG Gas Delivery in Githurai | Aquatace",
    seoDescription:
      "Order water refill, bottled water and cooking gas for delivery in Githurai on the Nairobi–Kiambu border. Served by Aquatace's Marurui, Kihunguro and Membley branches.",
  },
  {
    slug: "kimbo",
    name: "Kimbo",
    county: "kiambu",
    nearestBranchSlugs: ["kihunguro", "membley"],
    nearbyPlaces: ["Ruiru", "Githurai", "Kahawa Wendani", "Membley", "Kihunguro"],
    intro:
      "Kimbo, on the Ruiru side of Thika Road, sits between our Kihunguro and Membley branches. Order water refills, bottled water or 6kg/13kg cooking gas on WhatsApp and we'll dispatch from whichever branch is closer to your exact location.",
    seoTitle: "Water & Gas Delivery in Kimbo, Ruiru | Aquatace",
    seoDescription:
      "Aquatace's Kihunguro and Membley branches deliver purified water and LPG cooking gas to Kimbo, Ruiru. Order on WhatsApp.",
  },
  {
    slug: "tatu-city",
    name: "Tatu City",
    county: "kiambu",
    nearestBranchSlugs: ["membley"],
    nearbyPlaces: ["Kenyatta University", "Kamakis", "Ruiru", "Juja"],
    intro:
      "Aquatace doesn't have a physical branch inside Tatu City, but our Membley branch — a short distance away on the Ruiru/Kamakis side of Thika Road — delivers water, LPG cooking gas and electronics to residents and businesses there. Order on WhatsApp and we'll confirm delivery timing before dispatch.",
    seoTitle: "Water, LPG Gas & Electronics Delivery in Tatu City | Aquatace",
    seoDescription:
      "Order purified water, cooking gas and electronics for delivery in Tatu City from Aquatace's nearby Membley branch. Delivery only — order via WhatsApp.",
  },
  {
    slug: "juja",
    name: "Juja",
    county: "kiambu",
    nearestBranchSlugs: ["kihunguro", "membley"],
    nearbyPlaces: ["Thika Road", "Ruiru", "Kenyatta University"],
    intro:
      "Juja is further out along Thika Road from our Kihunguro and Membley branches, which coordinate delivery of water refills, cooking gas and electronics this way. Share your exact location on WhatsApp when ordering so we can give you an accurate delivery time.",
    seoTitle: "Water & Cooking Gas Delivery in Juja | Aquatace",
    seoDescription:
      "Aquatace delivers purified water, LPG cooking gas and electronics to Juja from our Kihunguro and Membley branches along Thika Road. Order via WhatsApp.",
  },
  {
    slug: "thika-road",
    name: "Thika Road",
    nearestBranchSlugs: ["marurui", "kihunguro", "membley"],
    nearbyPlaces: [],
    corridorStops: [
      "Marurui",
      "Kasarani",
      "Githurai",
      "Kahawa",
      "Ruiru",
      "Kihunguro",
      "Membley",
      "Kimbo",
      "Juja",
      "Thika",
    ],
    intro:
      "Thika Road is Aquatace's core delivery corridor. From Marurui through Kasarani, Githurai, Kahawa, Ruiru, Kihunguro, Membley and Kimbo, on towards Juja and Thika, our three branches along this route keep water refill and cooking gas delivery times short for the whole stretch. Electronics and the rest of our catalogue order the same way, on WhatsApp.",
    seoTitle: "Water, LPG Gas & Electronics Delivery Along Thika Road | Aquatace",
    seoDescription:
      "Aquatace delivers purified water, cooking gas and electronics along the Thika Road corridor — Marurui, Kasarani, Githurai, Ruiru, Kihunguro, Membley, Kimbo and Juja. Order via WhatsApp.",
  },
];

export function getServiceArea(slug: string): ServiceArea | undefined {
  return serviceAreas.find((s) => s.slug === slug);
}

export interface CountyPage {
  slug: CountySlug;
  name: string;
  branchSlugs: string[];
  serviceAreaSlugs: string[];
  otherPlaces: string[];
  hasPhysicalBranch: boolean;
  intro: string;
  seoTitle: string;
  seoDescription: string;
}

export const counties: CountyPage[] = [
  {
    slug: "nairobi",
    name: "Nairobi",
    branchSlugs: ["marurui"],
    serviceAreaSlugs: ["kasarani", "githurai", "thika-road"],
    otherPlaces: [
      "Thome",
      "Ridgeways",
      "Mirema",
      "Garden Estate",
      "Roysambu",
      "Zimmerman",
      "Mwiki",
      "Kahawa",
    ],
    hasPhysicalBranch: true,
    intro:
      "In Nairobi County, Aquatace's Marurui branch — inside Kasarani — delivers purified drinking water, bottled water, 6kg and 13kg cooking gas, and our online electronics catalogue across Kasarani and neighbouring estates: Thome, Ridgeways, Mirema, Garden Estate, Roysambu, Zimmerman and Mwiki. Order online or on WhatsApp for delivery.",
    seoTitle: "Water, LPG Gas & Electronics Delivery in Nairobi | Aquatace",
    seoDescription:
      "Aquatace's Marurui branch delivers purified water, cooking gas and electronics across Kasarani and surrounding Nairobi estates. Order online or via WhatsApp.",
  },
  {
    slug: "kiambu",
    name: "Kiambu",
    branchSlugs: ["kihunguro", "membley", "tinganga"],
    serviceAreaSlugs: ["ruiru", "kimbo", "tatu-city", "juja"],
    otherPlaces: ["Kiambu Town", "Ndumberi", "Riabai", "Kiambaa", "Thindigua", "Githunguri", "OJ"],
    hasPhysicalBranch: true,
    intro:
      "Kiambu County is home to three of Aquatace's four branches — Kihunguro and Membley along the Ruiru/Thika Road corridor, and Ting'ang'a near Kiambu town — giving us strong local coverage for water refill and cooking gas delivery. Kihunguro and Membley reach Ruiru, Kimbo, Tatu City and Juja; Ting'ang'a serves Kiambu town, Ndumberi, Riabai and Kiambaa. Electronics ship from our online catalogue to all of these areas too.",
    seoTitle: "Water, LPG Gas & Electronics Delivery in Kiambu County | Aquatace",
    seoDescription:
      "Three Aquatace branches — Kihunguro, Membley and Ting'ang'a — deliver purified water, cooking gas and electronics across Kiambu County. Order via WhatsApp.",
  },
  {
    slug: "muranga",
    name: "Murang'a",
    branchSlugs: [],
    serviceAreaSlugs: [],
    otherPlaces: [],
    hasPhysicalBranch: false,
    intro:
      "Aquatace doesn't have a walk-in branch in Murang'a County, but we do dispatch orders there — coordinated through our Membley hub, the same way we handle delivery outside our core Nairobi and Kiambu coverage. Water refills, cooking gas and electronics can all be ordered on WhatsApp; we'll confirm delivery timing and any courier cost before dispatch.",
    seoTitle: "Water, LPG Gas & Electronics Delivery in Murang'a County | Aquatace",
    seoDescription:
      "Aquatace delivers purified water, cooking gas and electronics to Murang'a County, coordinated through our Membley hub. No physical branch — order and confirm delivery via WhatsApp.",
  },
];

export function getCounty(slug: string): CountyPage | undefined {
  return counties.find((c) => c.slug === slug);
}
