"use client";

import { useCrewRecords } from "@/components/providers/CrewRecordsProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { TabBar } from "@/components/shared/TabBar";
import {
  CREW_ISSUE_STATUS_LABELS,
  CREW_ISSUE_TYPE_LABELS,
  averageSkipperRating,
  isDriver,
  isSkipper,
} from "@/lib/operations/crew-records";
import {
  CREW_ISSUE_TYPES,
  type CrewIssue,
  type CrewIssueStatus,
  type CrewIssueType,
  type SkipperRating,
} from "@/lib/operations/crew-records-types";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { AlertTriangle, Plus, Star } from "lucide-react";
import Link from "next/link";
import { salesMovePath } from "@/lib/navigation/routes";
import { useMemo, useState, type ReactNode } from "react";

const TRACK_RECORD_VIEW_IDS = ["issues", "skippers", "drivers"] as const;
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

type IssueFilter = "all" | CrewIssueType;

type IssuePanel =
  | { type: "closed" }
  | { type: "view"; id: string }
  | { type: "add" };

function issueBadgeVariant(type: CrewIssueType): "default" | "warning" | "danger" | "brand" {
  if (type === "claim") return "danger";
  if (type === "tardy" || type === "driving") return "warning";
  if (type === "callback") return "brand";
  return "default";
}

function statusBadgeVariant(status: CrewIssueStatus): "default" | "warning" | "success" {
  if (status === "open") return "warning";
  if (status === "under_review") return "default";
  return "success";
}

