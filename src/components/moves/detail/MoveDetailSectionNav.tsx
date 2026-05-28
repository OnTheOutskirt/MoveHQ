"use client";

import {
  scrollToMoveDetailSection,
  useMoveDetailScrollRoot,
} from "@/components/moves/detail/MoveDetailScrollContext";
import type { MoveDetailSectionItem } from "@/lib/moves/move-detail-sections";
import { cn } from "@/lib/utils";

type MoveDetailSectionNavProps = {
  sections: readonly MoveDetailSectionItem[];
  activeId: string | null;
  ariaLabel: string;
};

export function MoveDetailSectionNav({
  sections,
  activeId,
  ariaLabel,
}: MoveDetailSectionNavProps) {
  const scrollRoot = useMoveDetailScrollRoot();

  return (
    <nav aria-label={ariaLabel} className="min-w-0">
      <div className="-mb-px flex gap-0 overflow-x-auto border-b border-slate-200 scrollbar-none">
        {sections.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToMoveDetailSection(item.id, scrollRoot)}
              className={cn(
                "relative shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-brand-600 text-brand-800"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800",
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
