"use client";

import {
  AutomationSwitch,
  DaysStepper,
} from "@/components/admin/setup/automation-ui";
import { QuadrantRuleScope } from "@/components/admin/setup/QuadrantRuleScope";
import { Button } from "@/components/ui/Button";
import { PIPELINE_STAGE_IDS, type PipelineStageId } from "@/lib/moves/types";
import {
  AUTOMATION_ACTION_LABELS,
  AUTOMATION_SECTION_LABELS,
  AUTOMATION_TRIGGER_LABELS,
  type AutomationActionKind,
  type AutomationRuleCategory,
  type AutomationSectionId,
  type AutomationTriggerKind,
  type PipelineAutomationRule,
} from "@/lib/settings/pipeline-automation-rules";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TRIGGER_OPTIONS: AutomationTriggerKind[] = [
  "stage_enter",
  "document_quote_sent",
  "deposit_collected",
  "dispatch_published",
  "days_before_move",
  "day_of_move",
];

const CATEGORY_ACTIONS: Record<AutomationRuleCategory, AutomationActionKind[]> = {
  follow_ups: ["follow_up_task"],
  messages: ["send_sms", "send_email"],
  internal: ["office_notify", "crew_app_push"],
};

type AutomationRuleEditorProps = {
  rule: PipelineAutomationRule;
  category: AutomationRuleCategory;
  sectionOptions: AutomationSectionId[];
  smsTemplates: { id: string; label: string }[];
  emailTemplates: { id: string; label: string }[];
  startExpanded?: boolean;
  highlight?: boolean;
  onPatch: (patch: Partial<PipelineAutomationRule>) => void;
  onToggleAction: (action: AutomationActionKind) => void;
  onRemove?: () => void;
};

