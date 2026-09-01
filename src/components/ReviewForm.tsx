import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStarsInput } from "@/components/RatingStars";
import { createReview } from "@/lib/reviews.functions";

export function ReviewForm({
  orderNumber,
  customerName,
}: {
  orderNumber: string;
  customerName: string;
}) {
  const submit = useServerFn(createReview);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="mt-6 rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
        <CardContent className="flex items-center gap-3 p-6 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <p>Thanks for your feedback! It helps other customers and helps us improve.</p>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async () => {
    if (rating < 1) {
      toast.error("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    try {
      await submit({
        data: {
          order_number: orderNumber,
          customer_name: customerName,
          rating,
          comment: comment.trim() || undefined,
        },
      });
      setSubmitted(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not submit your review. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mt-6 rounded-3xl border-border/60 shadow-[var(--shadow-soft)]">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold">Rate your experience</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional — takes a few seconds and helps other customers.
        </p>
        <div className="mt-4">
          <RatingStarsInput value={rating} onChange={setRating} />
        </div>
        <Textarea
          className="mt-4 rounded-2xl"
          placeholder="Tell us about your delivery (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={3}
        />
        <Button
          type="button"
          className="mt-4 rounded-full"
          onClick={onSubmit}
          disabled={submitting || rating < 1}
        >
          {submitting ? "Submitting…" : "Submit feedback"}
        </Button>
      </CardContent>
    </Card>
  );
}
