"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import type { AppSettings } from "@/lib/settings/types";
import type { FieldCatalogSettings } from "@/lib/settings/field-catalog-types";
import { syncFieldCatalogRuntime } from "@/lib/settings/field-catalog-runtime";
import { mergeTerminology } from "@/lib/terminology/normalize";
import type { TerminologySettings } from "@/lib/terminology/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SettingsDraftContextValue = {
  draft: AppSettings;
  dirty: boolean;
  save: () => void;
  discard: () => void;
  updateBranding: (patch: Partial<AppSettings["branding"]>) => void;
  updateCompany: (patch: Partial<AppSettings["company"]>) => void;
  updateDefaults: (patch: Partial<AppSettings["defaults"]>) => void;
  updateTerminology: (patch: Partial<TerminologySettings>) => void;
  updateAutomations: (patch: Partial<AppSettings["automations"]>) => void;
  updateFollowUps: (patch: Partial<AppSettings["followUps"]>) => void;
  updatePipelineCopy: (patch: Partial<AppSettings["pipelineCopy"]>) => void;
  updateFieldCatalog: (patch: Partial<FieldCatalogSettings>) => void;
  replaceDraft: (next: AppSettings) => void;
};

const SettingsDraftContext = createContext<SettingsDraftContextValue | null>(null);

function settingsSnapshot(s: AppSettings): string {
  return JSON.stringify(s);
}

export function SettingsDraftProvider({ children }: { children: React.ReactNode }) {
  const { settings, replaceSettings, isReady } = useSettings();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [savedSnapshot, setSavedSnapshot] = useState(() => settingsSnapshot(settings));

  useEffect(() => {
    if (!isReady) return;
    setDraft(settings);
    setSavedSnapshot(settingsSnapshot(settings));
    syncFieldCatalogRuntime(settings.fieldCatalog);
  }, [settings, isReady]);

  const dirty = settingsSnapshot(draft) !== savedSnapshot;

  const save = useCallback(() => {
    replaceSettings(draft);
    syncFieldCatalogRuntime(draft.fieldCatalog);
    setSavedSnapshot(settingsSnapshot(draft));
  }, [draft, replaceSettings]);

  const discard = useCallback(() => {
    setDraft(settings);
    setSavedSnapshot(settingsSnapshot(settings));
    syncFieldCatalogRuntime(settings.fieldCatalog);
  }, [settings]);

  const updateBranding = useCallback((patch: Partial<AppSettings["branding"]>) => {
    setDraft((prev) => ({ ...prev, branding: { ...prev.branding, ...patch } }));
  }, []);

  const updateCompany = useCallback((patch: Partial<AppSettings["company"]>) => {
    setDraft((prev) => ({ ...prev, company: { ...prev.company, ...patch } }));
  }, []);

  const updateDefaults = useCallback((patch: Partial<AppSettings["defaults"]>) => {
    setDraft((prev) => ({ ...prev, defaults: { ...prev.defaults, ...patch } }));
  }, []);

  const updateTerminology = useCallback((patch: Partial<TerminologySettings>) => {
    setDraft((prev) => ({
      ...prev,
      terminology: mergeTerminology(patch, prev.terminology),
    }));
  }, []);

  const updateAutomations = useCallback((patch: Partial<AppSettings["automations"]>) => {
    setDraft((prev) => ({ ...prev, automations: { ...prev.automations, ...patch } }));
  }, []);

  const updateFollowUps = useCallback((patch: Partial<AppSettings["followUps"]>) => {
    setDraft((prev) => ({ ...prev, followUps: { ...prev.followUps, ...patch } }));
  }, []);

  const updatePipelineCopy = useCallback((patch: Partial<AppSettings["pipelineCopy"]>) => {
    setDraft((prev) => ({
      ...prev,
      pipelineCopy: {
        byStage: { ...prev.pipelineCopy.byStage, ...patch.byStage },
        waitingBySubstage: {
          ...prev.pipelineCopy.waitingBySubstage,
          ...patch.waitingBySubstage,
        },
      },
    }));
  }, []);

  const updateFieldCatalog = useCallback((patch: Partial<FieldCatalogSettings>) => {
    setDraft((prev) => {
      const nextCatalog = { ...prev.fieldCatalog, ...patch };
      syncFieldCatalogRuntime(nextCatalog);
      return { ...prev, fieldCatalog: nextCatalog };
    });
  }, []);

  const replaceDraft = useCallback((next: AppSettings) => {
    setDraft(next);
  }, []);

  const value = useMemo(
    () => ({
      draft,
      dirty,
      save,
      discard,
      updateBranding,
      updateCompany,
      updateDefaults,
      updateTerminology,
      updateAutomations,
      updateFollowUps,
      updatePipelineCopy,
      updateFieldCatalog,
      replaceDraft,
    }),
    [
      draft,
      dirty,
      save,
      discard,
      updateBranding,
      updateCompany,
      updateDefaults,
      updateTerminology,
      updateAutomations,
      updateFollowUps,
      updatePipelineCopy,
      updateFieldCatalog,
      replaceDraft,
    ],
  );

  return (
    <SettingsDraftContext.Provider value={value}>{children}</SettingsDraftContext.Provider>
  );
}

export function useSettingsDraft() {
  const ctx = useContext(SettingsDraftContext);
  if (!ctx) throw new Error("useSettingsDraft must be used within SettingsDraftProvider");
  return ctx;
}

export function useOptionalSettingsDraft() {
  return useContext(SettingsDraftContext);
}
