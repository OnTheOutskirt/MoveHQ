import { useOptionalSettingsDraft } from "@/components/providers/SettingsDraftProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import type { AppSettings } from "@/lib/settings/types";
import type { TerminologySettings } from "@/lib/terminology/types";

/** Use draft state when inside SettingsDraftProvider; otherwise live settings (auto-save). */
export function useSettingsEditor() {
  const draft = useOptionalSettingsDraft();
  const live = useSettings();

  if (draft) {
    return {
      settings: draft.draft,
      updateBranding: draft.updateBranding,
      updateCompany: draft.updateCompany,
      updateDefaults: draft.updateDefaults,
      updateTerminology: draft.updateTerminology,
      updateAutomations: draft.updateAutomations,
      updateFollowUps: draft.updateFollowUps,
      updatePipelineCopy: draft.updatePipelineCopy,
      updateFieldCatalog: draft.updateFieldCatalog,
      updatePriorityTierRules: draft.updatePriorityTierRules,
      updatePipelineAutomations: draft.updatePipelineAutomations,
      updateLeadRouting: draft.updateLeadRouting,
      updateMoveTypeRules: draft.updateMoveTypeRules,
      isDraft: true as const,
    };
  }

  return {
    settings: live.settings,
    updateBranding: live.updateBranding,
    updateCompany: live.updateCompany,
    updateDefaults: live.updateDefaults,
    updateTerminology: live.updateTerminology,
    updateAutomations: live.updateAutomations,
    updateFollowUps: live.updateFollowUps,
    updatePipelineCopy: live.updatePipelineCopy,
    updateFieldCatalog: live.updateFieldCatalog,
    updatePriorityTierRules: live.updatePriorityTierRules,
    updatePipelineAutomations: live.updatePipelineAutomations,
    updateLeadRouting: live.updateLeadRouting,
    updateMoveTypeRules: live.updateMoveTypeRules,
    isDraft: false as const,
  };
}

export function useSettingsSection<K extends keyof AppSettings>(key: K) {
  const editor = useSettingsEditor();
  return {
    value: editor.settings[key],
    update: (patch: Partial<AppSettings[K]>) => {
      const map = {
        branding: editor.updateBranding,
        company: editor.updateCompany,
        defaults: editor.updateDefaults,
        terminology: editor.updateTerminology,
        automations: editor.updateAutomations,
        followUps: editor.updateFollowUps,
        pipelineCopy: editor.updatePipelineCopy,
        fieldCatalog: editor.updateFieldCatalog,
        priorityTierRules: editor.updatePriorityTierRules,
        pipelineAutomations: editor.updatePipelineAutomations,
        leadRouting: editor.updateLeadRouting,
        moveTypeRules: editor.updateMoveTypeRules,
      } as const;
      (map[key] as (p: Partial<AppSettings[K]>) => void)(patch);
    },
  };
}

export function useTerminologyEditor() {
  const editor = useSettingsEditor();
  return {
    terminology: editor.settings.terminology,
    updateTerminology: editor.updateTerminology,
  };
}
