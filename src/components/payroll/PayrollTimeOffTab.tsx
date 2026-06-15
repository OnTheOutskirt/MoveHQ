"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { useCapabilities } from "@/lib/auth/use-capabilities";
import { TabBar } from "@/components/shared/TabBar";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import {
  evaluateTimeOffImpact,
  MIN_MOVERS_FOR_APPROVAL,
  type TimeOffRequest,
} from "@/lib/operations/fleet";
import { useBusinessCalendar } from "@/lib/settings/use-business-calendar";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TimeOffStatusTab = TimeOffRequest["status"];

const STATUS_TABS: { id: TimeOffStatusTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "denied", label: "Declined" },
];

const EMPTY_MESSAGES: Record<TimeOffStatusTab, string> = {
  pending: "No pending time off requests.",
  approved: "No approved requests.",
  denied: "No declined requests.",
};

export function PayrollTimeOffTab() {
  const { can } = useCapabilities();
  const canApprove = can("payroll.approve");
  const { crew, timeOffRequests, schedules, updateTimeOffRequest } = useFleet();
  const [storedTab, setStoredTab] = usePersistedState<TimeOffStatusTab>(
    "jm-tab-/operations/payroll/time-off",
    "pending",
  );
  const [statusTab, setStatusTab] = useState<TimeOffStatusTab>(storedTab);
  const [reviewId, setReviewId] = useState<string | null>(null);

  useEffect(() => {
    setStatusTab(storedTab);
  }, [storedTab]);

  const selected = reviewId ? timeOffRequests.find((r) => r.id === reviewId) : undefined;

  const groupedRequests = useMemo(() => {
    const sorted = [...timeOffRequests].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return {
      pending: sorted.filter((r) => r.status === "pending"),
      approved: sorted.filter((r) => r.status === "approved"),
      denied: sorted.filter((r) => r.status === "denied"),
    };
  }, [timeOffRequests]);

  const tabsWithCounts = useMemo(
    () =>
      STATUS_TABS.map((tab) => ({
        ...tab,
        label: `${tab.label} (${groupedRequests[tab.id].length})`,
      })),
    [groupedRequests],
  );

  const filteredRows = groupedRequests[statusTab];

  const columns = useMemo<Column<TimeOffRequest>[]>(
    () => [
      {
        key: "crew",
        header: "Crew",
        cell: (row) => crew.find((c) => c.id === row.crewId)?.name ?? row.crewId,
      },
      {
        key: "dates",
        header: "Dates",
        cell: (row) => (
          <span className="text-slate-800">
            {row.startDate}
            {row.endDate !== row.startDate ? ` → ${row.endDate}` : ""}
          </span>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        cell: (row) => <span className="line-clamp-1 text-slate-600">{row.reason}</span>,
      },
      {
        key: "source",
        header: "Source",
        cell: (row) => (
          <span className="text-xs capitalize text-slate-500">
            {row.source === "crew_app" ? "Crew app" : "Manual"}
          </span>
        ),
      },
    ],
    [crew],
  );

  function changeStatusTab(next: TimeOffStatusTab) {
    setStatusTab(next);
    setStoredTab(next);
    setReviewId(null);
  }

  return (
    <>
      <div className="space-y-1">
        <p className="text-sm text-slate-600">
          Review and approve crew time off before scheduling and payroll. Approval checks mover
          staffing (need {MIN_MOVERS_FOR_APPROVAL}+ movers on affected days).
        </p>
        {!canApprove ? (
          <p className="text-sm text-amber-800">
            You can view requests but need HR / payroll approval permission to approve or decline.
          </p>
        ) : null}
      </div>

      <TabBar tabs={tabsWithCounts} activeTab={statusTab} onChange={changeStatusTab} />

      <div className="rounded-xl border border-slate-200 bg-white">
        <DataTable
          columns={columns}
          data={filteredRows}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setReviewId(r.id)}
          emptyMessage={EMPTY_MESSAGES[statusTab]}
        />
      </div>

      <DetailSidebar
        open={reviewId != null}
        onClose={() => setReviewId(null)}
        title={
          selected
            ? `Time off — ${crew.find((c) => c.id === selected.crewId)?.name ?? "Crew"}`
            : "Time off"
        }
        widthClassName="max-w-lg"
      >
        {selected ? (
          <TimeOffReviewPanel
            request={selected}
            crewName={crew.find((c) => c.id === selected.crewId)?.name ?? "—"}
            crew={crew}
            schedules={schedules}
            timeOffRequests={timeOffRequests}
            canApprove={canApprove}
            onClose={() => setReviewId(null)}
            onSave={(patch) => {
              updateTimeOffRequest(selected.id, patch);
              setReviewId(null);
            }}
          />
        ) : null}
      </DetailSidebar>
    </>
  );
}

