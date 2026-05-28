"use client";

import { getMoveHealth, getOperationsSnapshot } from "@/lib/moves/move-workspace";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

type OperationsSnapshotBarProps = {
  move: MoveRecord;
  className?: string;
};

function SnapshotRow({
  label,
  value,
  sub,
  urgent,
}: {
  label: string;
  value: string;
  sub?: string;
  urgent?: boolean;
}) {
  return (
    <div className="min-w-[6rem]">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-0.5 text-sm font-medium", urgent ? "text-amber-800" : "text-slate-900")}>
        {value}
      </p>
      {sub ? <p className="text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}

const HEALTH_STYLES = {
  on_track: "bg-emerald-100 text-emerald-800",
  attention: "bg-amber-100 text-amber-900",
  problem: "bg-red-100 text-red-800",
} as const;

export function OperationsSnapshotBar({ move, className }: OperationsSnapshotBarProps) {
  const snap = getOperationsSnapshot(move);
  const { health } = getMoveHealth(move);

  if (health === "on_track" && move.pipelineStage === "completed") {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Status
        </p>
        {health !== "on_track" ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
              HEALTH_STYLES[health],
            )}
          >
            {health === "problem" ? "Needs attention" : "Attention"}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <SnapshotRow label="Proposal" value={snap.proposalStatus} sub={snap.proposalDetail} />
        <SnapshotRow label="Deposit" value={snap.depositStatus} />
        <SnapshotRow label="Job days" value={snap.scheduleStatus} />
      </div>
    </div>
  );
}
