"use client";

import { AutomationCard } from "@/components/admin/setup/AutomationCard";
import { AutomationRuleSidebar } from "@/components/admin/setup/AutomationRuleSidebar";
import { HoursStepper } from "@/components/admin/setup/automation-ui";
import { QuadrantAutomationsSection } from "@/components/admin/setup/QuadrantAutomationsSection";
import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { TabBar } from "@/components/shared/TabBar";
import { Button } from "@/components/ui/Button";
import { getMessageTemplates } from "@/lib/communications/message-templates";
import {
  addCustomPipelineAutomationRule,
  automationRuleCategories,
  AUTOMATION_CATEGORY_LABELS,
  AUTOMATION_SECTION_LABELS,
  patchPipelineAutomationRule,
  removePipelineAutomationRule,
  type AutomationRuleCategory,
  type AutomationSectionId,
  type PipelineAutomationRule,
} from "@/lib/settings/pipeline-automation-rules";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import { cn } from "@/lib/utils";
import { Plus, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";

const TOP_TABS = [
  { id: "rules" as const, label: "Rules" },
  { id: "settings" as const, label: "Settings" },
];
type TopTab = "rules" | "settings";

const PHASE_FILTERS: { id: AutomationSectionId | "all"; label: string }[] = [
  { id: "all", label: "All phases" },
  { id: "lead", label: AUTOMATION_SECTION_LABELS.lead },
  { id: "sales", label: AUTOMATION_SECTION_LABELS.sales },
  { id: "booking", label: AUTOMATION_SECTION_LABELS.booking },
  { id: "move_day", label: AUTOMATION_SECTION_LABELS.move_day },
  { id: "post_move", label: AUTOMATION_SECTION_LABELS.post_move },
];

const TYPE_FILTERS: { id: AutomationRuleCategory | "all"; label: string }[] = [
  { id: "all", label: "All types" },
  { id: "follow_ups", label: AUTOMATION_CATEGORY_LABELS.follow_ups },
  { id: "messages", label: AUTOMATION_CATEGORY_LABELS.messages },
  { id: "internal", label: AUTOMATION_CATEGORY_LABELS.internal },
];

const STATUS_FILTERS: { id: "all" | "on" | "off"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "on", label: "On" },
  { id: "off", label: "Off" },
];
type StatusFilter = "all" | "on" | "off";

const DEFAULT_STAGE_FOR_PHASE: Record<AutomationSectionId, string> = {
  lead: "new_lead",
  sales: "waiting",
  booking: "booked",
  move_day: "booked",
  post_move: "completed",
};

