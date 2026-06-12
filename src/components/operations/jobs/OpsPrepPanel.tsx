"use client";

import { OpsPrepAddSidebar } from "@/components/operations/jobs/OpsPrepAddSidebar";
import { useManualOpsPrepTasks } from "@/components/operations/jobs/use-manual-ops-prep";
import { useOpsPrepDoneIds } from "@/components/operations/jobs/use-ops-prep-done";
import { Button } from "@/components/ui/Button";
import { formatMoveDate } from "@/lib/moves/format";
import { toDateKey } from "@/lib/calendar/date-utils";
import {
  manualOpsPrepTaskIdFromOpsId,
  removeManualOpsPrepTask,
} from "@/lib/operations/ops-prep-custom-storage";
import { MANUAL_OPS_PREP_NO_MOVE_LABEL } from "@/lib/operations/ops-prep-manual";
import {
  doneOpsPrepTasks,
  mergeOpsPrepTasks,
  OPS_PREP_CATEGORY_LABELS,
  openOpsPrepTasks,
  type OpsPrepCategory,
  type OpsPrepTask,
} from "@/lib/operations/ops-prep-tasks";
import { catalogVendorTypeLabel } from "@/lib/settings/field-catalog-runtime";
import {
  readOpsPrepActualCost,
  readOpsPrepCompletion,
  setOpsPrepTaskDone,
} from "@/lib/operations/ops-prep-storage";
import { salesMovePath } from "@/lib/navigation/routes";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import {
  BedDouble,
  Building2,
  CheckCircle2,
  Circle,
  Package,
  Plus,
  Route,
  Trash2,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const CATEGORY_ICON: Record<OpsPrepCategory, typeof Package> = {
  lodging: BedDouble,
  vendor: Building2,
  materials: Package,
  logistics: Truck,
  coordination: Route,
};

type OpsPrepPanelProps = {
  derivedTasks: OpsPrepTask[];
  moves: MoveRecord[];
};

type PrepTab = "open" | "done";

export function OpsPrepPanel({ derivedTasks, moves }: OpsPrepPanelProps) {
  const doneIds = useOpsPrepDoneIds();
  const manualTasks = useManualOpsPrepTasks();
  const tasks = useMemo(
    () => mergeOpsPrepTasks(derivedTasks, manualTasks),
    [derivedTasks, manualTasks],
  );
  const [tab, setTab] = useState<PrepTab>("open");
  const [addOpen, setAddOpen] = useState(false);
  const [pendingComplete, setPendingComplete] = useState<OpsPrepTask | null>(null);
  const [actualCostInput, setActualCostInput] = useState("");
  const open = openOpsPrepTasks(tasks, doneIds);
  const done = doneOpsPrepTasks(tasks, doneIds);
  const todayKey = toDateKey(new Date());
  const overdue = open.filter((t) => t.dueDate < todayKey);
  const list = tab === "open" ? open : done;

  function beginComplete(task: OpsPrepTask) {
    if (task.requiresActualCost) {
      setPendingComplete(task);
      setActualCostInput("");
      return;
    }
    setOpsPrepTaskDone(task.id, true);
  }

  function confirmCompleteWithCost() {
    if (!pendingComplete) return;
    const parsed = parseFloat(actualCostInput.trim());
    if (Number.isNaN(parsed) || parsed < 0) return;
    setOpsPrepTaskDone(pendingComplete.id, true, { actualCost: parsed });
    setPendingComplete(null);
    setActualCostInput("");
  }

  return (
    <>
      <aside className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="shrink-0 border-b border-slate-100 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Ops prep</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Hotels, vendors, materials — check off when handled.
              </p>
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        <div className="mt-2 flex gap-1 rounded-lg border border-slate-100 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => setTab("open")}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-xs font-medium",
              tab === "open" ? "bg-white text-brand-800 shadow-sm" : "text-slate-600",
            )}
          >
            Upcoming ({open.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("done")}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-xs font-medium",
              tab === "done" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600",
            )}
          >
            Done ({done.length})
          </button>
        </div>
        {tab === "open" && open.length > 0 ? (
          <p className="mt-2 text-xs font-medium text-slate-700">
            {overdue.length > 0 ? (
              <span className="text-amber-800">
                {overdue.length} due or overdue
              </span>
            ) : (
              <span>{open.length} open</span>
            )}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
        {list.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
            {tab === "open"
              ? "No open prep items for upcoming job days."
              : "Completed prep items appear here for history."}
          </p>
        ) : (
          <ul className="space-y-2">
            {list.map((task) => (
              <OpsPrepTaskCard
                key={task.id}
                task={task}
                todayKey={todayKey}
                done={tab === "done"}
                onComplete={() => beginComplete(task)}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>

      <OpsPrepAddSidebar open={addOpen} onClose={() => setAddOpen(false)} />

      {pendingComplete ? (
        <LodgingCostDialog
          task={pendingComplete}
          value={actualCostInput}
          onChange={setActualCostInput}
          onClose={() => setPendingComplete(null)}
          onConfirm={confirmCompleteWithCost}
        />
      ) : null}
    </>
  );
}

function LodgingCostDialog({
  task,
  value,
  onChange,
  onClose,
  onConfirm,
}: {
  task: OpsPrepTask;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const parsed = parseFloat(value.trim());
  const valid = value.trim().length > 0 && !Number.isNaN(parsed) && parsed >= 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Record hotel cost</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter the actual hotel cost for {task.customerName}
          {task.jobDayLabel ? ` · ${task.jobDayLabel}` : ""}. Used for job profitability.
          {task.clientChargeEstimate != null
            ? ` Client charge estimate: $${task.clientChargeEstimate}.`
            : ""}
        </p>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-slate-600">Actual hotel cost</span>
          <input
            type="number"
            min={0}
            step={0.01}
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
            placeholder="0.00"
          />
        </label>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" disabled={!valid} onClick={onConfirm}>
            Mark done
          </Button>
        </div>
      </div>
    </div>
  );
}

function opsPrepTypeLabel(task: OpsPrepTask): string {
  if (task.vendorTypeId) return catalogVendorTypeLabel(task.vendorTypeId);
  return OPS_PREP_CATEGORY_LABELS[task.category];
}

function OpsPrepTaskCard({
  task,
  todayKey,
  done,
  onComplete,
}: {
  task: OpsPrepTask;
  todayKey: string;
  done: boolean;
  onComplete: () => void;
}) {
  const Icon = CATEGORY_ICON[task.category];
  const overdue = !done && task.dueDate < todayKey;
  const completion = done ? readOpsPrepCompletion(task.id) : undefined;
  const actualCost = completion?.actualCost ?? readOpsPrepActualCost(task.id);

  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2.5",
        done
          ? "border-emerald-100 bg-emerald-50/50"
          : overdue
            ? "border-amber-200 bg-amber-50/80"
            : "border-slate-200 bg-slate-50/50",
      )}
    >
      <div className="flex gap-2">
        {done ? (
          <button
            type="button"
            onClick={() => setOpsPrepTaskDone(task.id, false)}
            className="mt-0.5 shrink-0 text-emerald-600"
            aria-label="Mark prep task open again"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="mt-0.5 shrink-0 rounded-full border border-slate-300 bg-white p-0.5 text-slate-400 transition-colors hover:border-brand-400 hover:text-brand-600"
            aria-label="Mark prep task done"
          >
            <Circle className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
            <p className="text-xs font-semibold text-slate-900">{task.title}</p>
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{task.detail}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
            <span className="font-medium uppercase tracking-wide text-slate-400">
              {opsPrepTypeLabel(task)}
            </span>
            {task.vendor ? <span>· {task.vendor}</span> : null}
            <span>· Due {formatMoveDate(task.dueDate)}</span>
            {task.clientChargeEstimate != null ? (
              <span>· Client ${task.clientChargeEstimate}</span>
            ) : null}
            {actualCost != null ? <span>· Actual ${actualCost}</span> : null}
          </div>
          {task.moveId ? (
            <Link
              href={salesMovePath(task.moveId)}
              className="mt-1.5 inline-block text-[11px] font-medium text-brand-600 hover:text-brand-700"
            >
              {task.customerName}
              {task.jobDayLabel ? ` · ${task.jobDayLabel}` : ""} →
            </Link>
          ) : task.customerName !== MANUAL_OPS_PREP_NO_MOVE_LABEL ? (
            <p className="mt-1.5 text-[11px] text-slate-500">{task.customerName}</p>
          ) : null}
          {task.isManual ? (
            <button
              type="button"
              onClick={() => {
                const manualId = manualOpsPrepTaskIdFromOpsId(task.id);
                if (manualId) removeManualOpsPrepTask(manualId);
              }}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
