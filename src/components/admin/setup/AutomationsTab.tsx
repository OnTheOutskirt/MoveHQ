"use client";

import { AutomationRuleEditor } from "@/components/admin/setup/AutomationRuleEditor";
import { HoursStepper } from "@/components/admin/setup/automation-ui";
import { QuadrantAutomationsSection } from "@/components/admin/setup/QuadrantAutomationsSection";
import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { TabBar } from "@/components/shared/TabBar";
import { Button } from "@/components/ui/Button";
import { getMessageTemplates } from "@/lib/communications/message-templates";
import {
  addCustomPipelineAutomationRule,
  AUTOMATION_CATEGORY_LABELS,
  AUTOMATION_SECTION_LABELS,
  AUTOMATION_WORKSPACE_LABELS,
  AUTOMATION_WORKSPACE_SECTIONS,
  defaultActionsForCategory,
  defaultSectionForWorkspace,
  filterWorkspaceRulesByCategory,
  patchPipelineAutomationRule,
  removePipelineAutomationRule,
  workspaceForSection,
  type AutomationActionKind,
  type AutomationRuleCategory,
  type AutomationSectionId,
  type AutomationWorkspaceId,
  type PipelineAutomationRule,
} from "@/lib/settings/pipeline-automation-rules";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";
import { cn } from "@/lib/utils";
import { Bell, ListTodo, MessageSquare, Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const WORKSPACE_TABS = [
  { id: "sales" as const, label: AUTOMATION_WORKSPACE_LABELS.sales },
  { id: "ops" as const, label: AUTOMATION_WORKSPACE_LABELS.ops },
  { id: "post_move" as const, label: AUTOMATION_WORKSPACE_LABELS.post_move },
  { id: "settings" as const, label: "Settings" },
];

const CATEGORY_TABS: {
  id: AutomationRuleCategory;
  label: string;
  icon: typeof ListTodo;
}[] = [
  { id: "follow_ups", label: AUTOMATION_CATEGORY_LABELS.follow_ups, icon: ListTodo },
  { id: "messages", label: AUTOMATION_CATEGORY_LABELS.messages, icon: MessageSquare },
  { id: "internal", label: AUTOMATION_CATEGORY_LABELS.internal, icon: Bell },
];

const WORKSPACE_INTRO: Record<Exclude<AutomationWorkspaceId, "settings">, string> = {
  sales: "Lead intake, quotes, contracts, and nurture while a move is still in sales.",
  ops: "Booking prep, day-before crew messages, move-day confirmations, and crew alerts.",
  post_move: "Reviews and close-out after the move is completed.",
};

type RuleWorkspace = Exclude<AutomationWorkspaceId, "settings">;

export function AutomationsTab() {
  const { value: pipelineAutomations, update: updatePipelineAutomations } =
    useSettingsSection("pipelineAutomations");
  const { value: followUps, update: updateFollowUps } = useSettingsSection("followUps");

  const [workspace, setWorkspace] = useState<AutomationWorkspaceId>("sales");
  const [category, setCategory] = useState<AutomationRuleCategory>("follow_ups");
  const [focusRuleId, setFocusRuleId] = useState<string | null>(null);

  const templates = useMemo(() => getMessageTemplates(), []);
  const smsTemplates = templates.filter(
    (t) => t.channel === "sms" && (t.category ?? "sales") === "automations",
  );
  const emailTemplates = templates.filter(
    (t) => t.channel === "email" && (t.category ?? "sales") === "automations",
  );

  const rulesWorkspace = workspace === "settings" ? null : workspace;

  const visibleRules = useMemo(() => {
    if (!rulesWorkspace) return [];
    return filterWorkspaceRulesByCategory(pipelineAutomations.rules, rulesWorkspace, category);
  }, [pipelineAutomations.rules, rulesWorkspace, category]);

  const rulesBySection = useMemo(() => {
    if (!rulesWorkspace) return [];
    const sections = AUTOMATION_WORKSPACE_SECTIONS[rulesWorkspace];
    return sections
      .map((sectionId) => ({
        sectionId,
        rules: visibleRules.filter((r) => r.section === sectionId),
      }))
      .filter((group) => group.rules.length > 0);
  }, [visibleRules, rulesWorkspace]);

  const categoryCounts = useMemo(() => {
    if (!rulesWorkspace) return null;
    return Object.fromEntries(
      CATEGORY_TABS.map((tab) => {
        const rules = filterWorkspaceRulesByCategory(
          pipelineAutomations.rules,
          rulesWorkspace,
          tab.id,
        );
        return [tab.id, { on: rules.filter((r) => r.enabled).length, total: rules.length }];
      }),
    ) as Record<AutomationRuleCategory, { on: number; total: number }>;
  }, [pipelineAutomations.rules, rulesWorkspace]);

  useEffect(() => {
    if (!focusRuleId) return;
    const rule = pipelineAutomations.rules.find((r) => r.id === focusRuleId);
    if (!rule) return;
    setWorkspace(workspaceForSection(rule.section));
  }, [focusRuleId, pipelineAutomations.rules]);

  function patchRule(ruleId: string, patch: Partial<PipelineAutomationRule>) {
    updatePipelineAutomations(patchPipelineAutomationRule(pipelineAutomations, ruleId, patch));
  }

  function toggleAction(rule: PipelineAutomationRule, action: AutomationActionKind) {
    const has = rule.actions.includes(action);
    const next = has ? rule.actions.filter((a) => a !== action) : [...rule.actions, action];
    if (next.length === 0) return;
    patchRule(rule.id, { actions: next });
  }

  function addCustomRule() {
    if (!rulesWorkspace) return;
    const { settings, ruleId } = addCustomPipelineAutomationRule(pipelineAutomations, {
      label: "New automation",
      section: defaultSectionForWorkspace(rulesWorkspace),
      trigger: "stage_enter",
      stage: rulesWorkspace === "ops" ? "booked" : "waiting",
      actions: defaultActionsForCategory(category),
      followUpTitle: category === "follow_ups" ? "Follow up" : undefined,
      followUpChannel: category === "follow_ups" ? "call" : undefined,
      delayDays: category === "follow_ups" ? 1 : undefined,
    });
    updatePipelineAutomations(settings);
    setFocusRuleId(ruleId);
  }

  function removeCustomRule(ruleId: string) {
    updatePipelineAutomations(removePipelineAutomationRule(pipelineAutomations, ruleId));
    if (focusRuleId === ruleId) setFocusRuleId(null);
  }

  function handleWorkspaceChange(next: AutomationWorkspaceId) {
    setWorkspace(next);
    setFocusRuleId(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Automations</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Rules run when something happens on a move — follow-up tasks, customer messages, or
          internal alerts. Message templates live under{" "}
          <Link
            href="/admin/setup?tab=messages"
            className="font-medium text-brand-600 hover:underline"
          >
            Email &amp; SMS
          </Link>
          .
        </p>
      </div>

      <TabBar tabs={WORKSPACE_TABS} activeTab={workspace} onChange={handleWorkspaceChange} />

      {workspace === "settings" ? (
        <SettingsPanel
          rules={pipelineAutomations.rules}
          escalateOverdueAfterHours={followUps.escalateOverdueAfterHours}
          onEscalateChange={(v) => updateFollowUps({ escalateOverdueAfterHours: v })}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-2xl text-sm text-slate-600">{WORKSPACE_INTRO[workspace]}</p>
            <Button type="button" size="sm" className="shrink-0 gap-1" onClick={addCustomRule}>
              <Plus className="h-3.5 w-3.5" />
              Add rule
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const count = categoryCounts?.[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCategory(tab.id);
                    setFocusRuleId(null);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    category === tab.id
                      ? "border-brand-200 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 opacity-70" />
                  {tab.label}
                  {count ? (
                    <span className="text-xs tabular-nums text-slate-500">
                      {count.on}/{count.total}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {rulesBySection.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
              No {AUTOMATION_CATEGORY_LABELS[category].toLowerCase()} in{" "}
              {AUTOMATION_WORKSPACE_LABELS[workspace].toLowerCase()} yet.{" "}
              <button
                type="button"
                onClick={addCustomRule}
                className="font-medium text-brand-600 hover:underline"
              >
                Add one
              </button>
            </p>
          ) : (
            <div className="space-y-5">
              {rulesBySection.map(({ sectionId, rules }) => (
                <section key={sectionId}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {AUTOMATION_SECTION_LABELS[sectionId]}
                  </h3>
                  <ul className="space-y-2">
                    {rules.map((rule) => (
                      <AutomationRuleEditor
                        key={rule.id}
                        rule={rule}
                        category={category}
                        sectionOptions={AUTOMATION_WORKSPACE_SECTIONS[workspace]}
                        smsTemplates={smsTemplates}
                        emailTemplates={emailTemplates}
                        startExpanded={focusRuleId === rule.id}
                        highlight={focusRuleId === rule.id}
                        onPatch={(patch) => patchRule(rule.id, patch)}
                        onToggleAction={(action) => toggleAction(rule, action)}
                        onRemove={
                          rule.builtin ? undefined : () => removeCustomRule(rule.id)
                        }
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
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
        Quadrant behavior and follow-up board settings. Individual rules are configured under Sales,
        Operations, and After move.
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
