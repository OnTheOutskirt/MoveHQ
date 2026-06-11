"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { MediaThumb } from "@/components/crew-app/CrewFieldCapturePanel";
import { SkipperViolationsSummary } from "@/components/operations/crew/SkipperViolationsSummary";
import { useCrewRecords } from "@/components/providers/CrewRecordsProvider";
import {
  buildCrewMemberStats,
  issueKindLabel,
  issueSubjectLabel,
  showDriverPerformance,
  showSkipperPerformance,
} from "@/lib/crew-app/stats";
import type { DriverReview, SkipperRating } from "@/lib/operations/crew-records-types";
import {
  formatDriverViolationList,
  hasThreeDriverViolationsFlag,
} from "@/lib/operations/driver-violations";
import { hasThreeViolationsFlag } from "@/lib/operations/skipper-violations";
import { formatViolationRating, violationRatingTextClass } from "@/lib/operations/violation-rating";
import { formatMoveDate } from "@/lib/moves/format";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ClipboardList,
  Shield,
  Star,
  Truck,
} from "lucide-react";
import { useMemo } from "react";

export function CrewStatsScreen() {
  const { session } = useCrewApp();
  const { issues, skipperRatings, driverReviews, isReady } = useCrewRecords();

  const stats = useMemo(
    () =>
      buildCrewMemberStats(session.crewId, {
        issues,
        skipperRatings,
        driverReviews,
      }),
    [session.crewId, issues, skipperRatings, driverReviews],
  );

  const isSkipper = showSkipperPerformance(session.appRoles);
  const isDriver = showDriverPerformance(session.appRoles);

  if (!isReady) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
        Loading your track record…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">
        Pulled from Operations → Crew (issues log, skippers, drivers). Only records tied to your
        crew profile are shown here.
      </p>

      <section aria-label="Overview">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Open issues" value={stats.openIssues} />
          <StatCard label="On record" value={stats.totalIssues} />

          {isSkipper ? (
            <>
              <StatCard
                label="Avg skipper score"
                value={
                  stats.avgSkipperRating != null
                    ? formatViolationRating(stats.avgSkipperRating)
                    : "—"
                }
                valueClassName={
                  stats.avgSkipperRating != null
                    ? violationRatingTextClass(stats.avgSkipperRating)
                    : undefined
                }
              />
              <StatCard label="Job reviews" value={stats.skipperRatings.length} />
            </>
          ) : null}

          {isDriver ? (
            <>
              <StatCard
                label="Avg driver score"
                value={
                  stats.avgDriverRating != null
                    ? formatViolationRating(stats.avgDriverRating)
                    : "—"
                }
                valueClassName={
                  stats.avgDriverRating != null
                    ? violationRatingTextClass(stats.avgDriverRating)
                    : undefined
                }
              />
              <StatCard label="Drive reviews" value={stats.driverReviews.length} />
            </>
          ) : null}

          {!isSkipper && !isDriver ? (
            <>
              <StatCard label="Last 30 days" value={stats.issues30d} />
              <StatCard
                label="Resolved"
                value={stats.totalIssues - stats.openIssues}
              />
            </>
          ) : null}
        </div>
      </section>

      <section
        aria-label="Last 30 days"
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Last 30 days
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <MetricRow label="Total issues" value={stats.issues30d} />
          <MetricRow label="Attendance" value={stats.attendance30d} />
          <MetricRow label="Seat belt" value={stats.seatBelt30d} />
          <MetricRow label="Customer" value={stats.customerComplaints30d} />
          {isSkipper ? (
            <MetricRow label="Callbacks" value={stats.skipperCallbacks30d} className="col-span-2" />
          ) : null}
          {stats.openCustomerComplaints > 0 ? (
            <MetricRow
              label="Open customer issues"
              value={stats.openCustomerComplaints}
              className="col-span-2"
              highlight
            />
          ) : null}
        </dl>
      </section>

      {isSkipper && stats.skipperRatings.length > 0 ? (
        <section aria-label="Skipper reviews">
          <SectionHeader icon={Star} title="Skipper job reviews" />
          <ul className="space-y-2">
            {stats.skipperRatings.map((review) => (
              <li key={review.id}>
                <SkipperReviewCard review={review} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isSkipper && stats.skipperRatings.length === 0 ? (
        <EmptyPerformanceCard
          icon={Star}
          title="No skipper reviews yet"
          detail="Job reviews from dispatch and operations will show up here after your moves."
        />
      ) : null}

      {isDriver && stats.driverReviews.length > 0 ? (
        <section aria-label="Driver reviews">
          <SectionHeader icon={Truck} title="Driver reviews" />
          <ul className="space-y-2">
            {stats.driverReviews.map((review) => (
              <li key={review.id}>
                <DriverReviewCard review={review} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isDriver && stats.driverReviews.length === 0 ? (
        <EmptyPerformanceCard
          icon={Truck}
          title="No driver reviews yet"
          detail="Fleet safety and operations reviews will appear here after your routes."
        />
      ) : null}

      <section aria-label="Issues log">
        <SectionHeader icon={ClipboardList} title="Issues log" />
        {stats.issueSummaries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
            No issues on file — keep it up.
          </div>
        ) : (
          <ul className="space-y-2">
            {stats.issueSummaries.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      item.status === "open" || item.status === "under_review"
                        ? "text-amber-500"
                        : "text-slate-400",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.description}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {issueKindLabel(item.kind)} · {issueSubjectLabel(item.subject)} ·{" "}
                      {formatMoveDate(item.date)} · {item.statusLabel}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums text-slate-900", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function MetricRow({
  label,
  value,
  className,
  highlight,
}: {
  label: string;
  value: number;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] text-slate-500">{label}</dt>
      <dd
        className={cn(
          "font-semibold tabular-nums text-slate-900",
          highlight && value > 0 && "text-red-700",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof Star;
  title: string;
}) {
  return (
    <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <Icon className="h-3.5 w-3.5" />
      {title}
    </h2>
  );
}

function EmptyPerformanceCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Star;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm shadow-sm">
      <p className="flex items-center gap-1.5 font-medium text-slate-900">
        <Icon className="h-4 w-4 text-brand-600" />
        {title}
      </p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function SkipperReviewCard({ review }: { review: SkipperRating }) {
  const threePlus = hasThreeViolationsFlag(review.violations);

  return (
    <article className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      {review.photoDataUrl ? (
        <div className="mb-2 flex items-center gap-2">
          <MediaThumb
            entry={{
              id: review.fieldMediaId ?? review.id,
              category: "truck_condition",
              capturedAt: review.createdAt,
              capturedByCrewId: "",
              capturedByName: review.ratedBy ?? "",
              moveRef: review.jobRef ?? "",
              imageDataUrl: review.photoDataUrl,
              syncStatus: "synced",
            }}
          />
          <p className="text-[10px] text-slate-500">Photo evidence on file</p>
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">
            {review.jobRef ? `Job ${review.jobRef}` : "Job review"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatMoveDate(review.date)}
            {review.ratedBy ? ` · ${review.ratedBy}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              violationRatingTextClass(review.rating),
            )}
          >
            {formatViolationRating(review.rating)}
          </span>
          {threePlus ? (
            <p className="mt-0.5 text-[10px] font-bold uppercase text-red-700">3+ items</p>
          ) : null}
        </div>
      </div>
      {review.violations.length > 0 ? (
        <div className="mt-2">
          <SkipperViolationsSummary
            violations={review.violations}
            callbackNote={review.callbackNote}
            otherNote={review.otherNote}
          />
        </div>
      ) : (
        <p className="mt-2 text-xs text-emerald-700">Clean review — no checklist items marked.</p>
      )}
      {review.notes ? (
        <p className="mt-2 text-xs leading-snug text-slate-600">{review.notes}</p>
      ) : null}
    </article>
  );
}

function DriverReviewCard({ review }: { review: DriverReview }) {
  const threePlus = hasThreeDriverViolationsFlag(review.violations);

  return (
    <article className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">
            {review.jobRef ? `Route ${review.jobRef}` : "Drive review"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatMoveDate(review.date)}
            {review.reviewedBy ? ` · ${review.reviewedBy}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              violationRatingTextClass(review.rating),
            )}
          >
            {formatViolationRating(review.rating)}
          </span>
          {threePlus ? (
            <p className="mt-0.5 text-[10px] font-bold uppercase text-red-700">3+ items</p>
          ) : null}
        </div>
      </div>
      {review.violations.length > 0 ? (
        <p className="mt-2 text-xs text-slate-700">
          <Shield className="mr-1 inline h-3 w-3 text-slate-400" />
          {formatDriverViolationList(review.violations, 4)}
        </p>
      ) : (
        <p className="mt-2 text-xs text-emerald-700">Clean review — no violations flagged.</p>
      )}
      {review.notes ? (
        <p className="mt-2 text-xs leading-snug text-slate-600">{review.notes}</p>
      ) : null}
    </article>
  );
}
