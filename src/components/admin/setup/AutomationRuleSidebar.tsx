"use client";

import { AutomationStepEditor } from "@/components/admin/setup/AutomationStepEditor";
import { DaysStepper } from "@/components/admin/setup/automation-ui";
import { QuadrantRuleScope } from "@/components/admin/setup/QuadrantRuleScope";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { PIPELINE_STAGE_IDS, type PipelineStageId } from "@/lib/moves/types";
import {
  AUTOMATION_SECTION_LABELS,
  AUTOMATION_TRIGGER_LABELS,
  migrateRuleToSteps,
  type AutomationSectionId,
  type AutomationStep,
  type AutomationTriggerKind,
  type PipelineAutomationRule,
} from "@/lib/settings/pipeline-automation-rules";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

type TemplateOption = { id: string; label: string };

type AutomationRuleSidebarProps = {
  rule: PipelineAutomationRule | null;
  smsTemplates: TemplateOption[];
  emailTemplates: TemplateOption[];
  onClose: () => void;
  onPatch: (ruleId: string, patch: Partial<PipelineAutomationRule>) => void;
  onRemove: (ruleId: string) => void;
};

const TRIGGER_OPTIONS: AutomationTriggerKind[] = [
  "stage_enter",
  "document_quote_sent",
  "deposit_collected",
  "dispatch_published",
  "days_before_move",
  "day_of_move",
];

const SECTION_OPTIONS: AutomationSectionId[] = ["lead", "sales", "booking", "move_day", "post_move"];
const SEND_HOURS = [6, 7, 8, 12, 17, 18, 19, 20];
const INPUT = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm";

let stepCounter = 0;
function newStepId() {
  stepCounter += 1;
  return `step-${Date.now().toString(36)}-${stepCounter}`;
}

export function AutomationRuleSidebar({
  rule,
  smsTemplates,
  emailTemplates,
  onClose,
  onPatch,
  onRemove,
}: AutomationRuleSidebarProps) {
  if (!rule) return null;
  const r = rule;
  // Built-in rules are fully editable like custom ones; they just can't be
  // deleted (they're part of the seeded defaults — toggle them off instead).
  const canDelete = !r.builtin;
  const steps = migrateRuleToSteps(r);

  function patch(p: Partial<PipelineAutomationRule>) {
    onPatch(r.id, p);
  }

  function patchSteps(next: AutomationStep[]) {
    patch({ steps: next, actions: [...new Set(next.map((s) => s.action))] });
  }

  function patchStep(index: number, sp: Partial<AutomationStep>) {
    patchSteps(steps.map((s, i) => (i === index ? { ...s, ...sp } : s)));
  }

  function addStep() {
    patchSteps([
      ...steps,
      { id: newStepId(), action: "follow_up_task", followUpChannel: "call", followUpTitle: "Follow up" },
    ]);
  }

  function removeStep(index: number) {
    if (steps.length <= 1) return;
    patchSteps(steps.filter((_, i) => i !== index));
  }

  function moveStep(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    patchSteps(next);
  }

  return (
    <DetailSidebar
      open
      onClose={onClose}
      title="Edit automation"
      widthClassName="max-w-lg"
      footer={
        <div className="flex items-center justify-between gap-2">
          {canDelete ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1 text-red-700 hover:bg-red-50"
              onClick={() => {
                onRemove(r.id);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete rule
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-600">
            Name
            <input
              value={r.label}
              onChange={(e) => patch({ label: e.target.value })}
              className={cn(INPUT, "font-semibold text-slate-900")}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Description
            <input
              value={r.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Optional"
              className={cn(INPUT, "text-slate-700")}
            />
          </label>
        </div>

        <label className="block text-xs font-medium text-slate-600">
          Pipeline phase
          <select
            value={r.section}
            onChange={(e) => patch({ section: e.target.value as AutomationSectionId })}
            className={INPUT}
          >
            {SECTION_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {AUTOMATION_SECTION_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            When (trigger)
          </p>
          <select
            value={r.trigger}
            onChange={(e) => patch({ trigger: e.target.value as AutomationTriggerKind })}
            className={INPUT}
          >
            {TRIGGER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {AUTOMATION_TRIGGER_LABELS[t]}
              </option>
            ))}
          </select>
          {r.trigger === "stage_enter" ? (
            <label className="mt-2 block text-xs font-medium text-slate-600">
              Pipeline stage
              <select
                value={r.stage ?? "new_lead"}
                onChange={(e) => patch({ stage: e.target.value as PipelineStageId })}
                className={INPUT}
              >
                {PIPELINE_STAGE_IDS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {r.trigger === "days_before_move" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Days before move</span>
              <DaysStepper
                value={r.daysBeforeMove ?? 1}
                onChange={(v) => patch({ daysBeforeMove: v })}
                max={30}
                unit="days"
              />
            </div>
          ) : null}
          {r.trigger === "days_before_move" || r.trigger === "day_of_move" ? (
            <label className="mt-2 block text-xs font-medium text-slate-600">
              Send around
              <select
                value={r.sendAtHour ?? (r.trigger === "day_of_move" ? 7 : 18)}
                onChange={(e) => patch({ sendAtHour: Number(e.target.value) })}
                className={INPUT}
              >
                {SEND_HOURS.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Then (steps)
            </p>
            <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={addStep}>
              <Plus className="h-3.5 w-3.5" />
              Add step
            </Button>
          </div>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <AutomationStepEditor
                key={step.id}
                step={step}
                index={index}
                smsTemplates={smsTemplates}
                emailTemplates={emailTemplates}
                isFirst={index === 0}
                isLast={index === steps.length - 1}
                onPatch={(sp) => patchStep(index, sp)}
                onRemove={() => removeStep(index)}
                onMove={(dir) => moveStep(index, dir)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <QuadrantRuleScope rule={r} onChange={(quadrants) => patch({ quadrants })} />
        </div>
      </div>
    </DetailSidebar>
  );
}

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour} ${suffix}`;
}
