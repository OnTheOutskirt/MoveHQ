"use client";

import { Button } from "@/components/ui/Button";
import type { StaffCalendarMember } from "@/lib/schedule/staff-calendar-filter";
import type { StaffCalendarScope, StaffTeamFilter } from "@/lib/schedule/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type StaffScheduleToolbarProps = {
  periodLabel: string;
  scope: StaffCalendarScope;
  team: StaffTeamFilter;
  staffFilter: string;
  staffMembers: StaffCalendarMember[];
  onScopeChange: (scope: StaffCalendarScope) => void;
  onTeamChange: (team: StaffTeamFilter) => void;
  onStaffFilterChange: (staffId: string) => void;
  onSchedule: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
};

const SCOPE_OPTIONS: { id: StaffCalendarScope; label: string }[] = [
  { id: "mine", label: "My schedule" },
  { id: "company", label: "Company" },
];

const TEAM_OPTIONS: { id: StaffTeamFilter; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "sales", label: "Sales" },
  { id: "ops", label: "Ops" },
];

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5"
      role="tablist"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors sm:px-3",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function StaffScheduleToolbar({
  periodLabel,
  scope,
  team,
  staffFilter,
  staffMembers,
  onScopeChange,
  onTeamChange,
  onStaffFilterChange,
  onSchedule,
  onPreviousWeek,
  onNextWeek,
  onToday,
}: StaffScheduleToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Button type="button" size="sm" onClick={onSchedule}>
            Schedule
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onToday}>
            Today
          </Button>
          <button
            type="button"
            onClick={onPreviousWeek}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[10rem] text-center text-sm font-semibold text-slate-900 sm:min-w-[12rem]">
            {periodLabel}
          </span>
          <button
            type="button"
            onClick={onNextWeek}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <SegmentedControl
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={onScopeChange}
        />
        {scope === "company" ? (
          <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
            <SegmentedControl options={TEAM_OPTIONS} value={team} onChange={onTeamChange} />
            <select
              value={staffFilter}
              onChange={(e) => onStaffFilterChange(e.target.value)}
              className="h-8 min-w-[9rem] rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              aria-label="Filter by team member"
            >
              <option value="all">All people</option>
              {staffMembers.map((member) => (
                <option key={member.staffId} value={member.staffId}>
                  {member.staffName}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
}
