// Production domain, used for sitemap.xml, robots.txt and absolute JSON-LD URLs
// (schema.org/Google want absolute URLs for `url`/`@id`/image fields; relative URLs
// are fine everywhere else, per the existing canonical-link convention).
//
// Live domain per docs/CONTABO_MIGRATION.md (Caddy/DNS point here). Update this
// single constant if the domain ever changes; everything that needs it reads it
// from here.
export const SITE_URL = "https://aquatace.co.ke";