function RatingStars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("h-3.5 w-3.5", i < value ? "fill-current" : "fill-none text-slate-300")}
        />
      ))}
      <span className="ml-1 tabular-nums text-xs font-medium text-slate-700">{value}</span>
    </span>
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
    ],
    [plural],
  );
  const { issues, skipperRatings, addIssue, updateIssue, addSkipperRating } = useCrewRecords();
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
  const [addDrivingIssue, setAddDrivingIssue] = useState(false);

  const openIssues = issues.filter((i) => i.status !== "resolved").length;
  const underReview = issues.filter((i) => i.status === "under_review").length;
  const tardies30d = issues.filter(
    (i) => isWithinDays(i.date, 30) && i.type === "tardy",
  ).length;
  const ratings30d = skipperRatings.filter((r) => isWithinDays(r.date, 30)).length;
  const avgRating = averageSkipperRating(skipperRatings);
  const skippers = crew.filter((c) => isSkipper(c) && c.active);
  const drivers = crew.filter((c) => isDriver(c) && c.active);
  const driving30d = issues.filter(
    (i) => isWithinDays(i.date, 30) && i.type === "driving",
  ).length;
  const openDriving = issues.filter(
    (i) => i.type === "driving" && i.status !== "resolved",
  ).length;

  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      if (issueFilter !== "all" && i.type !== issueFilter) return false;
      if (crewFilter !== "all" && i.crewId !== crewFilter) return false;
      return true;
    });
  }, [issues, issueFilter, crewFilter]);

  const drivingIssues = useMemo(() => {
    return issues.filter((i) => {
      if (i.type !== "driving") return false;
      if (crewFilter !== "all" && i.crewId !== crewFilter) return false;
      return true;
    });
  }, [issues, crewFilter]);

  const driverSummaries = useMemo(() => {
    return drivers.map((driver) => {
      const memberIssues = issues.filter((i) => i.crewId === driver.id && i.type === "driving");
      const recent = memberIssues.filter((i) => isWithinDays(i.date, 30));
      const open = memberIssues.filter((i) => i.status !== "resolved").length;
      const lastIncident = memberIssues
        .map((i) => i.date)
        .sort((a, b) => b.localeCompare(a))[0];
      return {
        crewId: driver.id,
        name: driver.name,
        driving30d: recent.length,
        openDriving: open,
        lastIncident: lastIncident ?? null,
      };
    });
  }, [drivers, issues]);

  const filteredRatings = useMemo(() => {
    if (crewFilter === "all") return skipperRatings;
    return skipperRatings.filter((r) => r.skipperId === crewFilter);
  }, [skipperRatings, crewFilter]);

  const selectedIssue =
    issuePanel.type === "view" ? issues.find((i) => i.id === issuePanel.id) : undefined;

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
        key: "type",
        header: "Type",
        cell: (row) => (
          <Badge variant={issueBadgeVariant(row.type)}>{CREW_ISSUE_TYPE_LABELS[row.type]}</Badge>
        ),
      },
      {
        key: "title",
        header: "Summary",
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{row.title}</p>
            {row.jobRef ? <p className="text-[11px] text-slate-500">{row.jobRef}</p> : null}
          </div>
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
        key: "rating",
        header: "Overall",
        cell: (row) => <RatingStars value={row.rating} />,
      },
      {
        key: "job",
        header: "Job",
        cell: (row) => row.jobRef ?? "—",
      },
      {
        key: "notes",
        header: "Notes",
        cell: (row) => (
          <span className="line-clamp-1 text-slate-600">{row.notes ?? "—"}</span>
        ),
      },
    ],
    [crew, label],
  );

  const driverSummaryColumns = useMemo<
    Column<{
      crewId: string;
      name: string;
      driving30d: number;
      openDriving: number;
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
        key: "driving30d",
        header: "Driving (30d)",
        cell: (row) => row.driving30d,
      },
      {
        key: "open",
        header: "Open driving",
        cell: (row) => (
          <span className={row.openDriving > 0 ? "font-medium text-amber-700" : "text-slate-600"}>
            {row.openDriving}
          </span>
        ),
      },
      {
        key: "last",
        header: "Last incident",
        cell: (row) => row.lastIncident ?? "—",
      },
    ],
    [label],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TabBar tabs={trackRecordViews} activeTab={view} onChange={setView} />
        <div className="flex flex-wrap items-center gap-2">
          {view !== "skippers" ? (
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
          ) : (
            <label className="text-xs font-medium text-slate-500">
              {label("skipper")}
              <select
                value={crewFilter}
                onChange={(e) => setCrewFilter(e.target.value)}
                className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800"
              >
                <option value="all">All {plural("skipper").toLowerCase()}</option>
                {skippers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {view === "issues" ? (
            <Button type="button" size="sm" onClick={() => setIssuePanel({ type: "add" })}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Log issue
            </Button>
          ) : null}
          {view === "skippers" ? (
            <Button type="button" size="sm" onClick={() => setShowAddRating(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add rating
            </Button>
          ) : null}
          {view === "drivers" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setAddDrivingIssue(true);
                setIssuePanel({ type: "add" });
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Log driving issue
            </Button>
          ) : null}
        </div>
      </div>

      {view === "issues" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Open issues" value={String(openIssues)} />
            <SummaryCard label="Under review" value={String(underReview)} />
            <SummaryCard label="Tardies (30d)" value={String(tardies30d)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={issueFilter === "all"} onClick={() => setIssueFilter("all")}>
              All
            </FilterChip>
            {CREW_ISSUE_TYPES.map((type) => (
              <FilterChip
                key={type}
                active={issueFilter === type}
                onClick={() => setIssueFilter(type)}
              >
                {CREW_ISSUE_TYPE_LABELS[type]}
              </FilterChip>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white">
            <DataTable
              columns={issueColumns}
              data={filteredIssues}
              emptyMessage="No issues match these filters."
              onRowClick={(row) => setIssuePanel({ type: "view", id: row.id })}
              getRowKey={(row) => row.id}
            />
          </div>
        </>
      ) : null}

      {view === "skippers" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Avg skipper rating"
              value={avgRating != null ? `${avgRating} / 5` : "—"}
            />
            <SummaryCard label="Ratings (30d)" value={String(ratings30d)} />
            <SummaryCard label="Active skippers" value={String(skippers.length)} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white">
            <DataTable
              columns={ratingColumns}
              data={filteredRatings}
              emptyMessage="No skipper ratings yet."
              getRowKey={(row) => row.id}
            />
          </div>
        </>
      ) : null}

      {view === "drivers" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Driving events (30d)" value={String(driving30d)} />
            <SummaryCard
              label="Open driving issues"
              value={String(openDriving)}
              highlight={openDriving > 0}
            />
            <SummaryCard label="Active drivers" value={String(drivers.length)} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white">
            <DataTable
              columns={driverSummaryColumns}
              data={driverSummaries}
              emptyMessage="No active drivers on the roster."
              getRowKey={(row) => row.crewId}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Driving issues</h3>
            <div className="rounded-xl border border-slate-200 bg-white">
              <DataTable
                columns={issueColumns}
                data={drivingIssues}
                emptyMessage="No driving issues logged."
                onRowClick={(row) => setIssuePanel({ type: "view", id: row.id })}
                getRowKey={(row) => row.id}
              />
            </div>
          </div>
        </>
      ) : null}

      <DetailSidebar
        open={issuePanel.type !== "closed"}
        onClose={() => {
          setIssuePanel({ type: "closed" });
          setAddDrivingIssue(false);
        }}
        title={
          issuePanel.type === "add"
            ? addDrivingIssue
              ? "Log driving issue"
              : "Log issue"
            : selectedIssue
              ? CREW_ISSUE_TYPE_LABELS[selectedIssue.type]
              : "Issue"
        }
        widthClassName="max-w-md"
      >
        {issuePanel.type === "add" ? (
          <IssueForm
            crew={crew}
            defaultType={addDrivingIssue ? "driving" : "tardy"}
            onSubmit={(input) => {
              addIssue(input);
              setIssuePanel({ type: "closed" });
              setAddDrivingIssue(false);
            }}
            onCancel={() => {
              setIssuePanel({ type: "closed" });
              setAddDrivingIssue(false);
            }}
          />
        ) : selectedIssue ? (
          <IssueDetail
            issue={selectedIssue}
            crewName={crew.find((c) => c.id === selectedIssue.crewId)?.name ?? "—"}
            onUpdate={(patch) => updateIssue(selectedIssue.id, patch)}
          />
        ) : null}
      </DetailSidebar>

      <DetailSidebar
        open={showAddRating}
        onClose={() => setShowAddRating(false)}
        title={`Add ${label("skipper").toLowerCase()} rating`}
        widthClassName="max-w-md"
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

function IssueForm({
  crew,
  defaultType = "tardy",
  onSubmit,
  onCancel,
}: {
  crew: { id: string; name: string }[];
  defaultType?: CrewIssueType;
  onSubmit: (input: Omit<CrewIssue, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [crewId, setCrewId] = useState(crew[0]?.id ?? "");
  const [type, setType] = useState<CrewIssueType>(defaultType);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobRef, setJobRef] = useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!crewId || !title.trim()) return;
        onSubmit({
          crewId,
          type,
          date,
          title: title.trim(),
          description: description.trim() || undefined,
          jobRef: jobRef.trim() || undefined,
          status: "open",
          reportedBy: "Operations",
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
      <Field label="Type">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CrewIssueType)}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        >
          {CREW_ISSUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {CREW_ISSUE_TYPE_LABELS[t]}
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
      <Field label="Summary">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          placeholder="Brief description"
        />
      </Field>
      <Field label="Job ref">
        <input
          value={jobRef}
          onChange={(e) => setJobRef(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          placeholder="JM-1042"
        />
      </Field>
      <Field label="Details">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </Field>
      <div className="flex gap-2 pt-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function IssueDetail({
  issue,
  crewName,
  onUpdate,
}: {
  issue: CrewIssue;
  crewName: string;
  onUpdate: (patch: Partial<CrewIssue>) => void;
}) {
  return (
    <div className="space-y-4">
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Crew</dt>
          <dd className="font-medium text-slate-900">{crewName}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Date</dt>
          <dd>{issue.date}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-500">Summary</dt>
          <dd>{issue.title}</dd>
        </div>
        {issue.description ? (
          <div>
            <dt className="text-[10px] font-semibold uppercase text-slate-500">Details</dt>
            <dd className="text-slate-700">{issue.description}</dd>
          </div>
        ) : null}
        {issue.jobRef ? (
          <div>
            <dt className="text-[10px] font-semibold uppercase text-slate-500">Job</dt>
            <dd>{issue.jobRef}</dd>
          </div>
        ) : null}
        {issue.moveId ? (
          <div>
            <dt className="text-[10px] font-semibold uppercase text-slate-500">Move</dt>
            <dd>
              <Link href={salesMovePath(issue.moveId)} className="text-brand-600 hover:text-brand-700">
                Open move →
              </Link>
            </dd>
          </div>
        ) : null}
      </dl>

      <Field label="Status">
        <select
          value={issue.status}
          onChange={(e) => {
            const status = e.target.value as CrewIssueStatus;
            onUpdate({
              status,
              resolvedAt: status === "resolved" ? new Date().toISOString().slice(0, 10) : undefined,
            });
          }}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        >
          {(Object.keys(CREW_ISSUE_STATUS_LABELS) as CrewIssueStatus[]).map((s) => (
            <option key={s} value={s}>
              {CREW_ISSUE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Notes">
        <textarea
          value={issue.notes ?? ""}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          placeholder="Resolution notes, follow-up…"
        />
      </Field>

      {issue.status !== "resolved" ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Open issues appear in crew reporting until resolved.
        </div>
      ) : null}
    </div>
  );
}

function RatingForm({
  skippers,
  skipperLabel,
  skipperPlural,
  onSubmit,
  onCancel,
}: {
  skippers: { id: string; name: string }[];
  skipperLabel: string;
  skipperPlural: string;
  onSubmit: (input: Omit<SkipperRating, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [skipperId, setSkipperId] = useState(skippers[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState(4);
  const [jobRef, setJobRef] = useState("");
  const [notes, setNotes] = useState("");

  if (skippers.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No active {skipperPlural.toLowerCase()} on the roster.
      </p>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!skipperId) return;
        onSubmit({
          skipperId,
          date,
          rating,
          jobRef: jobRef.trim() || undefined,
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
      <Field label="Overall rating">
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} — {n >= 4 ? "Good" : n === 3 ? "Fair" : "Needs improvement"}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Job ref">
        <input
          value={jobRef}
          onChange={(e) => setJobRef(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </Field>
      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </Field>
      <div className="flex gap-2 pt-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
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
