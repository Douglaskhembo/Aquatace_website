// Production domain, used for sitemap.xml, robots.txt and absolute JSON-LD URLs
// (schema.org/Google want absolute URLs for `url`/`@id`/image fields; relative URLs
// are fine everywhere else, per the existing canonical-link convention).
//
// NOT YET CONFIRMED — the business hasn't settled on a domain. Update this single
// constant once one is registered/deployed; everything that needs the domain reads
// it from here.
export const SITE_URL = "https://aquatace.com";
