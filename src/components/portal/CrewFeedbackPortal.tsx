"use client";

import { Button } from "@/components/ui/Button";
import { buildCustomerPortalHomePath, isStaffPortalPreview } from "@/lib/moves/customer-portal-home";
import {
  googleReviewUrlForMove,
  shouldOfferGoogleReview,
  type GoogleReviewMinStars,
} from "@/lib/moves/move-feedback-portal";
import type { MoveCrewFeedback, MoveRecord } from "@/lib/moves/types";
import type { WorkspaceLocation } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";
import { Clock, ExternalLink, Heart, MessageSquareHeart, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function RatingStars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starClass,
            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200",
          )}
        />
      ))}
    </span>
  );
}

function GoogleReviewCta({
  feedback,
  companyName,
  googleReviewUrl,
  accentColor,
}: {
  feedback: MoveCrewFeedback;
  companyName: string;
  googleReviewUrl: string;
  accentColor: string;
}) {
  const isPerfect = feedback.rating >= 5;

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50 via-white to-white text-left shadow-md ring-1 ring-amber-100">
      <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <RatingStars rating={feedback.rating} />
          <span className="text-xs font-bold uppercase tracking-wide text-amber-900">
            {isPerfect ? "5-star move!" : `${feedback.rating}-star rating`}
          </span>
        </div>
        {isPerfect ? (
          <Sparkles className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
        ) : null}
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
            <GoogleMark className="h-6 w-6" />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-lg font-bold leading-snug text-slate-900">
              {isPerfect
                ? "Would you tell Google about your crew?"
                : "Mind sharing that on Google?"}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {isPerfect ? (
                <>
                  You just made our day privately — a quick public review is the best way to
                  thank the movers who showed up for you. It helps other families feel confident
                  choosing {companyName}.
                </>
              ) : (
                <>
                  Families often search Google before they book a mover. Your review helps them
                  find a team they can trust — and it means the world to our crew.
                </>
              )}
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2.5">
          <li className="flex items-start gap-2.5 text-sm text-slate-700">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <span>
              <span className="font-semibold text-slate-900">About 60 seconds</span> — mention
              your crew, the care they took, or what stood out.
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-slate-700">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <span>
              <span className="font-semibold text-slate-900">Helps neighbors nearby</span> who
              are comparing movers right now.
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-slate-700">
            <Heart className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <span>
              <span className="font-semibold text-slate-900">Goes straight to your crew</span> —
              reviews are how they get recognized.
            </span>
          </li>
        </ul>

        <a
          href={googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-base font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 10px 24px -8px color-mix(in srgb, ${accentColor} 55%, transparent)`,
          }}
        >
          <GoogleMark className="h-5 w-5 rounded-sm bg-white p-0.5" />
          {isPerfect ? "Leave a Google review for our crew" : "Leave a Google review"}
          <ExternalLink className="h-4 w-4 opacity-90" />
        </a>
        <p className="mt-2.5 text-center text-[11px] leading-relaxed text-slate-400">
          Opens Google in a new tab · No extra steps on this page
        </p>
      </div>
    </div>
  );
}

type CrewFeedbackPortalProps = {
  move: MoveRecord;
  companyName: string;
  logoDataUrl?: string | null;
  accentColor: string;
  googleReviewMinStars: GoogleReviewMinStars;
  locations: WorkspaceLocation[];
  existingFeedback?: MoveCrewFeedback | null;
  onSubmit: (rating: number, comment: string) => void;
  staffPreview?: boolean;
};

function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className={cn(
              "rounded-lg p-1 transition-transform hover:scale-110 disabled:cursor-default disabled:hover:scale-100",
              disabled && "pointer-events-none",
            )}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
          >
            <Star
              className={cn(
                "h-10 w-10",
                active ? "fill-amber-400 text-amber-400" : "text-slate-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function ThankYouPanel({
  feedback,
  companyName,
  googleReviewUrl,
  googleReviewMinStars,
  accentColor,
  portalHomeHref,
}: {
  feedback: MoveCrewFeedback;
  companyName: string;
  googleReviewUrl: string;
  googleReviewMinStars: GoogleReviewMinStars;
  accentColor: string;
  portalHomeHref?: string;
}) {
  const showGoogle = shouldOfferGoogleReview(
    feedback.rating,
    googleReviewMinStars,
    googleReviewUrl,
  );

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)` }}
        >
          <MessageSquareHeart
            className="h-7 w-7"
            style={{ color: accentColor }}
          />
        </div>
        <h1 className="mt-3 text-xl font-semibold text-slate-900">Thank you!</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Your feedback is with the {companyName} operations team.
          {feedback.rating >= 4
            ? " We're thrilled your crew took great care of you."
            : " We'll review your notes and follow up if needed."}
        </p>
      </div>

      {showGoogle ? (
        <GoogleReviewCta
          feedback={feedback}
          companyName={companyName}
          googleReviewUrl={googleReviewUrl}
          accentColor={accentColor}
        />
      ) : (
        <p className="rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
          Our team will reach out if anything needs attention. Thank you for helping
          us improve.
        </p>
      )}

      {portalHomeHref ? (
        <Link
          href={portalHomeHref}
          className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Return to your portal
        </Link>
      ) : null}
    </div>
  );
}

export function CrewFeedbackPortal({
  move,
  companyName,
  accentColor,
  googleReviewMinStars,
  locations,
  existingFeedback,
  onSubmit,
  staffPreview = false,
}: CrewFeedbackPortalProps) {
  const [rating, setRating] = useState(existingFeedback?.rating ?? 0);
  const [comment, setComment] = useState(existingFeedback?.comment ?? "");
  const [submitted, setSubmitted] = useState(Boolean(existingFeedback));

  const googleReviewUrl = googleReviewUrlForMove(move, locations);
  const feedback = existingFeedback ?? (submitted && rating > 0
    ? {
        rating,
        comment,
        submittedAt: new Date().toISOString(),
        googleReviewOffered: shouldOfferGoogleReview(
          rating,
          googleReviewMinStars,
          googleReviewUrl,
        ),
      }
    : null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return;
    onSubmit(rating, comment.trim());
    setSubmitted(true);
  }

  const firstName = move.customerName.split(/\s+/)[0] ?? "there";
  const portalHomeHref = buildCustomerPortalHomePath(move.id, { staffPreview });

  return (
    <div className="px-5 py-6">
      {feedback ? (
        <ThankYouPanel
          feedback={feedback}
          companyName={companyName}
          googleReviewUrl={googleReviewUrl}
          googleReviewMinStars={googleReviewMinStars}
          accentColor={accentColor}
          portalHomeHref={portalHomeHref}
        />
      ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                How did your crew do, {firstName}?
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Rate your moving crew from 1–5 and leave a quick comment. Your feedback
                goes straight to our operations team.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-5">
              <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Crew rating
              </p>
              <div className="mt-3">
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">
                {rating === 0
                  ? "Tap a star to rate"
                  : rating === 5
                    ? "Outstanding!"
                    : rating >= 4
                      ? "Great job"
                      : rating >= 3
                        ? "Good"
                        : "We'll make this right"}
              </p>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-slate-600">
                Comments (optional)
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Tell us what went well or what we could do better…"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed"
              />
            </label>

            <Button
              type="submit"
              disabled={rating < 1}
              className="w-full"
              style={{ backgroundColor: rating >= 1 ? accentColor : undefined }}
            >
              Submit feedback
            </Button>

            <p className="text-center text-[11px] leading-relaxed text-slate-400">
              We don&apos;t ask for a public review until after you rate your crew here.
            </p>
          </form>
        )}
    </div>
  );
}
