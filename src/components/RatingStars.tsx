import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_CLASS = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-8 w-8" } as const;

export function RatingStars({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`Rated ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            SIZE_CLASS[size],
            n <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

export function RatingStarsInput({
  value,
  onChange,
  size = "lg",
}: {
  value: number;
  onChange: (value: number) => void;
  size?: keyof typeof SIZE_CLASS;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className={cn(
              SIZE_CLASS[size],
              n <= active ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
