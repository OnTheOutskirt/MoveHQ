"use client";

import type { CrewAppRole } from "@/lib/crew-app/types";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";

const ROLES: CrewAppRole[] = ["skipper", "driver", "mover"];

type CrewRoleSwitcherProps = {
  role: CrewAppRole;
  onRoleChange: (role: CrewAppRole) => void;
  variant?: "light" | "dark";
  label?: string;
  className?: string;
};

/** Admin preview only — not shown inside the crew PWA. */
export function CrewRoleSwitcher({
  role,
  onRoleChange,
  variant = "light",
  label = "Preview role",
  className,
}: CrewRoleSwitcherProps) {
  const { label: roleLabel } = useTerminology();

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
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRoleChange(r)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              role === r
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
        ))}
      </div>
    </div>
  );
}
