"use client";

import { MoveDetailContent } from "@/components/moves/shared/MoveDetailContent";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailSidebarProps = {
  move: MoveRecord | null;
  open: boolean;
  onClose: () => void;
};

export function MoveDetailSidebar({ move, open, onClose }: MoveDetailSidebarProps) {
  if (!move) return null;

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={move.customerName}
      description={`${move.reference} · ${move.moveType}`}
      widthClassName="max-w-lg"
    >
      <MoveDetailContent move={move} />
    </DetailSidebar>
  );
}
