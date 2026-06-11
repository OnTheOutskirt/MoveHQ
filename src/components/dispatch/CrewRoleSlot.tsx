"use client";

import {
  DISPATCH_CREW_DRAG_TYPE,
  parseCrewDragPayload,
} from "@/components/dispatch/DispatchCrewPanel";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  crewFitsSlot,
  requiredRoleForSlot,
  type CrewSlotRef,
} from "@/lib/dispatch/crew-slots";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { useFleet } from "@/components/providers/FleetProvider";
import type { CrewRole } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";

type CrewRoleSlotProps = {
  label: string;
  slot: CrewSlotRef;
  crewId: string | null;
  onAssign: (crewId: string) => void;
  onClear: () => void;
  /** Compact chip for dispatch job cards — S/D/M only, horizontal row */
  compact?: boolean;
  /** Narrower chips for schedule job list — ~3 per row when empty */
  tight?: boolean;
  skipperAlsoDriver?: boolean;
  /** Names in separate driver slots — used when combining to S/D. */
  filledDriverNames?: string[];
  onToggleSkipperDriver?: () => void;
};

type SdToggleConfirm =
  | { mode: "split" }
  | { mode: "combine"; driverNames: string }
  | null;

function badgeClass(
  slot: CrewSlotRef,
  filled: boolean,
  skipperAlsoDriver?: boolean,
): string {
  if (slot.kind === "skipper" && skipperAlsoDriver) {
    return cn(
      "flex h-6 w-6 shrink-0 items-center justify-center rounded text-[9px] font-bold leading-none",
      filled
        ? "bg-gradient-to-br from-violet-600 from-45% to-sky-600 to-55% text-white shadow-sm"
        : "bg-gradient-to-br from-violet-100 from-45% to-sky-100 to-55% text-violet-800",
    );
  }
  return cn(
    "flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold",
    slot.kind === "skipper" && (filled ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-800"),
    slot.kind === "driver" && (filled ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-800"),
    slot.kind === "mover" && (filled ? "bg-slate-600 text-white" : "bg-slate-200 text-slate-700"),
  );
}

type RoleMismatchPrompt = {
  crewId: string;
  memberName: string;
  requiredRole: CrewRole;
};

export function CrewRoleSlot({
  label,
  slot,
  crewId,
  onAssign,
  onClear,
  compact,
  tight = false,
  skipperAlsoDriver,
  filledDriverNames = [],
  onToggleSkipperDriver,
}: CrewRoleSlotProps) {
  const { label: roleLabel, initial, formatRoles } = useTerminology();
  const [dragOver, setDragOver] = useState(false);
  const [roleMismatch, setRoleMismatch] = useState<RoleMismatchPrompt | null>(null);
  const [sdToggleConfirm, setSdToggleConfirm] = useState<SdToggleConfirm>(null);
  const { activeCrewForDispatch } = useFleet();
  const roster = activeCrewForDispatch();
  const member = crewId ? roster.find((c) => c.id === crewId) : undefined;
  const slotBadge =
    slot.kind === "skipper" && skipperAlsoDriver ? "S/D" : initial(slot.kind);
  const filled = Boolean(member);

  function tryAssign(id: string) {
    const candidate = roster.find((c) => c.id === id);
    if (!candidate) return;
    const required = requiredRoleForSlot(slot);
    if (required && !crewFitsSlot(candidate, slot)) {
      setRoleMismatch({
        crewId: id,
        memberName: candidate.name,
        requiredRole: required,
      });
      return;
    }
    onAssign(id);
  }

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const raw =
        e.dataTransfer.getData(DISPATCH_CREW_DRAG_TYPE) ||
        e.dataTransfer.getData("text/plain");
      const id = parseCrewDragPayload(raw);
      if (id) tryAssign(id);
    },
  };

  const mismatchMember = roleMismatch
    ? roster.find((c) => c.id === roleMismatch.crewId)
    : undefined;

  function handleSkipperDriverBadgeClick() {
    if (!onToggleSkipperDriver) return;
    if (skipperAlsoDriver) {
      if (filled) {
        setSdToggleConfirm({ mode: "split" });
      } else {
        onToggleSkipperDriver();
      }
      return;
    }
    if (filledDriverNames.length > 0) {
      setSdToggleConfirm({
        mode: "combine",
        driverNames: filledDriverNames.join(", "),
      });
      return;
    }
    onToggleSkipperDriver();
  }

  const confirmDialog = (
    <>
      {roleMismatch ? (
        <ConfirmDialog
          open
          onClose={() => setRoleMismatch(null)}
          onConfirm={() => {
            onAssign(roleMismatch.crewId);
            setRoleMismatch(null);
          }}
          title={`Assign as ${roleLabel(roleMismatch.requiredRole)}?`}
          description={
            mismatchMember
              ? `${roleMismatch.memberName} is listed as ${formatRoles(mismatchMember.roles)}, not ${roleLabel(roleMismatch.requiredRole).toLowerCase()}. Place them in the ${label} slot anyway?`
              : `This person may not be qualified for the ${label} slot. Assign anyway?`
          }
          confirmLabel="Assign anyway"
        />
      ) : null}
      {sdToggleConfirm?.mode === "split" ? (
        <ConfirmDialog
          open
          onClose={() => setSdToggleConfirm(null)}
          onConfirm={() => {
            onToggleSkipperDriver?.();
            setSdToggleConfirm(null);
          }}
          title="Split skipper and driver?"
          description={
            member
              ? `${member.name} is covering both skipper and driver. Split into separate S and D slots again?`
              : "Show separate skipper and driver slots again?"
          }
          confirmLabel="Split S & D"
        />
      ) : null}
      {sdToggleConfirm?.mode === "combine" ? (
        <ConfirmDialog
          open
          onClose={() => setSdToggleConfirm(null)}
          onConfirm={() => {
            onToggleSkipperDriver?.();
            setSdToggleConfirm(null);
          }}
          title="Combine skipper and driver?"
          description={`${sdToggleConfirm.driverNames} ${
            filledDriverNames.length > 1 ? "are" : "is"
          } assigned as driver. Combining to S/D will clear the separate driver slot${
            filledDriverNames.length > 1 ? "s" : ""
          }.`}
          confirmLabel="Combine S/D"
        />
      ) : null}
    </>
  );

  if (compact) {
    return (
      <>
      {confirmDialog}
      <div
        {...dropHandlers}
        title={member ? `${label}: ${member.name}` : `${label} — drop crew`}
        className={cn(
          "items-center gap-1 rounded-md border border-dashed py-0.5 pl-0.5 pr-1",
          tight
            ? filled
              ? "inline-flex w-auto max-w-full shrink-0"
              : "inline-flex min-w-0 max-w-[calc(33.333%-0.25rem)] shrink grow-0"
            : "inline-flex max-w-full",
          dragOver ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-slate-50/80",
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkipperDriverBadgeClick();
          }}
          className={badgeClass(slot, filled, skipperAlsoDriver)}
          title={
            onToggleSkipperDriver
              ? skipperAlsoDriver
                ? "Combined skipper/driver — click to split"
                : "Click to combine skipper & driver"
              : label
          }
        >
          {slotBadge}
        </button>
        <span
          className={cn(
            "px-0.5 leading-tight",
            tight
              ? filled
                ? "whitespace-nowrap text-[10px]"
                : "min-w-0 flex-1 truncate text-[10px]"
              : "min-w-[2.75rem] whitespace-nowrap text-[11px]",
            member ? "font-medium text-slate-900" : "text-slate-400",
          )}
        >
          {member ? member.name : "Drop"}
        </span>
        {member ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            aria-label={`Remove ${member.name} from ${label}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        ) : null}
      </div>
      </>
    );
  }

  return (
    <>
    {confirmDialog}
    <div
      {...dropHandlers}
      className={cn(
        "flex min-h-[2rem] items-center gap-2 rounded-lg border border-dashed px-2 py-1",
        dragOver ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-slate-50/80",
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          if (!onToggleSkipperDriver || slot.kind !== "skipper") return;
          e.stopPropagation();
          handleSkipperDriverBadgeClick();
        }}
        className={cn(
          badgeClass(slot, filled, skipperAlsoDriver),
          onToggleSkipperDriver && slot.kind === "skipper" ? "cursor-pointer" : "cursor-default",
        )}
        title={
          onToggleSkipperDriver && slot.kind === "skipper"
            ? skipperAlsoDriver
              ? "Combined skipper/driver — click to split"
              : "Click to combine skipper & driver"
            : label
        }
      >
        {slotBadge}
      </button>
      <span className="w-14 shrink-0 text-[10px] font-semibold text-slate-600">{label}</span>
      {member ? (
        <>
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-900">
            {member.name}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            aria-label={`Remove ${member.name}`}
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <span className="flex-1 text-[11px] text-slate-400">Drop crew</span>
      )}
    </div>
    </>
  );
}
