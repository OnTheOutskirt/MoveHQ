"use client";

import { defaultSettings } from "@/lib/settings/defaults";
import { applyBrandingMeta, applyBrandingToDocument } from "@/lib/settings/apply-branding";
import { syncFieldCatalogRuntime } from "@/lib/settings/field-catalog-runtime";
import { syncPipelineAutomationRuntime } from "@/lib/settings/pipeline-automation-runtime";
import { syncPriorityTierRulesRuntime } from "@/lib/settings/priority-tier-rules-runtime";
import type { PipelineAutomationSettings } from "@/lib/settings/pipeline-automation-rules";
import type { FieldCatalogSettings } from "@/lib/settings/field-catalog-types";
import { loadSettings, saveSettings } from "@/lib/settings/storage";
import { mergeTerminology } from "@/lib/terminology/normalize";
import type { TerminologySettings } from "@/lib/terminology/types";
import type { LeadRoutingSettings } from "@/lib/settings/lead-routing-rules";
import type { MoveTypeRulesSettings } from "@/lib/settings/move-type-rules";
import type { PriorityTierRulesSettings } from "@/lib/settings/priority-tier-rules";
import type { AppSettings } from "@/lib/settings/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SettingsContextValue = {
  settings: AppSettings;
  updateBranding: (patch: Partial<AppSettings["branding"]>) => void;
  updateCompany: (patch: Partial<AppSettings["company"]>) => void;
  updateDefaults: (patch: Partial<AppSettings["defaults"]>) => void;
  updateTerminology: (patch: Partial<TerminologySettings>) => void;
  updateAutomations: (patch: Partial<AppSettings["automations"]>) => void;
  updateFollowUps: (patch: Partial<AppSettings["followUps"]>) => void;
  updatePipelineCopy: (patch: Partial<AppSettings["pipelineCopy"]>) => void;
  updateFieldCatalog: (patch: Partial<FieldCatalogSettings>) => void;
  updatePriorityTierRules: (patch: Partial<PriorityTierRulesSettings>) => void;
  updatePipelineAutomations: (patch: Partial<PipelineAutomationSettings>) => void;
  updateLeadRouting: (patch: Partial<LeadRoutingSettings>) => void;
  updateMoveTypeRules: (patch: Partial<MoveTypeRulesSettings>) => void;
  replaceSettings: (next: AppSettings) => void;
  resetSettings: () => void;
  isReady: boolean;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function commit(next: AppSettings) {
  saveSettings(next);
  syncFieldCatalogRuntime(next.fieldCatalog);
  syncPriorityTierRulesRuntime(next.priorityTierRules);
  syncPipelineAutomationRuntime(next.pipelineAutomations);
  applyBrandingToDocument(next.branding);
  applyBrandingMeta(next.branding);
  return next;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    syncFieldCatalogRuntime(loaded.fieldCatalog);
    syncPriorityTierRulesRuntime(loaded.priorityTierRules);
    syncPipelineAutomationRuntime(loaded.pipelineAutomations);
    applyBrandingToDocument(loaded.branding);
    applyBrandingMeta(loaded.branding);
    setIsReady(true);
  }, []);

  const updateBranding = useCallback((patch: Partial<AppSettings["branding"]>) => {
    setSettings((prev) => commit({ ...prev, branding: { ...prev.branding, ...patch } }));
  }, []);

  const updateCompany = useCallback((patch: Partial<AppSettings["company"]>) => {
    setSettings((prev) => commit({ ...prev, company: { ...prev.company, ...patch } }));
  }, []);

  const updateDefaults = useCallback((patch: Partial<AppSettings["defaults"]>) => {
    setSettings((prev) => commit({ ...prev, defaults: { ...prev.defaults, ...patch } }));
  }, []);

  const updateTerminology = useCallback((patch: Partial<TerminologySettings>) => {
    setSettings((prev) =>
      commit({
        ...prev,
        terminology: mergeTerminology(patch, prev.terminology),
      }),
    );
  }, []);

  const updateAutomations = useCallback((patch: Partial<AppSettings["automations"]>) => {
    setSettings((prev) =>
      commit({ ...prev, automations: { ...prev.automations, ...patch } }),
    );
  }, []);

  const updateFollowUps = useCallback((patch: Partial<AppSettings["followUps"]>) => {
    setSettings((prev) => commit({ ...prev, followUps: { ...prev.followUps, ...patch } }));
  }, []);

  const updatePipelineCopy = useCallback((patch: Partial<AppSettings["pipelineCopy"]>) => {
    setSettings((prev) =>
      commit({
        ...prev,
        pipelineCopy: {
          byStage: { ...prev.pipelineCopy.byStage, ...patch.byStage },
          waitingBySubstage: {
            ...prev.pipelineCopy.waitingBySubstage,
            ...patch.waitingBySubstage,
          },
        },
      }),
    );
  }, []);

  const updateFieldCatalog = useCallback((patch: Partial<FieldCatalogSettings>) => {
    setSettings((prev) =>
      commit({
        ...prev,
        fieldCatalog: { ...prev.fieldCatalog, ...patch },
      }),
    );
  }, []);

  const updatePriorityTierRules = useCallback((patch: Partial<PriorityTierRulesSettings>) => {
    setSettings((prev) =>
      commit({
        ...prev,
        priorityTierRules: {
          ...prev.priorityTierRules,
          ...patch,
          followUpMode: {
            ...prev.priorityTierRules.followUpMode,
            ...patch.followUpMode,
          },
          tierDisplay: patch.tierDisplay
            ? {
                ...prev.priorityTierRules.tierDisplay,
                ...Object.fromEntries(
                  Object.entries(patch.tierDisplay).map(([tier, display]) => [
                    tier,
                    {
                      ...prev.priorityTierRules.tierDisplay[
                        tier as keyof typeof prev.priorityTierRules.tierDisplay
                      ],
                      ...display,
                    },
                  ]),
                ),
              }
            : prev.priorityTierRules.tierDisplay,
        },
      }),
    );
  }, []);

  const updatePipelineAutomations = useCallback(
    (patch: Partial<PipelineAutomationSettings>) => {
      setSettings((prev) =>
        commit({
          ...prev,
          pipelineAutomations: {
            ...prev.pipelineAutomations,
            ...patch,
            rules: patch.rules ?? prev.pipelineAutomations.rules,
          },
        }),
      );
    },
    [],
  );

  const updateLeadRouting = useCallback((patch: Partial<LeadRoutingSettings>) => {
    setSettings((prev) =>
      commit({
        ...prev,
        leadRouting: {
          ...prev.leadRouting,
          ...patch,
          rules: patch.rules ?? prev.leadRouting.rules,
        },
      }),
    );
  }, []);

  const updateMoveTypeRules = useCallback((patch: Partial<MoveTypeRulesSettings>) => {
    setSettings((prev) =>
      commit({
        ...prev,
        moveTypeRules: {
          ...prev.moveTypeRules,
          ...patch,
          byTypeId: patch.byTypeId ?? prev.moveTypeRules.byTypeId,
        },
      }),
    );
  }, []);

  const replaceSettings = useCallback((next: AppSettings) => {
    setSettings(commit(next));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(commit(defaultSettings));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateBranding,
      updateCompany,
      updateDefaults,
      updateTerminology,
      updateAutomations,
      updateFollowUps,
      updatePipelineCopy,
      updateFieldCatalog,
      updatePriorityTierRules,
      updatePipelineAutomations,
      updateLeadRouting,
      updateMoveTypeRules,
      replaceSettings,
      resetSettings,
      isReady,
    }),
    [
      settings,
      updateBranding,
      updateCompany,
      updateDefaults,
      updateTerminology,
      updateAutomations,
      updateFollowUps,
      updatePipelineCopy,
      updateFieldCatalog,
      updatePriorityTierRules,
      updatePipelineAutomations,
      updateLeadRouting,
      updateMoveTypeRules,
      replaceSettings,
      resetSettings,
      isReady,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
