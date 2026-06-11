"use client";

import { MoveDetailActivityTab } from "@/components/moves/detail/MoveDetailActivityTab";
import { MoveDetailEquipmentSuppliesTab } from "@/components/moves/detail/MoveDetailEquipmentSuppliesTab";
import { MoveDetailMovePlanTab } from "@/components/moves/detail/MoveDetailMovePlanTab";
import { MoveDetailOperationsTab } from "@/components/moves/detail/MoveDetailOperationsTab";
import { MoveDetailPaymentTab } from "@/components/moves/detail/MoveDetailPaymentTab";
import { MoveDetailProfitabilityTab } from "@/components/moves/detail/MoveDetailProfitabilityTab";
import { MoveDetailQuoteContractTab } from "@/components/moves/detail/MoveDetailQuoteContractTab";
import { TabBar } from "@/components/shared/TabBar";
import {
  MOVE_DETAIL_MAIN_TABS,
  MOVE_DETAIL_STICKY_TABS_TOP,
  type MoveDetailMainTabId,
} from "@/lib/moves/detail-layout";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type MoveDetailMainProps = {
  move: MoveRecord;
  activeTab?: MoveDetailMainTabId;
  onTabChange?: (tab: MoveDetailMainTabId) => void;
};

export function MoveDetailMain({ move, activeTab, onTabChange }: MoveDetailMainProps) {
  const [internalTab, setInternalTab] = useState<MoveDetailMainTabId>("move-plan");
  const tab = activeTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  const tabs = useMemo(() => {
    return MOVE_DETAIL_MAIN_TABS.map((t) => {
      let label: string = t.label;
      if (t.id === "move-plan" && move.intake.manualReviewRequired) {
        label = `${t.label} !`;
      }
      return { id: t.id, label };
    });
  }, [move]);

  return (
    <div className="min-w-0 border-t border-slate-200">
      <div
        id="move-detail-tabs"
        className={cn(
          "sticky z-50 w-full min-w-0 border-b border-slate-200 bg-white shadow-sm",
          MOVE_DETAIL_STICKY_TABS_TOP,
        )}
      >
        <div className="overflow-x-auto px-4 lg:px-5">
          <TabBar tabs={tabs} activeTab={tab} onChange={setTab} />
        </div>
      </div>

      <div className="min-w-0 bg-slate-50/50 px-4 py-4 lg:px-5 lg:py-5">
        {tab === "move-plan" && <MoveDetailMovePlanTab move={move} />}
        {tab === "equipment-supplies" && <MoveDetailEquipmentSuppliesTab move={move} />}
        {tab === "quote-contract" && <MoveDetailQuoteContractTab move={move} />}
        {tab === "payment" && <MoveDetailPaymentTab move={move} />}
        {tab === "operations" && <MoveDetailOperationsTab move={move} />}
        {tab === "profitability" && <MoveDetailProfitabilityTab move={move} />}
        {tab === "activity" && <MoveDetailActivityTab move={move} />}
      </div>
    </div>
  );
}
