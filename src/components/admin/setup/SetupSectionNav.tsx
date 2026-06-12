"use client";

import { cn } from "@/lib/utils";

export type SetupSectionNavItem = {
  id: string;
  label: string;
};

type SetupSectionNavProps = {
  items: readonly SetupSectionNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  title?: string;
};

export function SetupSectionNav({ items, activeId, onChange, title }: SetupSectionNavProps) {
  return (
    <nav aria-label={title ?? "Setup sections"} className="shrink-0 lg:w-52">
      {title ? (
        <p className="mb-2 hidden text-[10px] font-semibold uppercase tracking-wide text-slate-400 lg:block">
          {title}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1 lg:flex-col lg:gap-0.5">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-800 ring-1 ring-brand-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