function TimeOffReviewPanel({
  request,
  crewName,
  crew,
  schedules,
  timeOffRequests,
  canApprove,
  onClose,
  onSave,
}: {
  request: TimeOffRequest;
  crewName: string;
  crew: ReturnType<typeof useFleet>["crew"];
  schedules: ReturnType<typeof useFleet>["schedules"];
  timeOffRequests: TimeOffRequest[];
  canApprove: boolean;
  onClose: () => void;
  onSave: (patch: Partial<TimeOffRequest>) => void;
}) {
  const { plural } = useTerminology();
  const { openDays } = useBusinessCalendar();
  const [reviewNote, setReviewNote] = useState(request.reviewNote ?? "");

  const impact = useMemo(() => {
    if (request.status !== "pending") return null;
    return evaluateTimeOffImpact(request, crew, schedules, timeOffRequests, openDays);
  }, [request, crew, schedules, timeOffRequests, openDays]);

  function save(nextStatus: TimeOffRequest["status"]) {
    if (!canApprove) return;
    if (nextStatus === "approved") {
      const check = evaluateTimeOffImpact(request, crew, schedules, timeOffRequests, openDays);
      if (!check.canApproveAll) return;
    }
    onSave({
      status: nextStatus,
      reviewNote:
        nextStatus === "denied"
          ? reviewNote.trim() || "Declined by payroll"
          : reviewNote.trim() || undefined,
      reviewedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm">
        <p className="text-[10px] font-semibold uppercase text-slate-500">Crew member</p>
        <p className="font-medium text-slate-900">{crewName}</p>
        <p className="mt-2 text-xs text-slate-600">
          {request.startDate}
          {request.endDate !== request.startDate ? ` → ${request.endDate}` : ""}
        </p>
        <p className="mt-1 text-sm text-slate-700">{request.reason}</p>
        <p className="mt-2 text-xs capitalize text-slate-500">
          {request.source === "crew_app" ? "Submitted from crew app" : "Entered manually"} ·{" "}
          {request.status}
        </p>
      </div>

      {impact ? (
        <div
          className={cn(
            "rounded-lg border px-3 py-2.5",
            impact.canApproveAll
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50",
          )}
        >
          <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
            {impact.canApproveAll ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            Staffing impact
          </p>
          <p className="mt-1 text-sm text-slate-700">{impact.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {impact.days.map((day) => (
              <li
                key={day.dateKey}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-xs",
                  day.canApprove
                    ? "border-emerald-100 bg-white/80"
                    : "border-amber-200 bg-white/90",
                )}
              >
                <span className="font-medium text-slate-800">{day.label}</span>
                <span className="text-slate-600">
                  {plural("mover")}: {day.moversAvailable} → {day.moversAfterApproval} after
                </span>
                {day.warning ? (
                  <span className="w-full text-amber-800">{day.warning}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {request.status === "pending" && canApprove ? (
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">
            Review note (optional)
          </label>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={2}
            placeholder="Note to crew…"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      ) : request.reviewNote ? (
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Review note</p>
          <p className="mt-1 text-sm text-slate-700">{request.reviewNote}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {request.status === "pending" && canApprove ? (
          <>
            <Button
              type="button"
              onClick={() => save("approved")}
              disabled={impact ? !impact.canApproveAll : false}
            >
              Approve
            </Button>
            <Button type="button" variant="secondary" onClick={() => save("denied")}>
              <XCircle className="h-4 w-4" />
              Deny
            </Button>
          </>
        ) : null}
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
