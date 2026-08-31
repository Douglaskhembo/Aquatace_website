import { Droplet } from "lucide-react";
import type { CategorySlug } from "@/lib/products";
import { GAS_CATEGORY_IMAGE_URL } from "@/assets/gas-category-image";
import catWater from "@/assets/cat-water.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";

const map: Record<CategorySlug, { grad: string; Icon: typeof Droplet; image?: string }> = {
  water: { grad: "gradient-water", Icon: Droplet, image: catWater },
  gas: { grad: "gradient-gas", Icon: Droplet, image: GAS_CATEGORY_IMAGE_URL },
  electronics: { grad: "gradient-electronics", Icon: Droplet, image: catElectronics },
};

export function ProductImage({
  category,
  label,
  className = "",
  size = "md",
  image: imageOverride,
}: {
  category: CategorySlug;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  image?: string;
}) {
  const { grad, Icon, image: defaultImage } = map[category];
  const image = imageOverride ?? defaultImage;
  const iconSize = size === "lg" ? "h-24 w-24" : size === "sm" ? "h-10 w-10" : "h-16 w-16";

  if (image) {

    return (
      <div className={`relative overflow-hidden ${imageOverride ? "bg-muted" : grad} ${className}`}>
        <img
          src={image}
          alt={label ?? "Product image"}
          loading="lazy"
          width={1200} height={900}
          className={`h-full w-full ${imageOverride ? "object-contain p-3" : "object-cover"}`}
        />

        {label && (
          <div
            className={
              imageOverride
                ? "absolute bottom-3 left-3 right-3 truncate rounded-full bg-foreground/80 px-2 py-1 text-center text-[10px] font-medium uppercase tracking-wider text-white"
                : "absolute bottom-3 left-3 right-3 truncate text-xs font-medium uppercase tracking-wider text-white/85"
            }
          >
            {label}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${grad} ${className}`}>
      <div className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(600px 300px at 20% 10%, rgba(255,255,255,.6), transparent 60%), radial-gradient(400px 400px at 90% 90%, rgba(0,0,0,.15), transparent 55%)",
        }} />
      <div className="relative flex h-full w-full items-center justify-center">
        <Icon className={`${iconSize} text-white/90 drop-shadow-lg`} strokeWidth={1.4} />
      </div>
      {label && (
        <div className="absolute bottom-3 left-3 right-3 truncate text-xs font-medium uppercase tracking-wider text-white/85">
          {label}
        </div>
      )}
    </div>
  );
}

