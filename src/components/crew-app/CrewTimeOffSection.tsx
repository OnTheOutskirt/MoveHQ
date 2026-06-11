"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import {
  submitTimeOffRequest,
  timeOffStatusLabel,
  type CrewTimeOffRequest,
  type TimeOffStatus,
} from "@/lib/crew-app/crew-inbox-storage";
import { formatMoveDate } from "@/lib/moves/format";
import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { useSettings } from "@/components/providers/SettingsProvider";
import { calendarFromCompany, isCompanyOpenDayKey } from "@/lib/settings/business-calendar";
import { cn } from "@/lib/utils";
import { CalendarOff, ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";

type CrewTimeOffSectionProps = {
  requests: CrewTimeOffRequest[];
};

export function CrewTimeOffSection({ requests }: CrewTimeOffSectionProps) {
  const { session, refreshInbox, isClientReady } = useCrewApp();
  const { settings } = useSettings();
  const openDays = useMemo(
    () => calendarFromCompany(settings.company).openDays,
    [settings.company],
  );
  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedReason = reason.trim();
    if (!startDate || !endDate) {
      setError("Pick a start and end date.");
      return;
    }
    if (endDate < startDate) {
      setError("End date can't be before start date.");
      return;
    }
    if (!trimmedReason) {
      setError("Enter a reason for your time off request.");
      return;
    }
    if (
      !eachDateKeyInRange(startDate, endDate).every((dateKey) =>
        isCompanyOpenDayKey(dateKey, openDays),
      )
    ) {
      setError("Time off can only be requested on days the business is open.");
      return;
    }
    submitTimeOffRequest(session.crewId, { startDate, endDate, note: trimmedReason });
    refreshInbox();
    setShowForm(false);
    setStartDate("");
    setEndDate("");
    setReason("");
    setError("");
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <CalendarOff className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Time off</p>
            <p className="text-[11px] text-slate-500">Request days off · track approval status</p>
          </div>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition", expanded && "rotate-180")}
        />
      </button>

      {expanded ? (
        <div className="space-y-3 border-t border-slate-100 px-4 py-3">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 py-2.5 text-sm font-semibold text-brand-800"
            >
              <Plus className="h-4 w-4" />
              Request time off
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <p className="text-xs font-semibold text-slate-800">New request</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-[10px] font-medium text-slate-500">
                  From
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block text-[10px] font-medium text-slate-500">
                  To
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
              </div>
              <label className="block text-[10px] font-medium text-slate-500">
                Reason
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. family trip, doctor appointment"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                />
              </label>
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white"
                >
                  Submit
                </button>
              </div>
            </form>
          )}

          {!isClientReady ? (
            <p className="text-center text-xs text-slate-500">Loading requests…</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-xs text-slate-500">No requests yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
              {requests.map((req) => (
                <li key={req.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {formatDateRange(req.startDate, req.endDate)}
                    </p>
                    {req.note ? (
                      <p className="mt-0.5 truncate text-xs text-slate-500">{req.note}</p>
                    ) : null}
                  </div>
                  <StatusBadge status={req.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}

function formatDateRange(start: string, end: string): string {
  if (start === end) return formatMoveDate(start);
  return `${formatMoveDate(start)} – ${formatMoveDate(end)}`;
}

function eachDateKeyInRange(start: string, end: string): string[] {
  const keys: string[] = [];
  let d = parseDateKey(start);
  const endD = parseDateKey(end);
  while (d <= endD) {
    keys.push(toDateKey(d));
    d = addDays(d, 1);
  }
  return keys;
}

function StatusBadge({ status }: { status: TimeOffStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        status === "approved" && "bg-emerald-100 text-emerald-800",
        status === "pending" && "bg-amber-100 text-amber-900",
        status === "denied" && "bg-red-100 text-red-800",
      )}
    >
      {timeOffStatusLabel(status)}
    </span>
  );
}
