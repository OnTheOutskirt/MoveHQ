import { statusColors, type StatusKey } from "@/lib/tokens/status-colors";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: StatusKey;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusColors[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
