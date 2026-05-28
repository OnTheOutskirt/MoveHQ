"use client";

import { MoveJobDayTimeline } from "@/components/moves/detail/MoveJobDayTimeline";
import { MovePlanSummaryPanel } from "@/components/moves/detail/workspace/MovePlanSummaryPanel";
import { MoveScheduleStrip } from "@/components/moves/detail/workspace/MoveScheduleStrip";
import { NextActionBanner } from "@/components/moves/detail/workspace/NextActionBanner";
import {
  getPrimaryWorkspaceMode,
  primaryWorkspaceTitle,
  type PrimaryWorkspaceMode,
} from "@/lib/moves/move-pipeline";
import { getMoveOperationalSummary } from "@/lib/moves/move-operational";
import { getProposalStatusRows } from "@/lib/moves/move-workspace";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type MoveDetailPrimaryWorkspaceProps = {
  move: MoveRecord;
  onNavigateTab?: (tab: string) => void;
};

function PrimaryPanelShell({
  title,
  subtitle,
  children,
  accent = "brand",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accent?: "brand" | "sky" | "emerald" | "slate";
}) {
  const border = {
    brand: "border-l-brand-600",
    sky: "border-l-sky-600",
    emerald: "border-l-emerald-600",
    slate: "border-l-slate-600",
  }[accent];

  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white shadow-sm",
        "border-l-4",
        border,
      )}
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function QuotePrimary({ move }: { move: MoveRecord }) {
  const rows = getProposalStatusRows(move);
  const ops = getMoveOperationalSummary(move);

  return (
    <PrimaryPanelShell
      title="Proposal status"
      subtitle="Quote, follow-up, deposit, and pricing at a glance"
      accent="brand"
    >
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3 last:border-0 last:pb-0"
          >
            <span className="text-sm text-slate-600">{row.label}</span>
            <span
              className={cn(
                "text-right text-sm font-medium",
                row.status === "warn"
                  ? "text-amber-800"
                  : row.status === "pending"
                    ? "text-slate-500"
                    : "text-slate-900",
              )}
            >
              {row.value}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg bg-brand-50/80 px-3 py-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-800">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          AI recommendation
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{ops.aiQuoteRecommendation}</p>
        {ops.costDrivers.length > 0 ? (
          <p className="mt-2 text-xs text-slate-600">
            Cost drivers: {ops.costDrivers.join(" · ")}
          </p>
        ) : null}
      </div>
    </PrimaryPanelShell>
  );
}

function SchedulePrimary({ move, onNavigateTab }: { move: MoveRecord; onNavigateTab?: (t: string) => void }) {
  const ops = getMoveOperationalSummary(move);

  return (
    <PrimaryPanelShell
      title="Scheduling workspace"
      subtitle="Assign crews, confirm job days, and lock the operational plan"
      accent="sky"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-500">Date range</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{ops.dateRangeLabel}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-500">Crew / trucks</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{ops.crewNeeded}</p>
        </div>
      </div>
      <div className="mt-4">
        <MoveScheduleStrip move={move} onOpenSchedule={() => onNavigateTab?.("move-plan")} />
      </div>
      {move.jobDays.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Job days detail</p>
          <MoveJobDayTimeline move={move} />
        </div>
      ) : null}
    </PrimaryPanelShell>
  );
}

function DispatchPrimary({ move }: { move: MoveRecord }) {
  return (
    <PrimaryPanelShell
      title="Dispatch timeline"
      subtitle="Live operational state — crews, trucks, access, and day notes"
      accent="emerald"
    >
      <MoveJobDayTimeline move={move} />
    </PrimaryPanelShell>
  );
}

function PostPrimary({ move, onNavigateTab }: { move: MoveRecord; onNavigateTab?: (t: string) => void }) {
  const ops = getMoveOperationalSummary(move);

  return (
    <PrimaryPanelShell
      title="Profitability & post-move"
      subtitle="Financial close-out, claims, and customer follow-through"
      accent="slate"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Revenue</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{ops.estimatedRevenue}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Hours</p>
          <p className="mt-1 text-xl font-semibold">{ops.estimatedHours}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Balance</p>
          <p className="mt-1 text-xl font-semibold">{ops.outstandingBalance}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavigateTab?.("profitability")}
          className="rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium hover:border-brand-300 hover:bg-brand-50"
        >
          Open profitability →
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab?.("operations")}
          className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-left text-sm text-slate-600"
        >
          Operations & claims →
        </button>
      </div>
    </PrimaryPanelShell>
  );
}

function PrimaryByMode({
  mode,
  move,
  onNavigateTab,
}: {
  mode: PrimaryWorkspaceMode;
  move: MoveRecord;
  onNavigateTab?: (tab: string) => void;
}) {
  switch (mode) {
    case "quote":
      return <QuotePrimary move={move} />;
    case "schedule":
      return <SchedulePrimary move={move} onNavigateTab={onNavigateTab} />;
    case "dispatch":
      return <DispatchPrimary move={move} />;
    case "post":
      return <PostPrimary move={move} onNavigateTab={onNavigateTab} />;
  }
}

export function MoveDetailPrimaryWorkspace({
  move,
  onNavigateTab,
}: MoveDetailPrimaryWorkspaceProps) {
  const mode = getPrimaryWorkspaceMode(move);
  const title = primaryWorkspaceTitle(mode);
  const showPlanBelow = mode === "quote" || mode === "schedule" || mode === "dispatch";
  const showScheduleStrip =
    move.pipelineStage === "quote_sent" ||
    move.pipelineStage === "needs_contract" ||
    (move.pipelineStage === "waiting" &&
      (move.waitingSubstage === "needs_info" || move.waitingSubstage === "walkthrough_scheduled"));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <NextActionBanner move={move} />
      <div className="space-y-6 px-4 py-5 lg:px-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

        <PrimaryByMode mode={mode} move={move} onNavigateTab={onNavigateTab} />

        {showPlanBelow ? (
          <MovePlanSummaryPanel
            move={move}
            onOpenPlan={() => onNavigateTab?.("move-plan")}
          />
        ) : null}

        {showScheduleStrip ? (
          <MoveScheduleStrip
            move={move}
            onOpenSchedule={() => onNavigateTab?.("move-plan")}
          />
        ) : null}

        {mode === "dispatch" ? (
          <MovePlanSummaryPanel
            move={move}
            compact
            onOpenPlan={() => onNavigateTab?.("move-plan")}
          />
        ) : null}
      </div>
    </div>
  );
}
