"use client";

import { MoveDetailSectionNav } from "@/components/moves/detail/MoveDetailSectionNav";
import {
  scrollToMoveDetailSection,
  useMoveDetailScrollRoot,
  useSectionScrollSpy,
} from "@/components/moves/detail/MoveDetailScrollContext";
import { MOVE_DETAIL_STICKY_SCOPE_TOP } from "@/lib/moves/detail-layout";
import type { MoveDetailSectionItem } from "@/lib/moves/move-detail-sections";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";

type MoveDetailTabSectionsProps = {
  sections: readonly MoveDetailSectionItem[];
  ariaLabel: string;
  children: ReactNode;
};

export function MoveDetailTabSections({
  sections,
  ariaLabel,
  children,
}: MoveDetailTabSectionsProps) {
  const scrollRoot = useMoveDetailScrollRoot();
  const sectionIds = sections.map((s) => s.id);
  const spyActiveId = useSectionScrollSpy(sectionIds, scrollRoot);
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);

  useEffect(() => {
    if (spyActiveId) setActiveId(spyActiveId);
  }, [spyActiveId]);

  function handleNavigate(sectionId: string) {
    setActiveId(sectionId);
    scrollToMoveDetailSection(sectionId, scrollRoot);
  }

  return (
    <div className="min-w-0 space-y-6">
      <div
        className={cn(
          "sticky z-20 -mx-4 min-w-0 bg-slate-50/95 px-4 pb-1 backdrop-blur-sm lg:-mx-5 lg:px-5",
          MOVE_DETAIL_STICKY_SCOPE_TOP,
        )}
      >
        <MoveDetailSectionNav
          sections={sections}
          activeId={activeId}
          ariaLabel={ariaLabel}
          onNavigate={handleNavigate}
        />
      </div>
      {children}
    </div>
  );
}
