"use client";

import { MOVE_DETAIL_SECTION_SCROLL_MARGIN } from "@/lib/moves/detail-layout";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function MoveDetailSectionAnchor({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div id={id} className={cn(MOVE_DETAIL_SECTION_SCROLL_MARGIN, className)}>
      {children}
    </div>
  );
}
