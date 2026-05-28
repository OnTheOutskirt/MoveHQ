import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";

/** Directory sidebar related-move color: open (default), completed (green), lost (red). */
export type DirectoryMoveCoat = "open" | "completed" | "lost";

export function directoryMoveCoat(move: MoveRecord): DirectoryMoveCoat {
  if (isMoveLost(move) || move.conditionStatus === "cancelled") return "lost";
  if (move.pipelineStage === "completed" || move.conditionStatus === "closed") {
    return "completed";
  }
  return "open";
}

export const DIRECTORY_MOVE_COAT_STYLES: Record<
  DirectoryMoveCoat,
  { link: string; title: string; subtitle: string }
> = {
  open: {
    link: "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40",
    title: "text-slate-900",
    subtitle: "text-slate-500",
  },
  completed: {
    link: "border-emerald-200 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-50",
    title: "text-emerald-950",
    subtitle: "text-emerald-800/85",
  },
  lost: {
    link: "border-red-200 bg-red-50/70 hover:border-red-300 hover:bg-red-50",
    title: "text-red-950",
    subtitle: "text-red-800/85",
  },
};
