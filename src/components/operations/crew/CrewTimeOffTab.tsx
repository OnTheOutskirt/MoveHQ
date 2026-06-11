"use client";

import { useFleet } from "@/components/providers/FleetProvider";
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
import { isCompanyOpenDayKey } from "@/lib/settings/business-calendar";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Plus, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PanelMode = { type: "closed" } | { type: "review"; id: string } | { type: "add" };

type TimeOffStatusTab = TimeOffRequest["status"];

const STATUS_TABS: { id: TimeOffStatusTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "denied", label: "Declined" },
];

const EMPTY_MESSAGES: Record<TimeOffStatusTab, string> = {
  pending: "No pending requests.",
  approved: "No approved requests.",
  denied: "No declined requests.",
};

export function CrewTimeOffTab() {
  const { crew, timeOffRequests, schedules, addTimeOffRequest, updateTimeOffRequest } = useFleet();
  const [storedTab, setStoredTab] = usePersistedState<TimeOffStatusTab>(
    "jm-tab-/operations/crew/time-off",
    "pending",
  );
  const [statusTab, setStatusTab] = useState<TimeOffStatusTab>(storedTab);
  const [panel, setPanel] = useState<PanelMode>({ type: "closed" });

  useEffect(() => {
    setStatusTab(storedTab);
  }, [storedTab]);

  const selected =
    panel.type === "review" ? timeOffRequests.find((r) => r.id === panel.id) : undefined;

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
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Review crew requests and manual time off. Approval checks mover staffing (need{" "}
          {MIN_MOVERS_FOR_APPROVAL}+ movers on affected days).
        </p>
        <Button type="button" size="sm" onClick={() => setPanel({ type: "add" })}>
          <Plus className="h-4 w-4" />
          Add time off
        </Button>
      </div>

      <TabBar tabs={tabsWithCounts} activeTab={statusTab} onChange={changeStatusTab} />

      <div className="rounded-xl border border-slate-200 bg-white">
        <DataTable
          columns={columns}
          data={filteredRows}
          getRowKey={(r) => r.id}
          onRowClick={(r) => setPanel({ type: "review", id: r.id })}
          emptyMessage={EMPTY_MESSAGES[statusTab]}
        />
      </div>

      <DetailSidebar
        open={panel.type !== "closed"}
        onClose={() => setPanel({ type: "closed" })}
        title={
          panel.type === "add"
            ? "Add time off"
            : selected
              ? `Time off — ${crew.find((c) => c.id === selected.crewId)?.name}`
              : "Time off"
        }
        widthClassName="max-w-lg"
      >
        {panel.type === "add" ? (
          <AddTimeOffForm
            crew={crew}
            onCancel={() => setPanel({ type: "closed" })}
            onSave={(data) => {
              addTimeOffRequest({ ...data, source: "manual", status: "approved" });
              setPanel({ type: "closed" });
            }}
          />
        ) : selected ? (
          <EditTimeOffPanel
            request={selected}
            crewName={crew.find((c) => c.id === selected.crewId)?.name ?? "—"}
            crew={crew}
            schedules={schedules}
            timeOffRequests={timeOffRequests}
            onClose={() => setPanel({ type: "closed" })}
            onSave={(patch) => {
              updateTimeOffRequest(selected.id, patch);
              setPanel({ type: "closed" });
            }}
          />
        ) : null}
      </DetailSidebar>
    </>
  );
}

function EditTimeOffPanel({
  request,
  crewName,
  crew,
  schedules,
  timeOffRequests,
  onClose,
  onSave,
}: {
  request: TimeOffRequest;
  crewName: string;
  crew: ReturnType<typeof useFleet>["crew"];
  schedules: ReturnType<typeof useFleet>["schedules"];
  timeOffRequests: TimeOffRequest[];
  onClose: () => void;
  onSave: (patch: Partial<TimeOffRequest>) => void;
}) {
  const { plural } = useTerminology();
  const { openDays } = useBusinessCalendar();
  const [startDate, setStartDate] = useState(request.startDate);
  const [endDate, setEndDate] = useState(request.endDate);
  const [reason, setReason] = useState(request.reason);
  const [status, setStatus] = useState(request.status);
  const [reviewNote, setReviewNote] = useState(request.reviewNote ?? "");

  const draft = useMemo(
    () => ({
      id: request.id,
      crewId: request.crewId,
      startDate,
      endDate: endDate || startDate,
    }),
    [request.id, request.crewId, startDate, endDate],
  );

  const impact = useMemo(() => {
    if (status !== "pending" && status !== "approved") return null;
    if (!startDate) return null;
    return evaluateTimeOffImpact(draft, crew, schedules, timeOffRequests, openDays);
  }, [status, draft, crew, schedules, timeOffRequests, startDate, openDays]);

  const approvalBlocked = status === "approved" && impact ? !impact.canApproveAll : false;

  function buildPatch(nextStatus: TimeOffRequest["status"]): Partial<TimeOffRequest> {
    return {
      startDate,
      endDate: endDate || startDate,
      reason: reason.trim() || request.reason,
      status: nextStatus,
      reviewNote:
        nextStatus === "denied"
          ? reviewNote.trim() || "Declined by operations"
          : reviewNote.trim() || undefined,
      reviewedAt: nextStatus === "pending" ? undefined : new Date().toISOString(),
    };
  }

  function save(nextStatus: TimeOffRequest["status"] = status) {
    if (!startDate) return;
    if (nextStatus === "approved") {
      const check = evaluateTimeOffImpact(
        { ...draft, startDate, endDate: endDate || startDate },
        crew,
        schedules,
        timeOffRequests,
        openDays,
      );
      if (!check.canApproveAll) return;
    }
    onSave(buildPatch(nextStatus));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm">
        <p className="text-[10px] font-semibold uppercase text-slate-500">Crew member</p>
        <p className="font-medium text-slate-900">{crewName}</p>
        <p className="mt-1 text-xs text-slate-500 capitalize">
          {request.source === "crew_app" ? "Submitted from crew app" : "Entered manually"}
          {request.reviewedAt
            ? ` · Last reviewed ${new Date(request.reviewedAt).toLocaleDateString()}`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">Start</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">End</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TimeOffRequest["status"])}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Declined</option>
        </select>
      </div>

      {status === "denied" ? (
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">
            Decline note
          </label>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={2}
            placeholder="Optional note to crew…"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      ) : null}

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

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => save()} disabled={approvalBlocked || !startDate}>
          Save changes
        </Button>
        {request.status === "pending" ? (
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
          Cancel
        </Button>
      </div>
    </div>
  );
}

function AddTimeOffForm({
  crew,
  onSave,
  onCancel,
}: {
  crew: { id: string; name: string }[];
  onSave: (data: {
    crewId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => void;
  onCancel: () => void;
}) {
  const [crewId, setCrewId] = useState(crew[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!crewId || !startDate || !endDate) return;
        onSave({
          crewId,
          startDate,
          endDate: endDate || startDate,
          reason: reason.trim() || "Manual entry",
        });
      }}
    >
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500">Crew</label>
        <select
          value={crewId}
          onChange={(e) => setCrewId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {crew.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">Start</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">End</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save as approved</Button>
      </div>
    </form>
  );
}
