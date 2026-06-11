"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { SettingsInput } from "@/components/settings/SettingsField";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";

const COMPACT_INPUT =
  "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

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
    <div className="space-y-2">
      <SetupAccordion
        title="Up next copy"
        description="Banner text on move detail — per stage and per waiting substage."
        count={stages.length + waitingSubs.length}
      >
        <CopyEntryTable
          entries={stages.map((stage) => ({
            id: stage.id,
            label: stage.label,
            headline:
              pipelineCopy.byStage[stage.id as keyof typeof pipelineCopy.byStage]?.label ?? "",
            detail:
              pipelineCopy.byStage[stage.id as keyof typeof pipelineCopy.byStage]?.detail ?? "",
            onHeadline: (text) => patchStage(stage.id, "label", text),
            onDetail: (text) => patchStage(stage.id, "detail", text),
          }))}
        />

        {waitingSubs.length > 0 ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              When in Waiting
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Substages are defined above — set banner copy for each here.
            </p>
            <div className="mt-2">
              <CopyEntryTable
                entries={waitingSubs.map((sub) => ({
                  id: sub.id,
                  label: sub.label,
                  headline:
                    pipelineCopy.waitingBySubstage[
                      sub.id as keyof typeof pipelineCopy.waitingBySubstage
                    ]?.label ?? "",
                  detail:
                    pipelineCopy.waitingBySubstage[
                      sub.id as keyof typeof pipelineCopy.waitingBySubstage
                    ]?.detail ?? "",
                  onHeadline: (text) => patchWaiting(sub.id, "label", text),
                  onDetail: (text) => patchWaiting(sub.id, "detail", text),
                }))}
              />
            </div>
          </div>
        ) : null}
      </SetupAccordion>
    </div>
  );
}

type CopyEntry = {
  id: string;
  label: string;
  headline: string;
  detail: string;
  onHeadline: (text: string) => void;
  onDetail: (text: string) => void;
};

function CopyEntryTable({ entries }: { entries: CopyEntry[] }) {
  return (
    <>
      <div
        className="mb-1.5 hidden gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:grid"
        style={{ gridTemplateColumns: "8rem minmax(8rem,1.2fr) minmax(10rem,2fr)" }}
      >
        <span>Stage</span>
        <span>Headline</span>
        <span>Detail</span>
      </div>
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap items-center gap-2 px-2.5 py-1.5 sm:grid sm:gap-2"
            style={{ gridTemplateColumns: "8rem minmax(8rem,1.2fr) minmax(10rem,2fr)" }}
          >
            <span className="truncate text-sm font-medium text-slate-800">{entry.label}</span>
            <SettingsInput
              value={entry.headline}
              onChange={(e) => entry.onHeadline(e.target.value)}
              placeholder="Headline"
              className={COMPACT_INPUT}
              aria-label={`${entry.label} headline`}
            />
            <SettingsInput
              value={entry.detail}
              onChange={(e) => entry.onDetail(e.target.value)}
              placeholder="Detail (optional)"
              className={COMPACT_INPUT}
              aria-label={`${entry.label} detail`}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
