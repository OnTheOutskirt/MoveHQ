"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DEFAULT_TERMINOLOGY } from "@/lib/terminology/defaults";
import { roleInitial, roleSingular } from "@/lib/terminology/labels";
import { mergeTerminology, normalizeTerminology } from "@/lib/terminology/normalize";
import type { CrewRoleKind, RoleTerm } from "@/lib/terminology/types";

const ROLE_META: Record<
  CrewRoleKind,
  { title: string; hint: string; defaultSingular: string; defaultPlural: string }
> = {
  skipper: {
    title: "Lead / crew lead role",
    hint: "Who runs the job on site. Default industry term is often “Lead” or “Crew Lead”; Jonah's uses Skipper.",
    defaultSingular: "Lead",
    defaultPlural: "Leads",
  },
  driver: {
    title: "Driver role",
    hint: "Licensed driver assigned to a truck. Some companies use other titles.",
    defaultSingular: "Driver",
    defaultPlural: "Drivers",
  },
  mover: {
    title: "Mover / helper role",
    hint: "Field crew who load and unload. Often called Mover or Helper.",
    defaultSingular: "Mover",
    defaultPlural: "Movers",
  },
};

const ROLE_ORDER: CrewRoleKind[] = ["skipper", "driver", "mover"];

export function TerminologyTab() {
  const { settings, updateTerminology } = useSettings();
  const terms = normalizeTerminology(settings.terminology);

  function patchRole(role: CrewRoleKind, patch: Partial<RoleTerm>) {
    updateTerminology(
      mergeTerminology({
        [role]: { ...terms[role], ...patch },
      }),
    );
  }

  function resetAll() {
    updateTerminology(DEFAULT_TERMINOLOGY);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crew role terminology</CardTitle>
          <p className="text-sm text-slate-500">
            Labels and abbreviations used across dispatch, calendar, crew roster, and team
            directory. Plural forms are used for counts (e.g. “2 Skippers left”).
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {ROLE_ORDER.map((role) => {
            const meta = ROLE_META[role];
            const term = terms[role];
            return (
              <div
                key={role}
                className="grid gap-4 border-b border-slate-100 pb-8 last:border-0 last:pb-0"
              >
                <div>
                  <h3 className="font-medium text-slate-900">{meta.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{meta.hint}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsField
                    label="Singular"
                    hint={`Default: ${meta.defaultSingular}`}
                  >
                    <SettingsInput
                      value={term.singular}
                      onChange={(e) => patchRole(role, { singular: e.target.value })}
                      placeholder={meta.defaultSingular}
                    />
                  </SettingsField>
                  <SettingsField label="Plural" hint={`Default: ${meta.defaultPlural}`}>
                    <SettingsInput
                      value={term.plural}
                      onChange={(e) => patchRole(role, { plural: e.target.value })}
                      placeholder={meta.defaultPlural}
                    />
                  </SettingsField>
                </div>
                <p className="text-xs text-slate-500">
                  Preview:{" "}
                  <span className="font-medium text-slate-700">
                    {roleSingular(terms, role)} · {terms[role].plural} · badge{" "}
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-100 font-semibold text-slate-800">
                      {roleInitial(terms, role)}
                    </span>
                  </span>
                </p>
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={resetAll}>
              Reset to Jonah&apos;s defaults (Skipper, Driver, Mover)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
