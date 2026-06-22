"use client";

import { AutomationSwitch } from "@/components/admin/setup/automation-ui";
import {
  AUTOMATION_ACTION_LABELS,
  AUTOMATION_SECTION_LABELS,
  AUTOMATION_TRIGGER_LABELS,
  migrateRuleToSteps,
  type AutomationStep,
  type PipelineAutomationRule,
} from "@/lib/settings/pipeline-automation-rules";
import { cn } from "@/lib/utils";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";

type AutomationCardProps = {
  rule: PipelineAutomationRule;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  /** Only provided for custom rules — built-ins cannot be deleted. */
  onRemove?: () => void;
};

export function AutomationCard({ rule, onToggle, onEdit, onRemove }: AutomationCardProps) {
  const steps = migrateRuleToSteps(rule);

  return (
    <li
      className={cn(
        "rounded-xl border p-3 shadow-sm transition-colors",
        rule.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/80",
      )}
    >
      <div className="flex items-start gap-3">
        <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{rule.label}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {AUTOMATION_SECTION_LABELS[rule.section]}
            </span>
            {!rule.builtin ? (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
                Custom
              </span>
            ) : null}
            {rule.quadrants?.length ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                {rule.quadrants.join("/")}
              </span>
            ) : null}
          </span>
          {rule.description ? (
            <span className="mt-1 line-clamp-1 block text-xs text-slate-500">{rule.description}</span>
          ) : null}
          <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">
              When
            </span>
            <span>{formatTrigger(rule)}</span>
            <ArrowRight className="h-3 w-3 text-slate-300" aria-hidden />
            <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-800">
              Then
            </span>
            {steps.map((step, i) => {
              const delay = formatDelay(step);
              return (
                <span key={step.id} className="flex items-center gap-1">
                  {i > 0 ? <span className="text-slate-300">→</span> : null}
                  {delay ? <span className="text-slate-400">{delay}</span> : null}
                  <span className="text-slate-700">{AUTOMATION_ACTION_LABELS[step.action]}</span>
                </span>
              );
            })}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Edit rule"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete rule"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
          <AutomationSwitch checked={rule.enabled} onChange={onToggle} label={rule.label} />
        </div>
      </div>
    </li>
  );
}

function formatTrigger(rule: PipelineAutomationRule): string {
  const base = AUTOMATION_TRIGGER_LABELS[rule.trigger];
  if (rule.trigger === "stage_enter" && rule.stage) {
    return `${base}: ${rule.stage.replace(/_/g, " ")}`;
  }
  if (rule.trigger === "days_before_move") {
    return `${rule.daysBeforeMove ?? 1}d before move`;
  }
  return base;
}

function formatDelay(step: AutomationStep): string | null {
  const parts: string[] = [];
  if (step.delayDays) parts.push(`${step.delayDays}d`);
  if (step.delayMinutes) parts.push(`${step.delayMinutes}m`);
  return parts.length ? `+${parts.join(" ")}` : null;
}
