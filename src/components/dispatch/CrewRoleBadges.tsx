import { crewRoleBadgeClass } from "@/lib/dispatch/crew-display";
import { useTerminology } from "@/lib/terminology/use-terminology";
import type { CrewRole } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";

const ROLE_ORDER: CrewRole[] = ["skipper", "driver", "mover"];

type CrewRoleBadgesProps = {
  roles: CrewRole[];
  className?: string;
};

export function CrewRoleBadges({ roles, className }: CrewRoleBadgesProps) {
  const { initial, label } = useTerminology();
  const active = ROLE_ORDER.filter((r) => roles.includes(r));
  if (active.length === 0) return null;

  return (
    <span className={cn("inline-flex shrink-0 items-center gap-0.5", className)}>
      {active.map((role) => (
        <span
          key={role}
          className={cn(
            "rounded px-1 py-px text-[9px] font-bold leading-none",
            crewRoleBadgeClass(role),
          )}
          title={label(role)}
        >
          {initial(role)}
        </span>
      ))}
    </span>
  );
}
