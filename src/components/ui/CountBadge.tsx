import { cn } from "@/lib/utils";

type CountBadgeProps = {
  count: number;
  urgent?: boolean;
  /** Light backgrounds (follow-ups page). Default is dark sidebar. */
  variant?: "light" | "sidebar";
  className?: string;
};

export function CountBadge({
  count,
  urgent,
  variant = "light",
  className,
}: CountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
        variant === "sidebar"
          ? urgent
            ? "bg-amber-500 text-white"
            : "bg-brand-500 text-white"
          : urgent
            ? "bg-amber-500 text-white"
            : "bg-brand-600 text-white",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
