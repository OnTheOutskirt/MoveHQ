"use client";

import { CREW_ROLES, type CrewRole } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";

const LABELS: Record<CrewRole, string> = {
  skipper: "Skipper",
  driver: "Driver",
  mover: "Mover",
};

type CrewRolePickerProps = {
  value: CrewRole[];
  onChange: (roles: CrewRole[]) => void;
  compact?: boolean;
};

export function CrewRolePicker({ value, onChange, compact }: CrewRolePickerProps) {
  function toggle(role: CrewRole) {
    if (value.includes(role)) {
      const next = value.filter((r) => r !== role);
      onChange(next.length ? next : ["mover"]);
    } else {
      onChange([...value, role]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {CREW_ROLES.map((role) => {
        const selected = value.includes(role);
        return (
          <button
            key={role}
            type="button"
            onClick={() => toggle(role)}
            className={cn(
              "rounded-lg border font-medium transition-colors",
              compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
              selected
                ? role === "skipper"
                  ? "border-violet-500 bg-violet-50 text-violet-800"
                  : role === "driver"
                    ? "border-sky-500 bg-sky-50 text-sky-800"
                    : "border-slate-500 bg-slate-100 text-slate-800"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            {LABELS[role]}
          </button>
        );
      })}
    </div>
  );
}
