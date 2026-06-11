"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

type DispatchOffAccordionProps = {
  title: string;
  count: number;
  icon: LucideIcon;
  emptyMessage: string;
  children: ReactNode;
};

export function DispatchOffAccordion({
  title,
  count,
  icon: Icon,
  emptyMessage,
  children,
}: DispatchOffAccordionProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="mt-2.5 border-t border-slate-100 pt-2.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-2 rounded-md px-0.5 py-1 text-left transition-colors hover:bg-slate-50/80"
      >
        <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <Icon className="h-3 w-3 shrink-0" />
          {title}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium normal-case text-slate-500">
          <span className="tabular-nums">
            {count} off
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-slate-400 transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>
      {open ? (
        <div id={panelId} className="mt-1.5">
          {count === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-100 bg-slate-50/80 px-2 py-2 text-center text-[11px] text-slate-400">
              {emptyMessage}
            </p>
          ) : (
            children
          )}
        </div>
      ) : null}
    </div>
  );
}