export function AutomationsTab() {
  const { value: pipelineAutomations, update: updatePipelineAutomations } =
    useSettingsSection("pipelineAutomations");
  const { value: followUps, update: updateFollowUps } = useSettingsSection("followUps");

  const [topTab, setTopTab] = useState<TopTab>("rules");
  const [phase, setPhase] = useState<AutomationSectionId | "all">("all");
  const [type, setType] = useState<AutomationRuleCategory | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const templates = useMemo(() => getMessageTemplates(), []);
  const smsTemplates = useMemo(
    () =>
      templates
        .filter((t) => t.channel === "sms" && (t.category ?? "sales") === "automations")
        .map((t) => ({ id: t.id, label: t.label })),
    [templates],
  );
  const emailTemplates = useMemo(
    () =>
      templates
        .filter((t) => t.channel === "email" && (t.category ?? "sales") === "automations")
        .map((t) => ({ id: t.id, label: t.label })),
    [templates],
  );

  const rules = pipelineAutomations.rules;

  const filtered = useMemo(
    () =>
      rules.filter((r) => {
        if (phase !== "all" && r.section !== phase) return false;
        if (type !== "all" && !automationRuleCategories(r).includes(type)) return false;
        if (status === "on" && !r.enabled) return false;
        if (status === "off" && r.enabled) return false;
        return true;
      }),
    [rules, phase, type, status],
  );

  const editingRule = editingId ? (rules.find((r) => r.id === editingId) ?? null) : null;
  const enabledCount = rules.filter((r) => r.enabled).length;

  function patchRule(ruleId: string, patch: Partial<PipelineAutomationRule>) {
    updatePipelineAutomations(patchPipelineAutomationRule(pipelineAutomations, ruleId, patch));
  }

  function removeRule(ruleId: string) {
    updatePipelineAutomations(removePipelineAutomationRule(pipelineAutomations, ruleId));
    if (editingId === ruleId) setEditingId(null);
  }

  function addRule() {
    const section: AutomationSectionId = phase === "all" ? "sales" : phase;
    const { settings, ruleId } = addCustomPipelineAutomationRule(pipelineAutomations, {
      label: "New automation",
      section,
      trigger: "stage_enter",
      stage: DEFAULT_STAGE_FOR_PHASE[section] as PipelineAutomationRule["stage"],
      actions: ["follow_up_task"],
      followUpTitle: "Follow up",
      followUpChannel: "call",
      delayDays: 1,
    });
    updatePipelineAutomations(settings);
    setEditingId(ruleId);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Automations</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {enabledCount} of {rules.length} on
        </span>
      </div>

      <TabBar tabs={TOP_TABS} activeTab={topTab} onChange={setTopTab} />

      {topTab === "settings" ? (
        <SettingsPanel
          rules={rules}
          escalateOverdueAfterHours={followUps.escalateOverdueAfterHours}
          onEscalateChange={(v) => updateFollowUps({ escalateOverdueAfterHours: v })}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterChips options={PHASE_FILTERS} value={phase} onChange={setPhase} />
            <Button type="button" size="sm" className="shrink-0 gap-1" onClick={addRule}>
              <Plus className="h-3.5 w-3.5" />
              Add rule
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChips options={TYPE_FILTERS} value={type} onChange={setType} />
            <span className="mx-1 hidden h-4 w-px bg-slate-200 sm:block" />
            <FilterChips options={STATUS_FILTERS} value={status} onChange={setStatus} />
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
              No automations match these filters.{" "}
              <button
                type="button"
                onClick={addRule}
                className="font-medium text-brand-600 hover:underline"
              >
                Add one
              </button>
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((rule) => (
                <AutomationCard
                  key={rule.id}
                  rule={rule}
                  onToggle={(enabled) => patchRule(rule.id, { enabled })}
                  onEdit={() => setEditingId(rule.id)}
                  onRemove={rule.builtin ? undefined : () => removeRule(rule.id)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <AutomationRuleSidebar
        rule={editingRule}
        smsTemplates={smsTemplates}
        emailTemplates={emailTemplates}
        onClose={() => setEditingId(null)}
        onPatch={patchRule}
        onRemove={removeRule}
      />
    </div>
  );
}

function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            value === option.id
              ? "border-brand-200 bg-brand-50 text-brand-800"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SettingsPanel({
  rules,
  escalateOverdueAfterHours,
  onEscalateChange,
}: {
  rules: PipelineAutomationRule[];
  escalateOverdueAfterHours: number;
  onEscalateChange: (hours: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Quadrant behavior and follow-up board settings. Individual rules live under the Rules tab.
      </p>

      <QuadrantAutomationsSection rules={rules} />

      <SetupAccordion
        title="Follow-Ups board"
        description="When overdue tasks escalate on the board and topbar."
      >
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Mark urgent when overdue</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Hours after the due date before a task shows as urgent.
            </p>
          </div>
          <HoursStepper value={escalateOverdueAfterHours} onChange={onEscalateChange} />
        </div>
      </SetupAccordion>

      <div className="flex gap-2 rounded-lg border border-brand-100 bg-brand-50/40 px-3 py-2.5 text-xs text-brand-900">
        <Settings2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <p>
          Live SMS and email require Twilio and SMTP integrations. Day-before crew messages send
          after dispatch is published.
        </p>
      </div>
    </div>
  );
}
