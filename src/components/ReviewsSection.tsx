import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/RatingStars";
import { listReviews } from "@/lib/reviews.functions";

const PAGE_SIZE = 5;

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export function ReviewsSection() {
  const [page, setPage] = useState(1);
  const fetchReviews = useServerFn(listReviews);
  const q = useQuery({
    queryKey: ["reviews", page],
    queryFn: () => fetchReviews({ data: { page, pageSize: PAGE_SIZE } }),
    staleTime: 30_000,
  });

  const reviews = q.data?.reviews ?? [];
  const hasMore = q.data?.hasMore ?? false;
  const summary = q.data?.summary;

  if (reviews.length === 0) return null;

  return (
    <section className="container-page mt-14 mb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reviews</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            What our customers say
          </h2>
        </div>
        {summary && summary.count > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-accent px-4 py-2">
            <RatingStars value={summary.avg} size="sm" />
            <span className="text-sm font-semibold">{summary.avg.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({summary.count})</span>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <Card key={r.id} className="rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="p-5">
              <RatingStars value={r.rating} size="sm" />
              <p className="mt-3 text-sm text-foreground/90">
                {r.comment || (
                  <span className="text-muted-foreground">Left a rating without a comment.</span>
                )}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{r.customerName}</span>
                <span>{timeAgo(r.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(page > 1 || hasMore) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || q.isFetching}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore || q.isFetching}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
