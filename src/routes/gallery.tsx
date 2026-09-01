import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { listGalleryImages } from "@/lib/gallery.functions";
import { SITE_URL } from "@/lib/seo/config";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Aquatace Water & Gas" },
      { name: "description", content: "Photos of Aquatace water refill stations, cooking gas cylinders and deliveries across Kenya." },
      { property: "og:title", content: "Gallery — Aquatace Water & Gas" },
      { property: "og:description", content: "Real photos of Aquatace refill stations, gas cylinders and deliveries." },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/gallery` }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: () => listGalleryImages(),
  });

  return (
    <div className="container-page py-14 md:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Real business visuals</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Gallery</h1>
        <p className="mt-3 text-muted-foreground">A look inside Aquatace — refill stations, cylinders and deliveries.</p>
      </div>

      {!isLoading && images.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border p-12 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No photos yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon — we're adding real photos of our stations, cylinders and deliveries.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.4) }}
              className="overflow-hidden rounded-3xl bg-secondary/40 shadow-[var(--shadow-soft)] aspect-square"
            >
              <img
                src={g.imageUrl} alt={g.altText || "Aquatace gallery photo"}
                loading="lazy" width={800} height={800}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
