"use client";

import { CrewRoleBadges } from "@/components/dispatch/CrewRoleBadges";
import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { resolveCrewOffDisplay } from "@/lib/dispatch/resolve-crew-off";
import { useFleet } from "@/components/providers/FleetProvider";
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
  const { crewOffIds, crewOff, assignedCrewIds } = useDispatch();
  const { activeCrewForDispatch } = useFleet();
  const roster = activeCrewForDispatch();

  const offDisplays = resolveCrewOffDisplay(crewOff, crewOffIds, roster);
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

      <div className="mt-2.5 border-t border-slate-100 pt-2.5">
        <h3 className="mb-1.5 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <span className="flex items-center gap-1.5">
            <UserX className="h-3 w-3 shrink-0" />
            Crew off
          </span>
          <span className="font-medium normal-case tabular-nums text-slate-500">
            {offDisplays.length}
          </span>
        </h3>
        <ul className="mt-1.5 space-y-1">
          {offDisplays.map((entry) =>
            entry.kind === "roster" ? (
              <CrewChip
                key={entry.member.id}
                name={entry.member.name}
                roles={entry.member.roles}
                off
                dragId={entry.member.id}
              />
            ) : (
              <CrewChip
                key={entry.id}
                name={entry.name}
                roles={entry.roles}
                off
                offLabel={entry.calendarRole}
                dragId={entry.id}
              />
            ),
          )}
          {offDisplays.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-100 bg-slate-50/80 px-2 py-2 text-center text-[11px] text-slate-400">
              No crew off this day
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

function CrewChip({
  name,
  roles,
  off,
  offLabel,
  draggable: canDrag,
  dragId,
  onDragStart,
}: {
  name: string;
  roles: DispatchCrewMember["roles"];
  off?: boolean;
  offLabel?: string;
  draggable?: boolean;
  dragId: string;
  onDragStart?: (id: string) => string;
}) {
  return (
    <li
      draggable={canDrag && !off}
      onDragStart={(e) => {
        if (!canDrag || off || !onDragStart) return;
        e.dataTransfer.setData(DRAG_TYPE, onDragStart(dragId));
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-left transition-colors",
        off
          ? "border-slate-200 bg-slate-50"
          : "cursor-grab border-slate-200 bg-white shadow-sm active:cursor-grabbing hover:border-brand-200",
      )}
    >
      {canDrag && !off ? (
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
      <CrewRoleBadges roles={roles} />
      {off ? (
        <span className="shrink-0 text-[9px] font-medium text-slate-400">
          {offLabel ?? "Off"}
        </span>
      ) : null}
    </li>
  );
}

export { DRAG_TYPE as DISPATCH_CREW_DRAG_TYPE };
