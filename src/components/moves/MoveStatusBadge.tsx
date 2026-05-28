import { moveStatusConfig } from "@/lib/moves/status";
import type { MoveStatus } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

type MoveStatusBadgeProps = {
  status: MoveStatus;
  className?: string;
};

export function MoveStatusBadge({ status, className }: MoveStatusBadgeProps) {
  const config = moveStatusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        config.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
