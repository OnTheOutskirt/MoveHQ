"use client";

import { catalogVendorTypeLabel } from "@/lib/settings/field-catalog-runtime";
import {
  OPS_PREP_BUILTIN_RULE_LABELS,
  type OpsPrepBuiltinRuleId,
  type OpsPrepDueAnchor,
} from "@/lib/settings/ops-prep-rules";
import type { SetupOperationsSectionId } from "@/lib/navigation/setup-tabs";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
        />
        {suffix ? <span className="shrink-0 text-xs text-slate-500">{suffix}</span> : null}
      </div>
    </label>
  );
}

function DueFields({
  daysBefore,
  anchor,
  onDaysBefore,
  onAnchor,
  anchorOptions,
}: {
  daysBefore: number;
  anchor: OpsPrepDueAnchor;
  onDaysBefore: (value: number) => void;
  onAnchor: (value: OpsPrepDueAnchor) => void;
  anchorOptions?: OpsPrepDueAnchor[];
}) {
  const anchors = anchorOptions ?? (["first_job_day", "job_day"] as OpsPrepDueAnchor[]);
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="block min-w-[7rem]">
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Days before
        </span>
        <input
          type="number"
          min={0}
          max={60}
          value={daysBefore}
          onChange={(e) => onDaysBefore(Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm tabular-nums"
        />
      </label>
      {anchors.length > 1 ? (
        <label className="block min-w-[9rem]">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Anchor date
          </span>
          <select
            value={anchor}
            onChange={(e) => onAnchor(e.target.value as OpsPrepDueAnchor)}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          >
            <option value="first_job_day">First job day</option>
            <option value="job_day">Job day</option>
          </select>
        </label>
      ) : null}
      <p className="pb-1 text-[11px] text-slate-500">
        {daysBefore === 0 ? "Due on the anchor date" : `${daysBefore} day${daysBefore === 1 ? "" : "s"} before anchor`}
      </p>
    </div>
  );
}

type OperationsTabProps = {
  section: SetupOperationsSectionId;
};

export function OperationsTab({ section }: OperationsTabProps) {
  const { value: rules, update: updateRules } = useSettingsSection("opsPrepRules");

  function patchBuiltin(id: OpsPrepBuiltinRuleId, patch: Partial<(typeof rules.builtIn)[number]>) {
    updateRules({
      builtIn: rules.builtIn.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    });
  }

  function patchVendorType(vendorTypeId: string, patch: Partial<(typeof rules.vendorTypes)[number]>) {
    updateRules({
      vendorTypes: rules.vendorTypes.map((rule) =>
        rule.vendorTypeId === vendorTypeId ? { ...rule, ...patch } : rule,
      ),
    });
  }

  if (section === "lodging") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Crew lodging</h2>
          <p className="mt-1 text-sm text-slate-600">
            Default client charges when sales marks a job day as needing a hotel, and when that
            creates an ops prep booking task.
          </p>
        </div>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Lodging charges</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Used to suggest the client charge on the job day editor.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              label="Room rate (client)"
              value={rules.crewLodging.roomRatePerNight}
              onChange={(roomRatePerNight) =>
                updateRules({ crewLodging: { ...rules.crewLodging, roomRatePerNight } })
              }
              suffix="/ night"
            />
            <NumberField
              label="Per diem per mover (client)"
              value={rules.crewLodging.perDiemPerMover}
              onChange={(perDiemPerMover) =>
                updateRules({ crewLodging: { ...rules.crewLodging, perDiemPerMover } })
              }
              suffix="/ mover"
            />
            <NumberField
              label="Movers per room"
              value={rules.crewLodging.moversPerRoom}
              onChange={(moversPerRoom) =>
                updateRules({
                  crewLodging: { ...rules.crewLodging, moversPerRoom: Math.max(1, moversPerRoom) },
                })
              }
              min={1}
            />
          </div>
          <p className="text-xs text-slate-500">
            Client charge = rooms × room rate + movers × per diem. Room count rounds up from crew
            size ÷ movers per room.
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Job day hotel prep</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              When a job day is marked hotel needed in move detail.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={rules.jobDayHotel.enabled}
              onChange={(e) =>
                updateRules({ jobDayHotel: { ...rules.jobDayHotel, enabled: e.target.checked } })
              }
              className="rounded border-slate-300"
            />
            Create ops prep task when hotel is needed on a job day
          </label>
          {rules.jobDayHotel.enabled ? (
            <DueFields
              daysBefore={rules.jobDayHotel.daysBefore}
              anchor="job_day"
              onDaysBefore={(daysBefore) =>
                updateRules({ jobDayHotel: { ...rules.jobDayHotel, daysBefore } })
              }
              onAnchor={() => {}}
              anchorOptions={["job_day"]}
            />
          ) : null}
        </section>
      </div>
    );
  }

  if (section === "vendor-types") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Third-party vendor types</h2>
          <p className="mt-1 text-sm text-slate-600">
            When each vendor type from Equipment &amp; supplies should appear on Jobs → Ops prep.
          </p>
        </div>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
          {rules.vendorTypes.map((rule) => {
            const label = catalogVendorTypeLabel(rule.vendorTypeId);
            return (
              <li key={rule.vendorTypeId} className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) =>
                        patchVendorType(rule.vendorTypeId, { enabled: e.target.checked })
                      }
                      className="rounded border-slate-300"
                    />
                    {label}
                  </label>
                  {rule.enabled ? (
                    <DueFields
                      daysBefore={rule.daysBefore}
                      anchor={rule.anchor}
                      onDaysBefore={(daysBefore) =>
                        patchVendorType(rule.vendorTypeId, { daysBefore })
                      }
                      onAnchor={(anchor) => patchVendorType(rule.vendorTypeId, { anchor })}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Automatic prep triggers</h2>
        <p className="mt-1 text-sm text-slate-600">
          Heuristics from move intake, access notes, and job days that create ops prep tasks.
        </p>
      </div>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
        {rules.builtIn.map((rule) => {
          const meta = OPS_PREP_BUILTIN_RULE_LABELS[rule.id];
          return (
            <li key={rule.id} className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => patchBuiltin(rule.id, { enabled: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    {meta.label}
                  </label>
                  <p className="mt-0.5 pl-6 text-xs text-slate-500">{meta.description}</p>
                </div>
                {rule.enabled ? (
                  <DueFields
                    daysBefore={rule.daysBefore}
                    anchor={rule.anchor}
                    onDaysBefore={(daysBefore) => patchBuiltin(rule.id, { daysBefore })}
                    onAnchor={(anchor) => patchBuiltin(rule.id, { anchor })}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
