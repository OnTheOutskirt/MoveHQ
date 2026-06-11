"use client";

import type { MoveDetailSectionItem } from "@/lib/moves/move-detail-sections";
import { cn } from "@/lib/utils";

type MoveDetailSectionNavProps = {
  sections: readonly MoveDetailSectionItem[];
  activeId: string | null;
  ariaLabel: string;
  onNavigate: (sectionId: string) => void;
};

export function MoveDetailSectionNav({
  sections,
  activeId,
  ariaLabel,
  onNavigate,
}: MoveDetailSectionNavProps) {
  return (
    <nav aria-label={ariaLabel} className="min-w-0">
      <div className="rounded-xl border border-slate-200/90 bg-white p-1 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {sections.map((item) => {
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-1.5 text-[10px] text-slate-400">Jump to section on this tab</p>
    </nav>
  );
}
