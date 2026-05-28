"use client";

import { QuickActionHistoryFeed } from "@/components/moves/detail/quick-actions/QuickActionHistoryFeed";
import { getCommunicationHistory } from "@/lib/moves/communication-history";
import type { HistoryQuickActionId } from "@/lib/moves/quick-actions";
import type { MoveRecord } from "@/lib/moves/types";

type MoveQuickActionHistoryProps = {
  move: MoveRecord;
  action: HistoryQuickActionId;
};

/** @deprecated Use QuickActionHistoryFeed inside MoveQuickActionSidebar */
export function MoveQuickActionHistory({ move, action }: MoveQuickActionHistoryProps) {
  const items = getCommunicationHistory(move, action);
  return (
    <section className="border-t border-slate-200 pt-5">
      <QuickActionHistoryFeed action={action} items={items} />
    </section>
  );
}
