"use client";

import { CrewRoleBadges } from "@/components/dispatch/CrewRoleBadges";
import { DispatchOffAccordion } from "@/components/dispatch/DispatchOffAccordion";
import { DispatchResourceTooltip } from "@/components/dispatch/DispatchResourceTooltip";
import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { resolveCrewOffDisplay, type CrewOffReason } from "@/lib/dispatch/resolve-crew-off";
import { useFleet } from "@/components/providers/FleetProvider";
import { formatHoursShort } from "@/lib/payroll/time-entry-utils";
import { useCrewWeeklyHours } from "@/lib/payroll/use-crew-weekly-hours";
import type { DispatchCrewMember } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";
import { GripVertical, UserX, Users } from "lucide-react";

const DRAG_TYPE = "application/x-dispatch-crew";

export function crewDragPayload(crewId: string): string {
  return JSON.stringify({ crewId });
}

export function parseCrewDragPayload(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as { crewId?: string };
    return parsed.crewId ?? null;
  } catch {
    return null;
  }
}

type DispatchCrewPanelProps = {
  /** Inside dispatch scroll column — hides duplicate section title */
  embedded?: boolean;
};

export function DispatchCrewPanel({ embedded }: DispatchCrewPanelProps = {}) {
  const { dateKey, crewOffIds, crewOff, assignedCrewIds } = useDispatch();
  const { activeCrewForDispatch, crew: fleetCrew, timeOffRequests } = useFleet();
  const roster = activeCrewForDispatch();
  const weeklyHoursByCrewId = useCrewWeeklyHours(dateKey);

  const offDisplays = resolveCrewOffDisplay(crewOff, crewOffIds, roster, {
    dateKey,
    timeOffRequests,
    fleetCrew,
  });
  const offRosterIds = new Set(
    offDisplays.filter((d) => d.kind === "roster").map((d) => d.member.id),
  );

  const available: DispatchCrewMember[] = [];
  for (const member of roster) {
    if (offRosterIds.has(member.id)) continue;
    if (assignedCrewIds.has(member.id)) continue;
    available.push(member);
  }

  return (
    <div>
      <h2 className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <Users className="h-3.5 w-3.5 shrink-0" />
          Crew
        </span>
        <span className="shrink-0 text-[10px] font-medium normal-case tabular-nums text-slate-500">
          {available.length} available
        </span>
      </h2>
      <ul className="space-y-1">
        {available.map((member) => (
          <CrewChip
            key={member.id}
            name={member.name}
            roles={member.roles}
            weekHours={weeklyHoursByCrewId.get(member.id) ?? 0}
            draggable
            onDragStart={(id) => crewDragPayload(id)}
            dragId={member.id}
          />
        ))}
        {available.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-center text-xs text-slate-400">
            No crew available
          </li>
        ) : null}
      </ul>

      <DispatchOffAccordion
        title="Crew off"
        count={offDisplays.length}
        icon={UserX}
        emptyMessage="No crew off this day"
      >
        <ul className="space-y-1">
          {offDisplays.map((entry) =>
            entry.kind === "roster" ? (
              <CrewChip
                key={entry.member.id}
                name={entry.member.name}
                roles={entry.member.roles}
                weekHours={weeklyHoursByCrewId.get(entry.member.id) ?? 0}
                off
                offReason={entry.offReason}
                onDragStart={(id) => crewDragPayload(id)}
                dragId={entry.member.id}
              />
            ) : (
              <CrewChip
                key={entry.id}
                name={entry.name}
                roles={entry.roles}
                off
                offLabel={entry.calendarRole}
                offReason={entry.offReason}
                dragId={entry.id}
              />
            ),
          )}
        </ul>
      </DispatchOffAccordion>
    </div>
  );
}

function CrewChip({
  name,
  roles,
  weekHours,
  off,
  offLabel,
  offReason,
  draggable: canDrag,
  dragId,
  onDragStart,
}: {
  name: string;
  roles: DispatchCrewMember["roles"];
  weekHours?: number;
  off?: boolean;
  offLabel?: string;
  offReason?: CrewOffReason;
  draggable?: boolean;
  dragId: string;
  onDragStart?: (id: string) => string;
}) {
  const dragEnabled = Boolean(onDragStart) && (canDrag !== false);
  const chip = (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-left transition-colors",
        off
          ? dragEnabled
            ? "cursor-grab border-slate-200 bg-slate-50 active:cursor-grabbing hover:border-amber-300"
            : "border-slate-200 bg-slate-50"
          : "cursor-grab border-slate-200 bg-white shadow-sm active:cursor-grabbing hover:border-brand-200",
      )}
    >
      {dragEnabled ? (
        <GripVertical className="h-3 w-3 shrink-0 text-slate-300" aria-hidden />
      ) : (
        <span className="w-3 shrink-0" />
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs font-medium",
          off ? "text-slate-500" : "text-slate-900",
        )}
      >
        {name}
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-1">
        {weekHours != null ? (
          <span
            className={cn(
              "min-w-[1.75rem] text-right text-[10px] font-medium tabular-nums",
              off ? "text-slate-400" : "text-slate-500",
            )}
            title="Hours this week"
          >
            {weekHours > 0 ? `${formatHoursShort(weekHours)}h` : "0h"}
          </span>
        ) : null}
        <CrewRoleBadges roles={roles} />
      </span>
      {off ? (
        <span className="shrink-0 text-[9px] font-medium text-slate-400">
          {offLabel ?? "Off"}
        </span>
      ) : null}
    </div>
  );

  return (
    <li
      draggable={dragEnabled}
      onDragStart={(e) => {
        if (!dragEnabled || !onDragStart) return;
        e.dataTransfer.setData(DRAG_TYPE, onDragStart(dragId));
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      {off && offReason ? (
        <DispatchResourceTooltip label={offReason.label} detail={offReason.detail}>
          {chip}
        </DispatchResourceTooltip>
      ) : (
        chip
      )}
    </li>
  );
}

export { DRAG_TYPE as DISPATCH_CREW_DRAG_TYPE };
