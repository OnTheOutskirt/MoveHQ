"use client";

import { formatActivityTime } from "@/lib/moves/format";
import type { MoveCrewFeedback } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { MessageSquareHeart, Star } from "lucide-react";

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const starClass = size === "md" ? "h-4 w-4" : "h-3 w-3";

  return (
    <span className="inline-flex items-center gap-px" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starClass,
            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300",
          )}
        />
      ))}
    </span>
  );
}

export function CrewFeedbackRatingBadge({
  feedback,
  className,
}: {
  feedback: MoveCrewFeedback;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-950 ring-1 ring-amber-200/90",
        className,
      )}
      title={`Customer rated crew ${feedback.rating}/5`}
    >
      <StarRating rating={feedback.rating} />
      <span className="tabular-nums">{feedback.rating}/5</span>
    </span>
  );
}

export function CrewFeedbackDetailSection({ feedback }: { feedback: MoveCrewFeedback }) {
  const comment = feedback.comment.trim();
  const submittedLabel = formatActivityTime(feedback.submittedAt);

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
          <MessageSquareHeart className="h-3.5 w-3.5" aria-hidden />
          Customer review
        </p>
        <CrewFeedbackRatingBadge feedback={feedback} />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <StarRating rating={feedback.rating} size="md" />
        <span className="text-sm font-semibold text-amber-950 tabular-nums">
          {feedback.rating} out of 5
        </span>
      </div>

      <p className="mt-1 text-xs text-amber-900/80">Submitted {submittedLabel}</p>

      {comment ? (
        <blockquote className="mt-3 rounded-md border border-amber-200/80 bg-white/70 px-2.5 py-2 text-sm leading-snug text-slate-800">
          &ldquo;{comment}&rdquo;
        </blockquote>
      ) : (
        <p className="mt-2 text-xs text-amber-900/70">No written comment.</p>
      )}

      {feedback.googleReviewOffered ? (
        <p className="mt-2 text-[11px] text-amber-900/75">
          Customer was offered the Google review link after rating.
        </p>
      ) : null}
    </section>
  );
}
