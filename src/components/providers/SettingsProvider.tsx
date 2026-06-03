"use client";

import { defaultSettings } from "@/lib/settings/defaults";
import { applyBrandingMeta, applyBrandingToDocument } from "@/lib/settings/apply-branding";
import { syncFieldCatalogRuntime } from "@/lib/settings/field-catalog-runtime";
import type { FieldCatalogSettings } from "@/lib/settings/field-catalog-types";
import { loadSettings, saveSettings } from "@/lib/settings/storage";
import { mergeTerminology } from "@/lib/terminology/normalize";
import type { TerminologySettings } from "@/lib/terminology/types";
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
  replaceSettings: (next: AppSettings) => void;
  resetSettings: () => void;
  isReady: boolean;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function commit(next: AppSettings) {
  saveSettings(next);
  syncFieldCatalogRuntime(next.fieldCatalog);
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
