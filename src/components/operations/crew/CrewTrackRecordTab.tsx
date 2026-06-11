"use client";

import { CrewMeetingReportPanel } from "@/components/operations/crew/CrewMeetingReportPanel";
import { OpsFieldCapturePanel } from "@/components/operations/crew/OpsFieldCapturePanel";
import { MediaThumb } from "@/components/crew-app/CrewFieldCapturePanel";
import {
  CompletedMoveJobRefPicker,
  type CompletedMoveJobRefValue,
} from "@/components/operations/crew/CompletedMoveJobRefPicker";
import { RelatedMoveCell } from "@/components/operations/crew/RelatedMoveCell";
import { SkipperViolationsSummary } from "@/components/operations/crew/SkipperViolationsSummary";
import { useCrewRecords } from "@/components/providers/CrewRecordsProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { TabBar } from "@/components/shared/TabBar";
import {
  CREW_ISSUE_KIND_LABELS,
  CREW_ISSUE_STATUS_LABELS,
  CREW_ISSUE_SUBJECT_LABELS,
  averageSkipperRating,
  ISSUES_LOG_KINDS,
  issueKindBadgeVariant,
  isDriver,
  isSkipper,
} from "@/lib/operations/crew-records";
import {
  countSkipperCallbacks,
  computeSkipperRating,
  hasThreeViolationsFlag,
  SKIPPER_CALLBACK_VIOLATION_ID,
  SKIPPER_VIOLATION_IDS,
  SKIPPER_VIOLATION_LABELS,
  type SkipperViolationId,
} from "@/lib/operations/skipper-violations";
import {
  computeDriverRating,
  DRIVER_VIOLATION_IDS,
  DRIVER_VIOLATION_LABELS,
  formatDriverViolationList,
  hasThreeDriverViolationsFlag,
  type DriverViolationId,
} from "@/lib/operations/driver-violations";
import { formatViolationRating, violationRatingTextClass } from "@/lib/operations/violation-rating";
import {
  CREW_ISSUE_KINDS,
  CREW_ISSUE_SUBJECTS,
  type CrewIssue,
  type CrewIssueKind,
  type CrewIssueStatus,
  type CrewIssueSubject,
  type DriverReview,
  type SkipperRating,
} from "@/lib/operations/crew-records-types";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { AlertTriangle, Plus } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

const TRACK_RECORD_VIEW_IDS = ["issues", "skippers", "drivers", "meeting-report"] as const;
type TrackRecordView = (typeof TRACK_RECORD_VIEW_IDS)[number];

function normalizeTrackRecordView(stored: string): TrackRecordView {
  if (TRACK_RECORD_VIEW_IDS.includes(stored as TrackRecordView)) return stored as TrackRecordView;
  if (stored === "ratings") return "skippers";
  return "issues";
}

function isWithinDays(dateKey: string, days: number, today: Date = new Date()): boolean {
  const d = new Date(`${dateKey}T12:00:00`);
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return d >= start;
}

type IssueFilter = "all" | CrewIssueKind;

type IssueFormDefaults = {
  kind?: CrewIssueKind;
  subject?: CrewIssueSubject;
};

type IssuePanel =
  | { type: "closed" }
  | { type: "edit"; id: string }
  | { type: "add" };

function issueBadgeVariant(kind: CrewIssueKind): "default" | "warning" | "danger" | "brand" {
  return issueKindBadgeVariant(kind);
}

function statusBadgeVariant(status: CrewIssueStatus): "default" | "warning" | "success" {
  if (status === "open") return "warning";
  if (status === "under_review") return "default";
  return "success";
}

function ViolationRatingDisplay({
  rating,
  showThreePlus,
}: {
  rating: number;
  showThreePlus?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={cn("tabular-nums font-semibold", violationRatingTextClass(rating))}>
        {formatViolationRating(rating)}
      </span>
      {showThreePlus ? (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-800">
          3+ violations
        </span>
      ) : null}
    </div>
  );
}

