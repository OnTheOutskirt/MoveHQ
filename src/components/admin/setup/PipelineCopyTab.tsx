"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { SettingsField, SettingsInput, SettingsTextarea } from "@/components/settings/SettingsField";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";

export function PipelineCopyTab() {
  const { value: pipelineCopy, update } = useSettingsSection("pipelineCopy");
  const { value: fieldCatalog } = useSettingsSection("fieldCatalog");

  const stages = fieldCatalog.pipelineStages;
  const waitingSubs = fieldCatalog.waitingSubstages;

  function patchStage(stageId: string, field: "label" | "detail", text: string) {
    update({
      byStage: {
        ...pipelineCopy.byStage,
        [stageId]: {
          label: pipelineCopy.byStage[stageId as keyof typeof pipelineCopy.byStage]?.label ?? "",
          detail: pipelineCopy.byStage[stageId as keyof typeof pipelineCopy.byStage]?.detail,
          [field]: text,
        },
      },
    });
  }

  function patchWaiting(subId: string, field: "label" | "detail", text: string) {
    update({
      waitingBySubstage: {
        ...pipelineCopy.waitingBySubstage,
        [subId]: {
          label:
            pipelineCopy.waitingBySubstage[subId as keyof typeof pipelineCopy.waitingBySubstage]?.label ?? "",
          detail:
            pipelineCopy.waitingBySubstage[subId as keyof typeof pipelineCopy.waitingBySubstage]?.detail,
          [field]: text,
        },
      },
    });
  }

  return (
    <div className="space-y-4">
      <SetupAccordion
        title="Up next copy"
        description="Text shown in the move detail banner for each pipeline stage. Save changes from the bar below."
        count={stages.length}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/40 p-3"
            >
              <p className="text-sm font-medium text-slate-900">{stage.label}</p>
              <SettingsField label="Headline">
                <SettingsInput
                  value={pipelineCopy.byStage[stage.id as keyof typeof pipelineCopy.byStage]?.label ?? ""}
                  onChange={(e) => patchStage(stage.id, "label", e.target.value)}
                />
              </SettingsField>
              <SettingsField label="Detail (optional)">
                <SettingsTextarea
                  value={pipelineCopy.byStage[stage.id as keyof typeof pipelineCopy.byStage]?.detail ?? ""}
                  onChange={(e) => patchStage(stage.id, "detail", e.target.value)}
                  className="min-h-[4rem]"
                />
              </SettingsField>
            </div>
          ))}
        </div>
      </SetupAccordion>

      <SetupAccordion
        title="Waiting substages"
        description="Banner copy when a move is in Waiting — overrides the generic Waiting headline."
        count={waitingSubs.length}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {waitingSubs.map((sub) => (
            <div
              key={sub.id}
              className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/40 p-3"
            >
              <p className="text-sm font-medium text-slate-900">{sub.label}</p>
              <SettingsField label="Headline">
                <SettingsInput
                  value={
                    pipelineCopy.waitingBySubstage[sub.id as keyof typeof pipelineCopy.waitingBySubstage]
                      ?.label ?? ""
                  }
                  onChange={(e) => patchWaiting(sub.id, "label", e.target.value)}
                />
              </SettingsField>
              <SettingsField label="Detail (optional)">
                <SettingsTextarea
                  value={
                    pipelineCopy.waitingBySubstage[sub.id as keyof typeof pipelineCopy.waitingBySubstage]
                      ?.detail ?? ""
                  }
                  onChange={(e) => patchWaiting(sub.id, "detail", e.target.value)}
                  className="min-h-[3rem]"
                />
              </SettingsField>
            </div>
          ))}
        </div>
      </SetupAccordion>
    </div>
  );
}
