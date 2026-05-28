"use client";

import {
  DIRECTORY_MOVE_COAT_STYLES,
  directoryMoveCoat,
} from "@/lib/people/directory-move-coat";
import { formatMoveDate } from "@/lib/moves/format";
import { moveStageDisplayLabel } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";

type DirectoryRelatedMovesProps = {
  moves: MoveRecord[];
  /** Include customer name in subtitle (person sidebar). */
  showCustomerName?: boolean;
};

export function DirectoryRelatedMoves({ moves, showCustomerName }: DirectoryRelatedMovesProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Related moves ({moves.length})
      </p>
      <ul className="mt-2 space-y-2">
        {moves.length === 0 ? (
          <li className="text-sm text-slate-500">No linked moves yet.</li>
        ) : (
          moves.map((move) => {
            const coat = directoryMoveCoat(move);
            const styles = DIRECTORY_MOVE_COAT_STYLES[coat];
            return (
              <li key={move.id}>
                <Link
                  href={salesMovePath(move.id)}
                  className={cn(
                    "block rounded-lg border px-3 py-2 text-sm transition-colors",
                    styles.link,
                  )}
                >
                  <p className={cn("font-medium", styles.title)}>{move.reference}</p>
                  <p className={cn("text-xs", styles.subtitle)}>
                    {showCustomerName ? (
                      <>
                        {move.customerName} · {moveStageDisplayLabel(move)} ·{" "}
                        {formatMoveDate(move.preferredDate)}
                      </>
                    ) : (
                      <>
                        {moveStageDisplayLabel(move)} · {formatMoveDate(move.preferredDate)}
                      </>
                    )}
                  </p>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
