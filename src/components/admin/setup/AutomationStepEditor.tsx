"use client";

import { DaysStepper } from "@/components/admin/setup/automation-ui";
import {
  AUTOMATION_ACTION_LABELS,
  AUTOMATION_ACTION_OPTIONS,
  type AutomationStep,
} from "@/lib/settings/pipeline-automation-rules";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

type TemplateOption = { id: string; label: string };

type AutomationStepEditorProps = {
  step: AutomationStep;
  index: number;
  /** Built-in rules can only swap templates — actions, timing, and structure are locked. */
  locked?: boolean;
  smsTemplates: TemplateOption[];
  emailTemplates: TemplateOption[];
  isFirst: boolean;
  isLast: boolean;
  onPatch: (patch: Partial<AutomationStep>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
};

const SELECT_CLASS = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm";

export function AutomationStepEditor({
  step,
  index,
  locked,
  smsTemplates,
  emailTemplates,
  isFirst,
  isLast,
  onPatch,
  onRemove,
  onMove,
}: AutomationStepEditorProps) {
  const delaySummary = formatDelay(step);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
          {index + 1}
        </span>
        <select
          value={step.action}
          disabled={locked}
          onChange={(e) => onPatch({ action: e.target.value as AutomationStep["action"] })}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium disabled:bg-slate-50 disabled:text-slate-500"
        >
          {AUTOMATION_ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {AUTOMATION_ACTION_LABELS[a]}
            </option>
          ))}
        </select>
        {!locked ? (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={isFirst}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Move step up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={isLast}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Move step down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove step"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-slate-600">
          {isFirst ? "After trigger" : "After previous step"}
        </span>
        {locked ? (
          <span className="text-xs text-slate-500">{delaySummary}</span>
        ) : (
          <>
            <DaysStepper
              value={step.delayDays ?? 0}
              onChange={(v) => onPatch({ delayDays: v })}
              max={60}
              unit="days"
            />
            <DaysStepper
              value={step.delayMinutes ?? 0}
              onChange={(v) => onPatch({ delayMinutes: v })}
              max={120}
              unit="min"
            />
          </>
        )}
      </div>

      {step.action === "send_sms" ? (
        <label className="mt-3 block text-xs font-medium text-slate-600">
          SMS template
          <select
            value={step.smsTemplateId ?? ""}
            onChange={(e) => onPatch({ smsTemplateId: e.target.value || undefined })}
            className={SELECT_CLASS}
          >
            <option value="">—</option>
            {smsTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {step.action === "send_email" ? (
        <label className="mt-3 block text-xs font-medium text-slate-600">
          Email template
          <select
            value={step.emailTemplateId ?? ""}
            onChange={(e) => onPatch({ emailTemplateId: e.target.value || undefined })}
            className={SELECT_CLASS}
          >
            <option value="">—</option>
            {emailTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {step.action === "follow_up_task" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600">
            Task title
            <input
              value={step.followUpTitle ?? ""}
              disabled={locked}
              onChange={(e) => onPatch({ followUpTitle: e.target.value })}
              placeholder="Follow up"
              className={cn(SELECT_CLASS, "disabled:bg-slate-50 disabled:text-slate-500")}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Channel
            <select
              value={step.followUpChannel ?? "call"}
              disabled={locked}
              onChange={(e) =>
                onPatch({ followUpChannel: e.target.value as AutomationStep["followUpChannel"] })
              }
              className={cn(SELECT_CLASS, "disabled:bg-slate-50 disabled:text-slate-500")}
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="task">Task</option>
            </select>
          </label>
        </div>
      ) : null}

      {step.action === "office_notify" ? (
        <p className="mt-3 text-xs text-slate-500">Alerts the office in-app.</p>
      ) : null}
      {step.action === "crew_app_push" ? (
        <p className="mt-3 text-xs text-slate-500">Pushes job details to the assigned crew app.</p>
      ) : null}
    </div>
  );
}

function formatDelay(step: AutomationStep): string {
  const parts: string[] = [];
  if (step.delayDays) parts.push(`${step.delayDays}d`);
  if (step.delayMinutes) parts.push(`${step.delayMinutes}m`);
  return parts.length ? `+${parts.join(" ")}` : "immediately";
}