export function CrewTrackRecordTab() {
  const { crew } = useFleet();
  const { label, plural } = useTerminology();
  const trackRecordViews = useMemo(
    () => [
      { id: "issues" as const, label: "Issues log" },
      { id: "skippers" as const, label: plural("skipper") },
      { id: "drivers" as const, label: plural("driver") },
      { id: "meeting-report" as const, label: "Meeting report" },
    ],
    [plural],
  );
  const { issues, skipperRatings, driverReviews, addIssue, updateIssue, deleteIssue, addSkipperRating, updateSkipperRating, deleteSkipperRating, addDriverReview, updateDriverReview, deleteDriverReview } =
    useCrewRecords();
  const [storedView, setStoredView] = usePersistedState<string>(
    "jm-tab-/operations/crew/track-record",
    "issues",
  );
  const view = normalizeTrackRecordView(storedView);
  function setView(next: TrackRecordView) {
    setStoredView(next);
  }
  const [issueFilter, setIssueFilter] = useState<IssueFilter>("all");
  const [crewFilter, setCrewFilter] = useState<string>("all");
  const [issuePanel, setIssuePanel] = useState<IssuePanel>({ type: "closed" });
  const [showAddRating, setShowAddRating] = useState(false);
  const [selectedRatingId, setSelectedRatingId] = useState<string | null>(null);
  const [showAddDriverReview, setShowAddDriverReview] = useState(false);
  const [selectedDriverReviewId, setSelectedDriverReviewId] = useState<string | null>(null);
  const [issueFormDefaults, setIssueFormDefaults] = useState<IssueFormDefaults>({});

  const openIssues = issues.filter((i) => i.status !== "resolved").length;
  const underReview = issues.filter((i) => i.status === "under_review").length;
  const attendance30d = issues.filter(
    (i) => isWithinDays(i.date, 30) && i.subject === "attendance",
  ).length;
  const violations30d = skipperRatings
    .filter((r) => isWithinDays(r.date, 30))
    .reduce((sum, r) => sum + (r.violations?.length ?? 0), 0);
  const driverViolations30d = driverReviews
    .filter((r) => isWithinDays(r.date, 30))
    .reduce((sum, r) => sum + (r.violations?.length ?? 0), 0);
  const threeViolationJobs30d = skipperRatings.filter(
    (r) => isWithinDays(r.date, 30) && hasThreeViolationsFlag(r.violations ?? []),
  ).length;
  const threeViolationDriverEvents30d = driverReviews.filter(
    (r) => isWithinDays(r.date, 30) && hasThreeDriverViolationsFlag(r.violations ?? []),
  ).length;
  const avgRating = averageSkipperRating(skipperRatings);
  const skippers = crew.filter((c) => isSkipper(c) && c.active);
  const drivers = crew.filter((c) => isDriver(c) && c.active);

  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      if (issueFilter !== "all" && i.kind !== issueFilter) return false;
      if (crewFilter !== "all" && i.crewId !== crewFilter) return false;
      return true;
    });
  }, [issues, issueFilter, crewFilter]);

  const callbacks30d = countSkipperCallbacks(skipperRatings, 30);

  const driverSummaries = useMemo(() => {
    return drivers.map((driver) => {
      const memberReviews = driverReviews.filter((r) => r.driverId === driver.id);
      const recent = memberReviews.filter((r) => isWithinDays(r.date, 30));
      const violationCount = recent.reduce((sum, r) => sum + (r.violations?.length ?? 0), 0);
      const threePlus = recent.filter((r) => hasThreeDriverViolationsFlag(r.violations ?? [])).length;
      const lastIncident = memberReviews
        .map((r) => r.date)
        .sort((a, b) => b.localeCompare(a))[0];
      return {
        crewId: driver.id,
        name: driver.name,
        events30d: recent.length,
        violations30d: violationCount,
        threePlus30d: threePlus,
        lastIncident: lastIncident ?? null,
      };
    });
  }, [drivers, driverReviews]);

  const selectedIssue =
    issuePanel.type === "edit" ? issues.find((i) => i.id === issuePanel.id) : undefined;

  const issueColumns = useMemo<Column<CrewIssue>[]>(
    () => [
      {
        key: "date",
        header: "Date",
        cell: (row) => row.date,
      },
      {
        key: "crew",
        header: "Crew",
        cell: (row) => crew.find((c) => c.id === row.crewId)?.name ?? row.crewId,
      },
      {
        key: "kind",
        header: "Type",
        cell: (row) => (
          <Badge variant={issueBadgeVariant(row.kind)}>{CREW_ISSUE_KIND_LABELS[row.kind]}</Badge>
        ),
      },
      {
        key: "subject",
        header: "Subject",
        cell: (row) => CREW_ISSUE_SUBJECT_LABELS[row.subject],
      },
      {
        key: "description",
        header: "Description",
        cell: (row) => (
          <p className="line-clamp-2 min-w-0 text-sm text-slate-800">{row.description}</p>
        ),
      },
      {
        key: "move",
        header: "Related move",
        cell: (row) => <RelatedMoveCell moveId={row.moveId} jobRef={row.jobRef} />,
      },
      {
        key: "messageSent",
        header: "Msg sent",
        cell: (row) => (
          <span className={row.messageSent ? "text-emerald-700" : "text-slate-400"}>
            {row.messageSent ? "Yes" : "No"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <Badge variant={statusBadgeVariant(row.status)}>
            {CREW_ISSUE_STATUS_LABELS[row.status]}
          </Badge>
        ),
      },
    ],
    [crew],
  );

  const selectedRating = selectedRatingId
    ? skipperRatings.find((r) => r.id === selectedRatingId)
    : undefined;

  const selectedDriverReview = selectedDriverReviewId
    ? driverReviews.find((r) => r.id === selectedDriverReviewId)
    : undefined;

  const ratingColumns = useMemo<Column<SkipperRating>[]>(
    () => [
      {
        key: "date",
        header: "Date",
        cell: (row) => row.date,
      },
      {
        key: "skipper",
        header: label("skipper"),
        cell: (row) => crew.find((c) => c.id === row.skipperId)?.name ?? row.skipperId,
      },
      {
        key: "photo",
        header: "Photo",
        cell: (row) =>
          row.photoDataUrl ? (
            <MediaThumb
              entry={{
                id: row.fieldMediaId ?? row.id,
                category: "truck_condition",
                capturedAt: row.createdAt,
                capturedByCrewId: "",
                capturedByName: row.ratedBy ?? "",
                moveRef: row.jobRef ?? "",
                imageDataUrl: row.photoDataUrl,
                syncStatus: "synced",
              }}
            />
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
      {
        key: "violations",
        header: "Violations",
        cell: (row) => (
          <SkipperViolationsSummary
            violations={row.violations ?? []}
            callbackNote={row.callbackNote}
            otherNote={row.otherNote}
          />
        ),
      },
      {
        key: "rating",
        header: "Rating",
        cell: (row) => (
          <ViolationRatingDisplay
            rating={row.rating}
            showThreePlus={hasThreeViolationsFlag(row.violations ?? [])}
          />
        ),
      },
      {
        key: "move",
        header: "Related move",
        cell: (row) => <RelatedMoveCell moveId={row.moveId} jobRef={row.jobRef} />,
      },
    ],
    [crew, label],
  );

  const driverSummaryColumns = useMemo<
    Column<{
      crewId: string;
      name: string;
      events30d: number;
      violations30d: number;
      threePlus30d: number;
      lastIncident: string | null;
    }>[]
  >(
    () => [
      {
        key: "name",
        header: label("driver"),
        cell: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
      },
      {
        key: "events30d",
        header: "Events (30d)",
        cell: (row) => row.events30d,
      },
      {
        key: "violations30d",
        header: "Violations (30d)",
        cell: (row) => (
          <span className={row.violations30d > 0 ? "font-medium text-amber-700" : "text-slate-600"}>
            {row.violations30d}
          </span>
        ),
      },
      {
        key: "threePlus",
        header: "3+ events (30d)",
        cell: (row) => (
          <span className={row.threePlus30d > 0 ? "font-medium text-red-700" : "text-slate-600"}>
            {row.threePlus30d}
          </span>
        ),
      },
      {
        key: "last",
        header: "Last review",
        cell: (row) => row.lastIncident ?? "—",
      },
    ],
    [label],
  );

  const driverReviewColumns = useMemo<Column<DriverReview>[]>(
    () => [
      {
        key: "date",
        header: "Date",
        cell: (row) => row.date,
      },
      {
        key: "driver",
        header: label("driver"),
        cell: (row) => crew.find((c) => c.id === row.driverId)?.name ?? row.driverId,
      },
      {
        key: "violations",
        header: "Violations",
        cell: (row) => {
          const count = row.violations?.length ?? 0;
          if (count === 0) return null;
          return (
            <div className="min-w-0">
              <p className="font-medium tabular-nums text-slate-900">
                {`${count} item${count === 1 ? "" : "s"}`}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {formatDriverViolationList(row.violations ?? [])}
              </p>
            </div>
          );
        },
      },
      {
        key: "rating",
        header: "Rating",
        cell: (row) => (
          <ViolationRatingDisplay
            rating={row.rating}
            showThreePlus={hasThreeDriverViolationsFlag(row.violations ?? [])}
          />
        ),
      },
      {
        key: "move",
        header: "Related move",
        cell: (row) => <RelatedMoveCell moveId={row.moveId} jobRef={row.jobRef} />,
      },
    ],
    [crew, label],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TabBar tabs={trackRecordViews} activeTab={view} onChange={setView} />
        <div className="flex flex-wrap items-center gap-2">
          {view === "issues" ? (
            <label className="text-xs font-medium text-slate-500">
              Crew
              <select
                value={crewFilter}
                onChange={(e) => setCrewFilter(e.target.value)}
                className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800"
              >
                <option value="all">All crew</option>
                {crew.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {view === "issues" ? (
            <Button type="button" size="sm" onClick={() => setIssuePanel({ type: "add" })}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Log issue
            </Button>
          ) : null}
          {view === "skippers" ? (
            <Button type="button" size="sm" onClick={() => setShowAddRating(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Log job review
            </Button>
          ) : null}
          {view === "drivers" ? (
            <Button type="button" size="sm" onClick={() => setShowAddDriverReview(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Log driver review
            </Button>
          ) : null}
        </div>
      </div>

      <OpsFieldCapturePanel />

      {view === "issues" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Open issues" value={String(openIssues)} />
            <SummaryCard label="Under review" value={String(underReview)} />
            <SummaryCard label="Attendance (30d)" value={String(attendance30d)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={issueFilter === "all"} onClick={() => setIssueFilter("all")}>
              All
            </FilterChip>
            {ISSUES_LOG_KINDS.map((kind) => (
              <FilterChip
                key={kind}
                active={issueFilter === kind}
                onClick={() => setIssueFilter(kind)}
              >
                {CREW_ISSUE_KIND_LABELS[kind]}
              </FilterChip>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white">
            <DataTable
              columns={issueColumns}
              data={filteredIssues}
              emptyMessage="No issues match these filters."
              onRowClick={(row) => setIssuePanel({ type: "edit", id: row.id })}
              getRowKey={(row) => row.id}
            />
          </div>
          <p className="text-xs text-slate-500">Click a row to view or edit an issue.</p>
        </>
      ) : null}

      {view === "skippers" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Avg rating (30d)"
              value={avgRating != null ? formatViolationRating(avgRating) : "—"}
            />
            <SummaryCard label="Violations (30d)" value={String(violations30d)} />
            <SummaryCard label="Callbacks (30d)" value={String(callbacks30d)} />
            <SummaryCard
              label="3+ violation jobs (30d)"
              value={String(threeViolationJobs30d)}
              highlight={threeViolationJobs30d > 0}
            />
          </div>
          <p className="text-xs text-slate-500">
            Mark checklist items per job — score starts at 10 and drops 1 point per violation. Click
            a row to edit.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white">
            <DataTable
              columns={ratingColumns}
              data={skipperRatings}
              emptyMessage="No skipper job reviews yet."
              getRowKey={(row) => row.id}
              onRowClick={(row) => setSelectedRatingId(row.id)}
            />
          </div>
        </>
      ) : null}

      {view === "drivers" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Driver violations (30d)" value={String(driverViolations30d)} />
            <SummaryCard
              label="3+ violation events (30d)"
              value={String(threeViolationDriverEvents30d)}
              highlight={threeViolationDriverEvents30d > 0}
            />
            <SummaryCard label="Active drivers" value={String(drivers.length)} />
          </div>
          <p className="text-xs text-slate-500">
            Log telematics reviews with the checklist below. Score starts at 10 and drops 1 point
            per violation. Click a row to edit.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white">
            <DataTable
              columns={driverSummaryColumns}
              data={driverSummaries}
              emptyMessage="No active drivers on the roster."
              getRowKey={(row) => row.crewId}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Driver reviews</h3>
            <div className="rounded-xl border border-slate-200 bg-white">
              <DataTable
                columns={driverReviewColumns}
                data={driverReviews}
                emptyMessage="No driver reviews logged."
                onRowClick={(row) => setSelectedDriverReviewId(row.id)}
                getRowKey={(row) => row.id}
              />
            </div>
          </div>
        </>
      ) : null}

      {view === "meeting-report" ? <CrewMeetingReportPanel /> : null}

      <DetailSidebar
        open={issuePanel.type !== "closed"}
        onClose={() => {
          setIssuePanel({ type: "closed" });
          setIssueFormDefaults({});
        }}
        title={
          issuePanel.type === "add"
            ? "Log issue"
            : selectedIssue
              ? `Edit issue · ${CREW_ISSUE_SUBJECT_LABELS[selectedIssue.subject]}`
              : "Issue"
        }
        widthClassName="max-w-md"
      >
        {issuePanel.type === "add" ? (
          <IssueForm
            crew={crew}
            defaults={issueFormDefaults}
            onSubmit={(input) => {
              addIssue(input);
              setIssuePanel({ type: "closed" });
              setIssueFormDefaults({});
            }}
            onCancel={() => {
              setIssuePanel({ type: "closed" });
              setIssueFormDefaults({});
            }}
          />
        ) : selectedIssue ? (
          <IssueForm
            key={selectedIssue.id}
            crew={crew}
            initial={selectedIssue}
            submitLabel="Save changes"
            onSubmit={(input) => {
              updateIssue(selectedIssue.id, input);
              setIssuePanel({ type: "closed" });
            }}
            onCancel={() => setIssuePanel({ type: "closed" })}
            onDelete={() => {
              deleteIssue(selectedIssue.id);
              setIssuePanel({ type: "closed" });
            }}
          />
        ) : null}
      </DetailSidebar>

      <DetailSidebar
        open={showAddRating}
        onClose={() => setShowAddRating(false)}
        title={`Log ${label("skipper").toLowerCase()} job review`}
        widthClassName="max-w-lg"
      >
        <RatingForm
          skippers={skippers}
          skipperLabel={label("skipper")}
          skipperPlural={plural("skipper")}
          onSubmit={(input) => {
            addSkipperRating(input);
            setShowAddRating(false);
          }}
          onCancel={() => setShowAddRating(false)}
        />
      </DetailSidebar>

      <DetailSidebar
        open={showAddDriverReview}
        onClose={() => setShowAddDriverReview(false)}
        title={`Log ${label("driver").toLowerCase()} review`}
        widthClassName="max-w-lg"
      >
        <DriverReviewForm
          drivers={drivers}
          driverLabel={label("driver")}
          driverPlural={plural("driver")}
          onSubmit={(input) => {
            addDriverReview(input);
            setShowAddDriverReview(false);
          }}
          onCancel={() => setShowAddDriverReview(false)}
        />
      </DetailSidebar>

      <DetailSidebar
        open={Boolean(selectedDriverReview)}
        onClose={() => setSelectedDriverReviewId(null)}
        title={
          selectedDriverReview
            ? `Driver review — ${crew.find((c) => c.id === selectedDriverReview.driverId)?.name ?? "—"}`
            : "Driver review"
        }
        widthClassName="max-w-lg"
      >
        {selectedDriverReview ? (
          <DriverReviewForm
            key={selectedDriverReview.id}
            drivers={drivers}
            driverLabel={label("driver")}
            driverPlural={plural("driver")}
            initial={selectedDriverReview}
            submitLabel="Save changes"
            onSubmit={(input) => {
              updateDriverReview(selectedDriverReview.id, input);
              setSelectedDriverReviewId(null);
            }}
            onCancel={() => setSelectedDriverReviewId(null)}
            onDelete={() => {
              deleteDriverReview(selectedDriverReview.id);
              setSelectedDriverReviewId(null);
            }}
          />
        ) : null}
      </DetailSidebar>

      <DetailSidebar
        open={Boolean(selectedRating)}
        onClose={() => setSelectedRatingId(null)}
        title={
          selectedRating
            ? `Job review — ${crew.find((c) => c.id === selectedRating.skipperId)?.name ?? "—"}`
            : "Job review"
        }
        widthClassName="max-w-lg"
      >
        {selectedRating ? (
          <RatingForm
            key={selectedRating.id}
            skippers={skippers}
            skipperLabel={label("skipper")}
            skipperPlural={plural("skipper")}
            initial={selectedRating}
            submitLabel="Save changes"
            onSubmit={(input) => {
              updateSkipperRating(selectedRating.id, input);
              setSelectedRatingId(null);
            }}
            onCancel={() => setSelectedRatingId(null)}
            onDelete={() => {
              deleteSkipperRating(selectedRating.id);
              setSelectedRatingId(null);
            }}
          />
        ) : null}
      </DetailSidebar>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white px-4 py-3",
        highlight ? "border-amber-200 bg-amber-50/50" : "border-slate-200",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-brand-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      )}
    >
      {children}
    </button>
  );
}

function SidebarFormFooter({
  submitLabel,
  onCancel,
  onDelete,
  deleteConfirmTitle,
  deleteConfirmDescription,
  submitDisabled,
}: {
  submitLabel: string;
  onCancel: () => void;
  onDelete?: () => void;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
  submitDisabled?: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <Button type="submit" disabled={submitDisabled}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        {onDelete ? (
          <Button
            type="button"
            variant="danger"
            className="sm:ml-auto"
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </Button>
        ) : null}
      </div>
      {onDelete ? (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={onDelete}
          title={deleteConfirmTitle ?? "Delete record?"}
          description={
            deleteConfirmDescription ?? "This cannot be undone. The record will be removed permanently."
          }
          confirmLabel="Delete"
          variant="danger"
        />
      ) : null}
    </>
  );
}

function IssueForm({
  crew,
  defaults = {},
  initial,
  submitLabel = "Save",
  onSubmit,
  onCancel,
  onDelete,
}: {
  crew: { id: string; name: string }[];
  defaults?: IssueFormDefaults;
  initial?: CrewIssue;
  submitLabel?: string;
  onSubmit: (input: Omit<CrewIssue, "id" | "createdAt">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [crewId, setCrewId] = useState(initial?.crewId ?? crew[0]?.id ?? "");
  const [kind, setKind] = useState<CrewIssueKind>(initial?.kind ?? defaults.kind ?? "violation");
  const [subject, setSubject] = useState<CrewIssueSubject>(
    initial?.subject ?? defaults.subject ?? "attendance",
  );
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [messageSent, setMessageSent] = useState(initial?.messageSent ?? false);
  const [status, setStatus] = useState<CrewIssueStatus>(initial?.status ?? "open");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [jobLink, setJobLink] = useState<CompletedMoveJobRefValue>({
    jobRef: initial?.jobRef ?? "",
    moveId: initial?.moveId,
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!crewId || !description.trim()) return;
        onSubmit({
          crewId,
          kind,
          subject,
          date,
          description: description.trim(),
          messageSent,
          jobRef: jobLink.jobRef.trim() || undefined,
          moveId: jobLink.moveId,
          status,
          notes: notes.trim() || undefined,
          reportedBy: initial?.reportedBy ?? "Operations",
          resolvedAt:
            status === "resolved"
              ? initial?.resolvedAt ?? new Date().toISOString().slice(0, 10)
              : undefined,
        });
      }}
    >
      <Field label="Crew member">
        <select
          value={crewId}
          onChange={(e) => setCrewId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        >
          {crew.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Issue type">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as CrewIssueKind)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          >
            {CREW_ISSUE_KINDS.map((value) => (
              <option key={value} value={value}>
                {CREW_ISSUE_KIND_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Subject">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as CrewIssueSubject)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          >
            {CREW_ISSUE_SUBJECTS.map((value) => (
              <option key={value} value={value}>
                {CREW_ISSUE_SUBJECT_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          placeholder="What happened and any follow-up needed…"
        />
      </Field>
      <Field label="Related move (optional)">
        <CompletedMoveJobRefPicker value={jobLink} onChange={setJobLink} />
      </Field>
      {initial ? (
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CrewIssueStatus)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          >
            {(Object.keys(CREW_ISSUE_STATUS_LABELS) as CrewIssueStatus[]).map((s) => (
              <option key={s} value={s}>
                {CREW_ISSUE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
        <input
          type="checkbox"
          checked={messageSent}
          onChange={(e) => setMessageSent(e.target.checked)}
          className="rounded border-slate-300 text-brand-600"
        />
        <span className="text-sm text-slate-800">Message sent to crew member</span>
      </label>
      {initial ? (
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
            placeholder="Resolution notes, follow-up…"
          />
        </Field>
      ) : null}
      {initial && status !== "resolved" ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Open issues appear in crew reporting until resolved.
        </div>
      ) : null}
      <SidebarFormFooter
        submitLabel={submitLabel}
        onCancel={onCancel}
        onDelete={initial ? onDelete : undefined}
        deleteConfirmTitle="Delete issue?"
        deleteConfirmDescription="This issue will be removed from the log and crew reporting."
      />
    </form>
  );
}

function RatingForm({
  skippers,
  skipperLabel,
  skipperPlural,
  initial,
  submitLabel = "Save review",
  onSubmit,
  onCancel,
  onDelete,
}: {
  skippers: { id: string; name: string }[];
  skipperLabel: string;
  skipperPlural: string;
  initial?: SkipperRating;
  submitLabel?: string;
  onSubmit: (input: Omit<SkipperRating, "id" | "createdAt" | "rating">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [skipperId, setSkipperId] = useState(initial?.skipperId ?? skippers[0]?.id ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [jobLink, setJobLink] = useState<CompletedMoveJobRefValue>({
    jobRef: initial?.jobRef ?? "",
    moveId: initial?.moveId,
  });
  const [violations, setViolations] = useState<SkipperViolationId[]>(initial?.violations ?? []);
  const [callbackNote, setCallbackNote] = useState(initial?.callbackNote ?? "");
  const [otherNote, setOtherNote] = useState(initial?.otherNote ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const computedRating = computeSkipperRating(violations);
  const threeFlag = hasThreeViolationsFlag(violations);

  function toggleViolation(id: SkipperViolationId) {
    setViolations((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
      if (id === SKIPPER_CALLBACK_VIOLATION_ID && prev.includes(id)) {
        setCallbackNote("");
      }
      return next;
    });
  }

  if (skippers.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No active {skipperPlural.toLowerCase()} on the roster.
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!skipperId) return;
        if (violations.includes(SKIPPER_CALLBACK_VIOLATION_ID) && !callbackNote.trim()) return;
        onSubmit({
          skipperId,
          date,
          jobRef: jobLink.jobRef.trim() || undefined,
          moveId: jobLink.moveId,
          violations,
          callbackNote:
            violations.includes(SKIPPER_CALLBACK_VIOLATION_ID)
              ? callbackNote.trim()
              : undefined,
          otherNote:
            violations.includes("other") && otherNote.trim() ? otherNote.trim() : undefined,
          notes: notes.trim() || undefined,
          ratedBy: "Operations",
        });
      }}
    >
      <Field label={skipperLabel}>
        <select
          value={skipperId}
          onChange={(e) => setSkipperId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        >
          {skippers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </Field>
      <Field label="Related move">
        <CompletedMoveJobRefPicker value={jobLink} onChange={setJobLink} />
      </Field>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Violations checklist
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Check everything that applied on this job. Score starts at 10 and drops 1 point per item.
        </p>
        <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {SKIPPER_VIOLATION_IDS.map((id) => (
            <li key={id}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50",
                  id === SKIPPER_CALLBACK_VIOLATION_ID &&
                    "border border-transparent hover:border-violet-100",
                  id === SKIPPER_CALLBACK_VIOLATION_ID &&
                    violations.includes(id) &&
                    "border-violet-200 bg-violet-50/80",
                )}
              >
                <input
                  type="checkbox"
                  checked={violations.includes(id)}
                  onChange={() => toggleViolation(id)}
                  className="mt-0.5 rounded border-slate-300 text-brand-600"
                />
                <span
                  className={cn(
                    "text-sm leading-snug text-slate-800",
                    id === SKIPPER_CALLBACK_VIOLATION_ID && "font-medium text-violet-900",
                  )}
                >
                  {SKIPPER_VIOLATION_LABELS[id]}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {violations.includes(SKIPPER_CALLBACK_VIOLATION_ID) ? (
        <Field label="Callback details">
          <textarea
            value={callbackNote}
            onChange={(e) => setCallbackNote(e.target.value)}
            rows={2}
            required
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
            placeholder="What happened and follow-up needed…"
          />
        </Field>
      ) : null}

      {violations.includes("other") ? (
        <Field label="Other — describe">
          <input
            value={otherNote}
            onChange={(e) => setOtherNote(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
            placeholder="Brief description"
          />
        </Field>
      ) : null}

      <div
        className={cn(
          "rounded-xl border px-4 py-3",
          threeFlag
            ? "border-red-200 bg-red-50"
            : violations.length === 0
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-slate-200 bg-slate-50",
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Calculated rating
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              violationRatingTextClass(computedRating),
            )}
          >
            {formatViolationRating(computedRating)}
          </span>
          {violations.length === 0 ? (
            <span className="text-xs text-emerald-700">Clean job — no violations</span>
          ) : null}
          {threeFlag ? (
            <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900">
              3+ violations
            </span>
          ) : null}
        </div>
      </div>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          placeholder="Optional context for ops…"
        />
      </Field>

      <SidebarFormFooter
        submitLabel={submitLabel}
        onCancel={onCancel}
        onDelete={initial ? onDelete : undefined}
        deleteConfirmTitle="Delete job review?"
        deleteConfirmDescription="This skipper job review will be removed permanently."
        submitDisabled={
          violations.includes(SKIPPER_CALLBACK_VIOLATION_ID) && !callbackNote.trim()
        }
      />
    </form>
  );
}

function DriverReviewForm({
  drivers,
  driverLabel,
  driverPlural,
  initial,
  submitLabel = "Save review",
  onSubmit,
  onCancel,
  onDelete,
}: {
  drivers: { id: string; name: string }[];
  driverLabel: string;
  driverPlural: string;
  initial?: DriverReview;
  submitLabel?: string;
  onSubmit: (input: Omit<DriverReview, "id" | "createdAt" | "rating">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [driverId, setDriverId] = useState(initial?.driverId ?? drivers[0]?.id ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [jobLink, setJobLink] = useState<CompletedMoveJobRefValue>({
    jobRef: initial?.jobRef ?? "",
    moveId: initial?.moveId,
  });
  const [violations, setViolations] = useState<DriverViolationId[]>(initial?.violations ?? []);
  const [otherNote, setOtherNote] = useState(initial?.otherNote ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const computedRating = computeDriverRating(violations);
  const threeFlag = hasThreeDriverViolationsFlag(violations);

  function toggleViolation(id: DriverViolationId) {
    setViolations((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }

  if (drivers.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No active {driverPlural.toLowerCase()} on the roster.
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!driverId) return;
        onSubmit({
          driverId,
          date,
          jobRef: jobLink.jobRef.trim() || undefined,
          moveId: jobLink.moveId,
          violations,
          otherNote:
            violations.includes("other") && otherNote.trim() ? otherNote.trim() : undefined,
          notes: notes.trim() || undefined,
          reviewedBy: "Operations",
        });
      }}
    >
      <Field label={driverLabel}>
        <select
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        >
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </Field>
      <Field label="Related move">
        <CompletedMoveJobRefPicker value={jobLink} onChange={setJobLink} />
      </Field>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Telematics checklist
        </p>
        <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {DRIVER_VIOLATION_IDS.map((id) => (
            <li key={id}>
              <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={violations.includes(id)}
                  onChange={() => toggleViolation(id)}
                  className="mt-0.5 rounded border-slate-300 text-brand-600"
                />
                <span className="text-sm leading-snug text-slate-800">
                  {DRIVER_VIOLATION_LABELS[id]}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {violations.includes("other") ? (
        <Field label="Other — describe">
          <input
            value={otherNote}
            onChange={(e) => setOtherNote(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
            placeholder="Brief description"
          />
        </Field>
      ) : null}

      {threeFlag ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900">
            3+ violations
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-xl border px-4 py-3",
          threeFlag
            ? "border-red-200 bg-red-50"
            : violations.length === 0
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-slate-200 bg-slate-50",
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Calculated score
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              violationRatingTextClass(computedRating),
            )}
          >
            {formatViolationRating(computedRating)}
          </span>
          {violations.length === 0 ? (
            <span className="text-xs text-emerald-700">Clean — no violations</span>
          ) : null}
        </div>
      </div>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          placeholder="Optional context for ops…"
        />
      </Field>

      <SidebarFormFooter
        submitLabel={submitLabel}
        onCancel={onCancel}
        onDelete={initial ? onDelete : undefined}
        deleteConfirmTitle="Delete driver review?"
        deleteConfirmDescription="This driver review will be removed permanently."
      />
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
