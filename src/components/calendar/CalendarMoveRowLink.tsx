"use client";

import { calendarMoveDetailHref } from "@/lib/calendar/resolve-move-link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type CalendarMoveRowLinkProps = {
  label: string;
  moveId?: string;
  children: ReactNode;
  className?: string;
  /** When true, the whole row receives click (for table rows). */
  asRow?: boolean;
};

export function CalendarMoveRowLink({
  label,
  moveId,
  children,
  className,
  asRow,
}: CalendarMoveRowLinkProps) {
  const router = useRouter();
  const moveHref = calendarMoveDetailHref(label, moveId);

  if (!moveHref) {
    if (asRow) {
      return (
        <tr className={cn("border-b last:border-0", className)}>{children}</tr>
      );
    }
    return <>{children}</>;
  }

  const href = moveHref;

  if (asRow) {
    return (
      <tr
        role="link"
        tabIndex={0}
        onClick={() => router.push(href)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(href);
          }
        }}
        className={cn(
          "cursor-pointer border-b last:border-0 hover:bg-brand-50/60",
          className,
        )}
      >
        {children}
      </tr>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={cn(
        "w-full text-left transition-colors hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
        className,
      )}
    >
      {children}
    </button>
  );
}
