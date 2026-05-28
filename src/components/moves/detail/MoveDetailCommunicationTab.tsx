"use client";

import { MoveDetailPeopleTab } from "@/components/moves/detail/MoveDetailPeopleTab";
import { DetailSection } from "@/components/moves/detail/DetailSection";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailCommunicationTabProps = {
  move: MoveRecord;
};

export function MoveDetailCommunicationTab({ move }: MoveDetailCommunicationTabProps) {
  return (
    <div className="space-y-6">
      <DetailSection
        title="Contacts on this move"
        description="Customer and everyone else involved — care-of, realtor, facility"
      >
        <MoveDetailPeopleTab move={move} />
      </DetailSection>

      <DetailSection title="Message threads">
        <div className="grid gap-3 sm:grid-cols-3">
          {["SMS", "Email", "Calls"].map((channel) => (
            <div
              key={channel}
              className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500"
            >
              {channel} — use quick actions in the sidebar
            </div>
          ))}
        </div>
      </DetailSection>
    </div>
  );
}
