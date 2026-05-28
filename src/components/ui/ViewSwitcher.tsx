"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type ViewSwitcherOption<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

type ViewSwitcherProps<T extends string> = {
  options: readonly ViewSwitcherOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
};

export function ViewSwitcher<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "View",
  className,
}: ViewSwitcherProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5",
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
            {label}
          </button>
        );
      })}
    </div>
  );
}
