"use client";

import { SetupAccordion } from "@/components/admin/setup/SetupAccordion";
import { useTerminologyEditor } from "@/lib/settings/use-settings-editor";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { DEFAULT_TERMINOLOGY } from "@/lib/terminology/defaults";
import { roleInitial, roleSingular } from "@/lib/terminology/labels";
import { mergeTerminology } from "@/lib/terminology/normalize";
import type { CrewRoleKind, RoleTerm } from "@/lib/terminology/types";

const ROLE_LABELS: Record<CrewRoleKind, string> = {
  skipper: "Lead",
  driver: "Driver",
  mover: "Mover",
};

const ROLE_ORDER: CrewRoleKind[] = ["skipper", "driver", "mover"];

export function TerminologyTab() {
  const { terminology, updateTerminology } = useTerminologyEditor();

  function patchRole(role: CrewRoleKind, patch: Partial<RoleTerm>) {
    updateTerminology(
      mergeTerminology(
        {
          [role]: { ...terminology[role], ...patch },
        },
        terminology,
      ),
    );
  }

  function resetAll() {
    updateTerminology(DEFAULT_TERMINOLOGY);
  }

  return (
    <div className="space-y-6">
      <SetupAccordion title="Crew role labels" defaultOpen={false}>
        <div className="space-y-6">
          {ROLE_ORDER.map((role) => {
            const term = terminology[role];
            return (
              <div
                key={role}
                className="space-y-3 border-b border-slate-100 pb-6 last:border-0 last:pb-0"
              >
                <h3 className="text-sm font-medium text-slate-900">{ROLE_LABELS[role]}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsField label="Singular">
                    <SettingsInput
                      value={term.singular}
                      onChange={(e) => patchRole(role, { singular: e.target.value })}
                    />
                  </SettingsField>
                  <SettingsField label="Plural">
                    <SettingsInput
                      value={term.plural}
                      onChange={(e) => patchRole(role, { plural: e.target.value })}
                    />
                  </SettingsField>
                </div>
                <p className="text-xs text-slate-500">
                  {roleSingular(terminology, role)} · {terminology[role].plural || "—"} ·{" "}
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-100 font-semibold text-slate-800">
                    {roleInitial(terminology, role)}
                  </span>
                </p>
              </div>
            );
          })}
          <Button type="button" variant="secondary" size="sm" onClick={resetAll}>
            Reset to defaults
          </Button>
        </div>
      </SetupAccordion>
    </div>
  );
}
