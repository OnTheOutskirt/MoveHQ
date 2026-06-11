"use client";

import { useOpsPrepDoneIds } from "@/components/operations/jobs/use-ops-prep-done";
import { formatMoveDate } from "@/lib/moves/format";
import { toDateKey } from "@/lib/calendar/date-utils";
import {
  doneOpsPrepTasks,
  OPS_PREP_CATEGORY_LABELS,
  openOpsPrepTasks,
  type OpsPrepCategory,
  type OpsPrepTask,
} from "@/lib/operations/ops-prep-tasks";
import { setOpsPrepTaskDone } from "@/lib/operations/ops-prep-storage";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import {
  BedDouble,
  Building2,
  CheckCircle2,
  Circle,
  Package,
  Route,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CATEGORY_ICON: Record<OpsPrepCategory, typeof Package> = {
  lodging: BedDouble,
  vendor: Building2,
  materials: Package,
  logistics: Truck,
  coordination: Route,
};

type OpsPrepPanelProps = {
  tasks: OpsPrepTask[];
};

type PrepTab = "open" | "done";

export function OpsPrepPanel({ tasks }: OpsPrepPanelProps) {
  const doneIds = useOpsPrepDoneIds();
  const [tab, setTab] = useState<PrepTab>("open");
  const open = openOpsPrepTasks(tasks, doneIds);
  const done = doneOpsPrepTasks(tasks, doneIds);
  const todayKey = toDateKey(new Date());
  const overdue = open.filter((t) => t.dueDate < todayKey);
  const list = tab === "open" ? open : done;

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Ops prep</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Hotels, vendors, materials — check off when handled.
        </p>
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
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function OpsPrepTaskCard({
  task,
  todayKey,
  done,
}: {
  task: OpsPrepTask;
  todayKey: string;
  done: boolean;
}) {
  const Icon = CATEGORY_ICON[task.category];
  const overdue = !done && task.dueDate < todayKey;

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
            onClick={() => setOpsPrepTaskDone(task.id, true)}
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
              {OPS_PREP_CATEGORY_LABELS[task.category]}
            </span>
            {task.vendor ? <span>· {task.vendor}</span> : null}
            <span>· Due {formatMoveDate(task.dueDate)}</span>
          </div>
          <Link
            href={salesMovePath(task.moveId)}
            className="mt-1.5 inline-block text-[11px] font-medium text-brand-600 hover:text-brand-700"
          >
            {task.customerName}
            {task.jobDayLabel ? ` · ${task.jobDayLabel}` : ""} →
          </Link>
        </div>
      </div>
    </li>
  );
}
