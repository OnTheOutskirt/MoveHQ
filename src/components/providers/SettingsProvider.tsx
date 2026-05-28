"use client";

import { defaultSettings } from "@/lib/settings/defaults";
import { applyBrandingMeta, applyBrandingToDocument } from "@/lib/settings/apply-branding";
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
  resetSettings: () => void;
  isReady: boolean;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function commit(next: AppSettings) {
  saveSettings(next);
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
      resetSettings,
      isReady,
    }),
    [
      settings,
      updateBranding,
      updateCompany,
      updateDefaults,
      updateTerminology,
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
