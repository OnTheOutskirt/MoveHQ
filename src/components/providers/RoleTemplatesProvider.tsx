"use client";

import {
  defaultRoleTemplateSettings,
  normalizeRoleTemplateSettings,
  resetRoleTemplateLevel,
  setRoleTemplateCapability,
  type RoleLocationAccess,
  type RoleTemplateSettings,
} from "@/lib/team/role-templates";
import { loadRoleTemplates, saveRoleTemplates } from "@/lib/team/role-templates-storage";
import type { Capability } from "@/lib/auth/capabilities";
import type { PermissionLevel } from "@/lib/team/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type RoleTemplatesContextValue = {
  templates: RoleTemplateSettings;
  isReady: boolean;
  setCapability: (level: PermissionLevel, cap: Capability, enabled: boolean) => void;
  setLocationAccess: (level: PermissionLevel, access: RoleLocationAccess) => void;
  resetLevel: (level: PermissionLevel) => void;
  resetAll: () => void;
  locationDefaultForLevel: (level: PermissionLevel) => RoleLocationAccess;
};

const RoleTemplatesContext = createContext<RoleTemplatesContextValue | null>(null);

export function RoleTemplatesProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<RoleTemplateSettings>(() =>
    defaultRoleTemplateSettings(),
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTemplates(loadRoleTemplates());
    setIsReady(true);
  }, []);

  const persist = useCallback((next: RoleTemplateSettings) => {
    const normalized = normalizeRoleTemplateSettings(next);
    setTemplates(normalized);
    saveRoleTemplates(normalized);
  }, []);

  const setCapability = useCallback(
    (level: PermissionLevel, cap: Capability, enabled: boolean) => {
      setTemplates((prev) => {
        const next = setRoleTemplateCapability(prev, level, cap, enabled);
        saveRoleTemplates(next);
        return next;
      });
    },
    [],
  );

  const setLocationAccess = useCallback((level: PermissionLevel, access: RoleLocationAccess) => {
    setTemplates((prev) => {
      const next = {
        ...prev,
        locationAccess: { ...prev.locationAccess, [level]: access },
      };
      saveRoleTemplates(next);
      return next;
    });
  }, []);

  const resetLevel = useCallback((level: PermissionLevel) => {
    setTemplates((prev) => {
      const next = resetRoleTemplateLevel(prev, level);
      saveRoleTemplates(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    persist(defaultRoleTemplateSettings());
  }, [persist]);

  const locationDefaultForLevel = useCallback(
    (level: PermissionLevel) =>
      templates.locationAccess[level] ?? defaultRoleTemplateSettings().locationAccess[level]!,
    [templates],
  );

  const value = useMemo(
    () => ({
      templates,
      isReady,
      setCapability,
      setLocationAccess,
      resetLevel,
      resetAll,
      locationDefaultForLevel,
    }),
    [templates, isReady, setCapability, setLocationAccess, resetLevel, resetAll, locationDefaultForLevel],
  );

  return (
    <RoleTemplatesContext.Provider value={value}>{children}</RoleTemplatesContext.Provider>
  );
}

export function useRoleTemplates() {
  const ctx = useContext(RoleTemplatesContext);
  if (!ctx) throw new Error("useRoleTemplates must be used within RoleTemplatesProvider");
  return ctx;
}
