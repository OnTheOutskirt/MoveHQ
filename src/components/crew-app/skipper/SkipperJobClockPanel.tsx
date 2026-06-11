"use client";

import {
  activeCategory,
  clockStepsForJob,
  END_OF_DAY_CHECKLIST_ITEMS,
  formatElapsedMs,
  slotElapsed,
  TIME_CATEGORIES,
  TIME_CATEGORY_LABELS,
  totalClockedMs,
  type JobFieldState,
  type TimeCategory,
} from "@/lib/crew-app/job-field-storage";
import type { CrewAppJob } from "@/lib/crew-app/types";
import { cn } from "@/lib/utils";
import {
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  MapPin,
  Plus,
  Route,
  Timer,
  Warehouse,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CATEGORY_ICONS: Record<TimeCategory, typeof Clock> = {
  move: Clock,
  drive: Car,
  depot: Warehouse,
  extra: Plus,
  break: Coffee,
};

type SkipperJobClockPanelProps = {
  job: CrewAppJob;
  state: JobFieldState;
  onChange: (next: JobFieldState) => void;
  hasMoreJobsToday: boolean;
};

export function SkipperJobClockPanel({
  job,
  state,
  onChange,
  hasMoreJobsToday,
}: SkipperJobClockPanelProps) {
  const [, tick] = useState(0);
  const [showManual, setShowManual] = useState(false);
  const running = activeCategory(state);
  const steps = clockStepsForJob(job);
  const stepIndex = Math.min(state.clockGuideStep, steps.length - 1);
  const currentStep = steps[stepIndex];
  const isLocal = job.moveType === "local";

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const totalToday = useMemo(
    () => formatElapsedMs(totalClockedMs(state)),
    [state, tick],
  );

  const billableToday = useMemo(
    () => formatElapsedMs(totalClockedMs(state, { excludeBreak: true })),
    [state, tick],
  );

  const showEndOfDay =
    Boolean(state.jobCompleteAt) && !hasMoreJobsToday;

  function clockIn(category: TimeCategory) {
    const times = { ...state.times };
    for (const cat of TIME_CATEGORIES) {
      const slot = times[cat];
      if (slot.clockIn && !slot.clockOut) {
        times[cat] = { ...slot, clockOut: new Date().toISOString() };
      }
    }
    times[category] = { clockIn: new Date().toISOString(), clockOut: null };
    onChange({ ...state, times });
  }

  function clockOut(category: TimeCategory) {
    const slot = state.times[category];
    if (!slot.clockIn || slot.clockOut) return;
    onChange({
      ...state,
      times: {
        ...state.times,
        [category]: { ...slot, clockOut: new Date().toISOString() },
      },
    });
  }

  function startCurrentStep() {
    clockIn(currentStep.category);
  }

  function finishCurrentStep() {
    if (running) clockOut(running);
    const nextStep = Math.min(stepIndex + 1, steps.length - 1);
    onChange({ ...state, clockGuideStep: nextStep });
  }

  function markJobComplete() {
    if (running) return;
    onChange({
      ...state,
      jobCompleteAt: new Date().toISOString(),
    });
  }

  function toggleEodItem(item: (typeof END_OF_DAY_CHECKLIST_ITEMS)[number]) {
    onChange({
      ...state,
      endOfDayChecklist: {
        ...state.endOfDayChecklist,
        [item]: !state.endOfDayChecklist[item],
      },
    });
  }

  const stepRunning = running === currentStep.category;
  const allStepsDone = stepIndex >= steps.length - 1 && !running;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-xl border px-4 py-3",
          isLocal
            ? "border-brand-200 bg-brand-50/80"
            : "border-violet-200 bg-violet-50/80",
        )}
      >
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {isLocal ? (
            <MapPin className="h-3.5 w-3.5 text-brand-700" />
          ) : (
            <Route className="h-3.5 w-3.5 text-violet-700" />
          )}
          {isLocal ? "Local move" : "Long distance move"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">
          {isLocal
            ? "Drive time at the start and end. Everything on site — including driving between stops — is move time."
            : "Move time only when loading or unloading at a house. Any time in the truck is drive time."}
        </p>
      </div>

      {running ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
            Crew clocked in
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {TIME_CATEGORY_LABELS[running]} · {slotElapsed(state.times[running])}
          </p>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Timer className="h-4 w-4 text-brand-600" />
            Today&apos;s flow
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Follow each step in order. Use break or extra time anytime below.
          </p>
        </div>

        <ol className="divide-y divide-slate-100">
          {steps.map((step, index) => {
            const done = index < stepIndex;
            const isCurrent = index === stepIndex;
            const active = running === step.category && isCurrent;
            const slot = state.times[step.category];
            const hasTime = Boolean(slot.clockIn);

            return (
              <li
                key={step.id}
                className={cn(
                  "px-4 py-3",
                  isCurrent && "bg-brand-50/40",
                  done && !isCurrent && "opacity-70",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      done
                        ? "bg-emerald-100 text-emerald-800"
                        : isCurrent
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{step.description}</p>
                    {hasTime ? (
                      <p className="mt-1 text-[11px] font-medium tabular-nums text-slate-500">
                        {TIME_CATEGORY_LABELS[step.category]} logged: {slotElapsed(slot)}
                      </p>
                    ) : null}

                    {isCurrent ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!active ? (
                          <button
                            type="button"
                            onClick={startCurrentStep}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                          >
                            Start {TIME_CATEGORY_LABELS[step.category].toLowerCase()}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => clockOut(step.category)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                            >
                              Clock out
                            </button>
                            {index < steps.length - 1 ? (
                              <button
                                type="button"
                                onClick={finishCurrentStep}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Next step
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowManual((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Break &amp; extra time
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              Tap to clock break or extra time without changing the main flow.
            </p>
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition",
              showManual && "rotate-90",
            )}
          />
        </button>

        {showManual ? (
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            {(["break", "extra"] as const).map((cat) => {
              const slot = state.times[cat];
              const active = Boolean(slot.clockIn && !slot.clockOut);
              const Icon = CATEGORY_ICONS[cat];
              return (
                <div
                  key={cat}
                  className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {TIME_CATEGORY_LABELS[cat]}
                      </p>
                      <p className="text-[11px] tabular-nums text-slate-500">
                        {slotElapsed(slot)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={active}
                      onClick={() => clockIn(cat)}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                        active
                          ? "bg-slate-100 text-slate-400"
                          : "bg-brand-600 text-white",
                      )}
                    >
                      In
                    </button>
                    <button
                      type="button"
                      disabled={!active}
                      onClick={() => clockOut(cat)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-semibold",
                        !active
                          ? "border-slate-200 text-slate-400"
                          : "border-slate-300 bg-white text-slate-900",
                      )}
                    >
                      Out
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {TIME_CATEGORIES.map((cat) => {
            const slot = state.times[cat];
            if (!slot.clockIn) return null;
            return (
              <li key={cat} className="flex justify-between px-4 py-2 text-xs text-slate-600">
                <span>{TIME_CATEGORY_LABELS[cat]}</span>
                <span className="font-medium tabular-nums text-slate-800">{slotElapsed(slot)}</span>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-center text-[11px] text-slate-500">
          Billable time: <strong className="text-slate-800">{billableToday}</strong>
          <span className="mx-1.5">·</span>
          Total incl. break: <strong className="text-slate-800">{totalToday}</strong>
        </div>
      </section>

      {!state.jobCompleteAt ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Job complete</h2>
          <p className="mt-0.5 text-xs text-slate-600">
            {hasMoreJobsToday
              ? "Clock out, then mark this job done before heading to your next move."
              : "Back at the office? Mark this job complete to unlock end-of-day checklist."}
          </p>
          <button
            type="button"
            disabled={Boolean(running) || !allStepsDone}
            onClick={markJobComplete}
            className={cn(
              "mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition",
              running || !allStepsDone
                ? "bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800",
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark job complete
          </button>
          {!allStepsDone ? (
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Finish the guided steps above first.
            </p>
          ) : running ? (
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Clock out before marking complete.
            </p>
          ) : null}
        </section>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-900">Job marked complete</p>
          <p className="mt-0.5 text-xs text-emerald-800">
            {new Date(state.jobCompleteAt).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
            {hasMoreJobsToday ? " — head to Close out, then your next job." : " — finish end-of-day tasks below."}
          </p>
        </div>
      )}

      {showEndOfDay ? (
        <section className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-900">
            End-of-day checklist
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Last job of the day — complete before you leave the office.
          </p>
          <ul className="mt-3 space-y-2">
            {END_OF_DAY_CHECKLIST_ITEMS.map((item) => (
              <li key={item}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={state.endOfDayChecklist[item]}
                    onChange={() => toggleEodItem(item)}
                    className="rounded border-slate-300 text-brand-600"
                  />
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </section>
      ) : state.jobCompleteAt && hasMoreJobsToday ? (
        <p className="text-center text-xs text-slate-500">
          End-of-day checklist appears after your last job — you have another move scheduled today.
        </p>
      ) : null}
    </div>
  );
}