export function AutomationRuleEditor({
  rule,
  category,
  sectionOptions,
  smsTemplates,
  emailTemplates,
  startExpanded,
  highlight,
  onPatch,
  onToggleAction,
  onRemove,
}: AutomationRuleEditorProps) {
  const [expanded, setExpanded] = useState(Boolean(startExpanded));
  const rootRef = useRef<HTMLLIElement>(null);
  const triggerLabel = formatTrigger(rule);
  const timing = formatRuleTiming(rule);
  const actionsSummary = rule.actions.map((a) => AUTOMATION_ACTION_LABELS[a]).join(", ");
  const actionOptions = CATEGORY_ACTIONS[category];

  useEffect(() => {
    if (startExpanded) setExpanded(true);
  }, [startExpanded]);

  useEffect(() => {
    if (!highlight || !rootRef.current) return;
    rootRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlight, expanded]);

  return (
    <li
      ref={rootRef}
      className={cn(
        "rounded-xl border shadow-sm transition-colors",
        highlight && "ring-2 ring-brand-300 ring-offset-1",
        rule.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/80",
      )}
    >
      <div className="flex items-start gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 flex-col gap-1 text-left"
        >
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{rule.label}</span>
            {!rule.builtin ? (
              <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
                Custom
              </span>
            ) : null}
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform",
                expanded && "rotate-180",
              )}
              aria-hidden
            />
          </span>
          {rule.description ? (
            <span className="line-clamp-1 text-xs text-slate-500">{rule.description}</span>
          ) : null}
          <span className="flex flex-wrap items-center gap-1 text-xs text-slate-600">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">
              When
            </span>
            <span>{triggerLabel}</span>
            {timing ? <span className="text-slate-400">· {timing}</span> : null}
            <ArrowRight className="h-3 w-3 text-slate-300" aria-hidden />
            <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-800">
              Then
            </span>
            <span className="text-slate-700">{actionsSummary}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
              title="Remove custom rule"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
          <AutomationSwitch
            checked={rule.enabled}
            onChange={(v) => onPatch({ enabled: v })}
            label={rule.label}
          />
        </div>
      </div>

      {expanded ? (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50/40 px-4 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600">
              Name
              <input
                value={rule.label}
                onChange={(e) => onPatch({ label: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900"
              />
            </label>
            {!rule.builtin || !rule.description ? (
              <label className="block text-xs font-medium text-slate-600">
                Description
                <input
                  value={rule.description}
                  onChange={(e) => onPatch({ description: e.target.value })}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700"
                />
              </label>
            ) : (
              <p className="text-xs text-slate-500 sm:col-span-1">{rule.description}</p>
            )}
          </div>

          {!rule.builtin ? (
            <label className="block text-xs font-medium text-slate-600">
              Pipeline phase
              <select
                value={rule.section}
                onChange={(e) => onPatch({ section: e.target.value as AutomationSectionId })}
                className="mt-1 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
              >
                {sectionOptions.map((sectionId) => (
                  <option key={sectionId} value={sectionId}>
                    {AUTOMATION_SECTION_LABELS[sectionId]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {actionOptions.map((action) => {
                const active = rule.actions.includes(action);
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => onToggleAction(action)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-brand-200 bg-brand-50 text-brand-900"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
                    )}
                  >
                    {AUTOMATION_ACTION_LABELS[action]}
                  </button>
                );
              })}
            </div>
          </div>

          <QuadrantRuleScope rule={rule} onChange={(quadrants) => onPatch({ quadrants })} />

          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <TriggerEditor rule={rule} onPatch={onPatch} />
            <TimingEditor rule={rule} onPatch={onPatch} />
          </div>

          {rule.actions.includes("send_sms") ? (
            <label className="block text-xs font-medium text-slate-600">
              SMS template
              <select
                value={rule.smsTemplateId ?? ""}
                onChange={(e) => onPatch({ smsTemplateId: e.target.value || undefined })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
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

          {rule.actions.includes("send_email") ? (
            <label className="block text-xs font-medium text-slate-600">
              Email template
              <select
                value={rule.emailTemplateId ?? ""}
                onChange={(e) => onPatch({ emailTemplateId: e.target.value || undefined })}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
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

          {rule.actions.includes("follow_up_task") ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-600">
                Task title
                <input
                  value={rule.followUpTitle ?? rule.label}
                  onChange={(e) => onPatch({ followUpTitle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Channel
                <select
                  value={rule.followUpChannel ?? "call"}
                  onChange={(e) =>
                    onPatch({
                      followUpChannel: e.target.value as PipelineAutomationRule["followUpChannel"],
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="task">Task</option>
                </select>
              </label>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function TriggerEditor({
  rule,
  onPatch,
}: {
  rule: PipelineAutomationRule;
  onPatch: (patch: Partial<PipelineAutomationRule>) => void;
}) {
  return (
    <label className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
      <span className="font-medium">Trigger</span>
      <select
        value={rule.trigger}
        onChange={(e) => onPatch({ trigger: e.target.value as AutomationTriggerKind })}
        className="rounded-md border border-slate-200 px-2 py-1 text-sm"
        disabled={rule.builtin}
      >
        {TRIGGER_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {AUTOMATION_TRIGGER_LABELS[t]}
          </option>
        ))}
      </select>
      {rule.trigger === "stage_enter" ? (
        <select
          value={rule.stage ?? "new_lead"}
          onChange={(e) => onPatch({ stage: e.target.value as PipelineStageId })}
          className="rounded-md border border-slate-200 px-2 py-1 text-sm"
          disabled={rule.builtin}
        >
          {PIPELINE_STAGE_IDS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      ) : null}
    </label>
  );
}

function TimingEditor({
  rule,
  onPatch,
}: {
  rule: PipelineAutomationRule;
  onPatch: (patch: Partial<PipelineAutomationRule>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {rule.delayMinutes != null && rule.delayMinutes > 0 ? (
        <TimingField
          label="Minutes after"
          value={rule.delayMinutes}
          onChange={(v) => onPatch({ delayMinutes: v })}
          max={120}
          unit="min"
        />
      ) : null}
      {rule.delayDays != null && rule.trigger !== "days_before_move" ? (
        <TimingField label="Days after" value={rule.delayDays} onChange={(v) => onPatch({ delayDays: v })} />
      ) : null}
      {rule.daysBeforeMove != null ? (
        <TimingField
          label="Days before move"
          value={rule.daysBeforeMove}
          onChange={(v) => onPatch({ daysBeforeMove: v })}
        />
      ) : null}
      {rule.sendAtHour != null ? (
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-medium">Send around</span>
          <select
            value={rule.sendAtHour}
            onChange={(e) => onPatch({ sendAtHour: Number(e.target.value) })}
            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
          >
            {[6, 7, 8, 12, 17, 18, 19, 20].map((h) => (
              <option key={h} value={h}>
                {formatHour(h)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {!rule.builtin ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onPatch({ delayMinutes: rule.delayMinutes ?? 15 })}
          >
            + Minutes
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onPatch({ delayDays: rule.delayDays ?? 1 })}
          >
            + Days
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function formatTrigger(rule: PipelineAutomationRule): string {
  const base = AUTOMATION_TRIGGER_LABELS[rule.trigger];
  if (rule.trigger === "stage_enter" && rule.stage) {
    return `${base} · ${rule.stage.replace(/_/g, " ")}`;
  }
  return base;
}

function formatRuleTiming(rule: PipelineAutomationRule): string | null {
  if (rule.delayMinutes && rule.delayMinutes > 0) return `${rule.delayMinutes} min later`;
  if (rule.delayDays != null && rule.trigger !== "days_before_move") {
    return `${rule.delayDays}d later`;
  }
  if (rule.daysBeforeMove != null) return `${rule.daysBeforeMove}d before move`;
  if (rule.sendAtHour != null) return `around ${formatHour(rule.sendAtHour)}`;
  return null;
}

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour} ${suffix}`;
}

function TimingField({
  label,
  value,
  onChange,
  max = 30,
  unit = "days",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span className="font-medium">{label}</span>
      <DaysStepper value={value} onChange={onChange} max={max} unit={unit} />
    </div>
  );
}
