"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { jobCrewSlots } from "@/lib/dispatch/crew-slots";
import type { DispatchJob } from "@/lib/dispatch/types";
import type { CrewRole } from "@/lib/dispatch/types";
import { normalizeTerminology } from "@/lib/terminology/normalize";
import {
  formatCrewRoles,
  roleCountWord,
  roleInitial,
  roleLeftHeading,
  rolePlural,
  roleQuantityLabel,
  roleSingular,
  roleSlotLabel,
} from "@/lib/terminology/labels";
import type { CrewRoleKind, TerminologySettings } from "@/lib/terminology/types";
import { useCallback, useMemo } from "react";

export function useTerminology() {
  const { settings, updateTerminology } = useSettings();
  const terminology = useMemo(
    () => normalizeTerminology(settings.terminology),
    [settings.terminology],
  );

  const label = useCallback(
    (role: CrewRoleKind) => roleSingular(terminology, role),
    [terminology],
  );
  const plural = useCallback(
    (role: CrewRoleKind) => rolePlural(terminology, role),
    [terminology],
  );
  const initial = useCallback(
    (role: CrewRoleKind) => roleInitial(terminology, role),
    [terminology],
  );
  const countWord = useCallback(
    (role: CrewRoleKind, count: number) => roleCountWord(terminology, role, count),
    [terminology],
  );
  const quantityLabel = useCallback(
    (role: CrewRoleKind, count: number) => roleQuantityLabel(terminology, role, count),
    [terminology],
  );
  const leftHeading = useCallback(
    (role: CrewRoleKind) => roleLeftHeading(terminology, role),
    [terminology],
  );
  const formatRoles = useCallback(
    (roles: CrewRole[]) => formatCrewRoles(roles, terminology),
    [terminology],
  );
  const slotsForJob = useCallback(
    (job: DispatchJob) => jobCrewSlots(job, terminology),
    [terminology],
  );

  return useMemo(
    () => ({
      terminology,
      updateTerminology,
      label,
      plural,
      initial,
      countWord,
      quantityLabel,
      leftHeading,
      formatRoles,
      slotsForJob,
    }),
    [
      terminology,
      updateTerminology,
      label,
      plural,
      initial,
      countWord,
      quantityLabel,
      leftHeading,
      formatRoles,
      slotsForJob,
    ],
  );
}

export type TerminologyApi = Pick<
  ReturnType<typeof useTerminology>,
  | "terminology"
  | "label"
  | "plural"
  | "initial"
  | "countWord"
  | "quantityLabel"
  | "leftHeading"
  | "formatRoles"
  | "slotsForJob"
>;
