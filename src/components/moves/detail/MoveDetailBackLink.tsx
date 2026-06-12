"use client";

import { MoveDetailActionsMenu } from "@/components/moves/detail/MoveDetailActionsMenu";
import { ROUTES } from "@/lib/navigation/routes";
import type { MoveRecord } from "@/lib/moves/types";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type MoveDetailBackLinkProps = {
  move: MoveRecord;
};

export function MoveDetailBackLink({ move }: MoveDetailBackLinkProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-2 lg:px-5">
      <Link
        href={ROUTES.salesMoves}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Moves
      </Link>
      <MoveDetailActionsMenu move={move} />
    </div>
  );
}
