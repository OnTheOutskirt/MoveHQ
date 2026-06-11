"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import type { CrewAppJob } from "@/lib/crew-app/types";
import {
  buildJobAllLoadItems,
  buildJobPendingLoadItems,
  buildTodayAllLoadItems,
  buildTodayPendingLoadItems,
  checkDayLoadMaterial,
  checkJobLoadItem,
  countTodayLoadMaterialTypes,
  type LoadChecklistItem,
  uncheckDayLoadMaterial,
  uncheckJobLoadItem,
} from "@/lib/crew-app/load-checklist-storage";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronDown, Package } from "lucide-react";
import { useMemo, useState } from "react";

type CrewLoadChecklistProps = {
  scope: "day" | "job";
  /** Required for day scope — all jobs on today's load list. */
  dayJobs?: CrewAppJob[];
  job?: CrewAppJob;
  title: string;
  subtitle?: string;
  doneTitle: string;
  doneSubtitle?: string;
  hideWhenEmpty?: boolean;
};

export function CrewLoadChecklist({
  scope,
  dayJobs = [],
  job,
  title,
  subtitle,
  doneTitle,
  doneSubtitle,
  hideWhenEmpty = scope === "job",
}: CrewLoadChecklistProps) {
  const { session, bumpLoadChecklist, loadChecklistRevision } = useCrewApp();
  const [expanded, setExpanded] = useState(true);
  const [viewing, setViewing] = useState(false);

  const pending = useMemo(() => {
    void loadChecklistRevision;
    if (scope === "day") {
      return buildTodayPendingLoadItems(dayJobs, session.crewId);
    }
    if (scope === "job" && job) {
      return buildJobPendingLoadItems(job, session.crewId);
    }
    return [];
  }, [scope, dayJobs, job, session.crewId, loadChecklistRevision]);

  const allItems = useMemo((): LoadChecklistItem[] => {
    void loadChecklistRevision;
    if (scope === "day") {
      return buildTodayAllLoadItems(dayJobs, session.crewId);
    }
    if (scope === "job" && job) {
      return buildJobAllLoadItems(job, session.crewId);
    }
    return [];
  }, [scope, dayJobs, job, session.crewId, loadChecklistRevision]);

  const totalTypes = useMemo(() => {
    void loadChecklistRevision;
    if (scope === "day") {
      return countTodayLoadMaterialTypes(dayJobs);
    }
    return job?.shopMaterials.length ?? 0;
  }, [scope, dayJobs, job, loadChecklistRevision]);

  const hadMaterials = totalTypes > 0;
  const allDone = hadMaterials && pending.length === 0;

  function handleToggle(key: string, checked: boolean) {
    if (scope === "day") {
      if (checked) {
        uncheckDayLoadMaterial(session.crewId, key, dayJobs);
      } else {
        checkDayLoadMaterial(session.crewId, key, dayJobs);
      }
    } else if (scope === "job" && job) {
      if (checked) {
        uncheckJobLoadItem(session.crewId, job.id, key);
      } else {
        checkJobLoadItem(session.crewId, job.id, key);
      }
    }
    bumpLoadChecklist();
  }

  function handleView() {
    setViewing(true);
    setExpanded(true);
  }

  function handleHeaderToggle() {
    setExpanded((v) => {
      const next = !v;
      if (!next && allDone) {
        setViewing(false);
      }
      return next;
    });
  }

  if (!hadMaterials && hideWhenEmpty) return null;
  if (!hadMaterials) return null;

  if (allDone && !viewing) {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 shadow-sm">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-950">{doneTitle}</p>
          {doneSubtitle ? (
            <p className="text-[11px] text-emerald-800/90">{doneSubtitle}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleView}
          className="shrink-0 rounded-lg border border-emerald-300/80 bg-white px-3 py-1.5 text-[11px] font-semibold text-emerald-900 shadow-sm hover:bg-emerald-50"
        >
          View
        </button>
      </section>
    );
  }

  const listItems: LoadChecklistItem[] = viewing
    ? allItems
    : allItems.filter((item) => !item.checked);

  const progressSubtitle =
    subtitle ??
    (viewing
      ? "Check or uncheck items as needed"
      : `${pending.length} of ${totalTypes} item type${totalTypes === 1 ? "" : "s"} left to load`);

  const headerTitle = viewing && allDone ? doneTitle : title;

  return (
    <section className="overflow-hidden rounded-2xl border border-brand-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={handleHeaderToggle}
        className="flex w-full items-center justify-between gap-3 bg-gradient-to-r from-brand-50/90 to-white px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              viewing && allDone
                ? "bg-emerald-100 text-emerald-700"
                : "bg-brand-100 text-brand-700",
            )}
          >
            {viewing && allDone ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Package className="h-4 w-4" />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{headerTitle}</p>
            <p className="text-[11px] text-slate-500">{progressSubtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition", expanded && "rotate-180")}
        />
      </button>

      {expanded ? (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {listItems.map((item) => (
            <li key={item.key}>
              <label className="flex cursor-pointer items-start gap-3 px-4 py-3 active:bg-slate-50">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggle(item.key, item.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        item.checked ? "text-slate-500 line-through" : "text-slate-800",
                      )}
                    >
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums",
                        item.checked
                          ? "bg-slate-100 text-slate-500"
                          : "bg-brand-50 text-brand-800",
                      )}
                    >
                      {item.qtyLabel}
                    </span>
                  </span>
                  {item.detail ? (
                    <span className="mt-1 block text-[10px] text-slate-500">{item.detail}</span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
