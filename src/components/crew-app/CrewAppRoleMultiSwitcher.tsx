"use client";

import type { CrewAppRole } from "@/lib/crew-app/types";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";

const ROLES: CrewAppRole[] = ["skipper", "driver", "mover"];

type CrewAppRoleMultiSwitcherProps = {
  roles: CrewAppRole[];
  onRolesChange: (roles: CrewAppRole[]) => void;
  variant?: "light" | "dark";
  label?: string;
  className?: string;
};

/** Admin preview — toggle multiple profile roles (e.g. skipper + driver stats). */
export function CrewAppRoleMultiSwitcher({
  roles,
  onRolesChange,
  variant = "light",
  label = "Preview roles for app",
  className,
}: CrewAppRoleMultiSwitcherProps) {
  const { label: roleLabel } = useTerminology();

  function toggle(next: CrewAppRole) {
    if (roles.includes(next)) {
      if (roles.length === 1) return;
      onRolesChange(roles.filter((r) => r !== next));
      return;
    }
    onRolesChange([...roles, next].sort((a, b) => ROLES.indexOf(a) - ROLES.indexOf(b)));
  }

  return (
    <div className={className}>
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wide",
          variant === "dark" ? "text-white/70" : "text-slate-500",
        )}
      >
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {ROLES.map((r) => {
          const active = roles.includes(r);
          return (
            <button
              key={r}
              type="button"
              onClick={() => toggle(r)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                active
                  ? variant === "dark"
                    ? "border-white/30 bg-white/20 text-white"
                    : "border-brand-600 bg-brand-50 text-brand-900"
                  : variant === "dark"
                    ? "border-white/20 text-white/80 hover:border-white/30 hover:bg-white/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              {roleLabel(r)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
