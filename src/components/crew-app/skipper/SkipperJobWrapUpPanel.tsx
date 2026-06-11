"use client";

import {
  buildDefaultWrapUpCrewHours,
  ensureWrapUpCrewHours,
  totalBillableHours,
  type JobFieldState,
  type WrapUpAddedFee,
} from "@/lib/crew-app/job-field-storage";
import { MOCK_OTHER_CREW_HELPERS, WRAP_UP_FEE_PRESETS } from "@/lib/crew-app/mock-jobs";
import type { CrewAppJob, CrewJobMaterial } from "@/lib/crew-app/types";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SkipperJobWrapUpPanelProps = {
  job: CrewAppJob;
  state: JobFieldState;
  onChange: (next: JobFieldState) => void;
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function materialQty(state: JobFieldState, materialId: string): number {
  return state.wrapUp.materialsUsed.find((m) => m.materialId === materialId)?.qty ?? 0;
}

function materialLineTotal(material: CrewJobMaterial, qty: number): number {
  const price = material.unitPrice ?? 0;
  return price * qty;
}

export function SkipperJobWrapUpPanel({ job, state, onChange }: SkipperJobWrapUpPanelProps) {
  const [showHelperPicker, setShowHelperPicker] = useState(false);
  const [showFeePicker, setShowFeePicker] = useState(false);

  useEffect(() => {
    if (state.wrapUp.crewHours.length > 0) return;
    onChange(ensureWrapUpCrewHours(job, state));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per job when empty
  }, [job.id]);

  const clockHours = totalBillableHours(state);

  const materialsTotal = useMemo(() => {
    let total = 0;
    for (const material of job.shopMaterials) {
      total += materialLineTotal(material, materialQty(state, material.id));
    }
    return total;
  }, [job.shopMaterials, state.wrapUp.materialsUsed]);

  const officeFeesTotal = job.officeFees.reduce((s, f) => s + f.amount, 0);
  const addedFeesTotal = state.wrapUp.addedFees.reduce((s, f) => s + f.amount, 0);

  function updateWrapUp(nextWrapUp: JobFieldState["wrapUp"]) {
    onChange({ ...state, wrapUp: nextWrapUp });
  }

  function setMaterialQty(materialId: string, qty: number) {
    const safeQty = Math.max(0, qty);
    const rest = state.wrapUp.materialsUsed.filter((m) => m.materialId !== materialId);
    const materialsUsed =
      safeQty > 0 ? [...rest, { materialId, qty: safeQty }] : rest;
    updateWrapUp({ ...state.wrapUp, materialsUsed });
  }

  function setCrewHours(memberId: string, hours: number) {
    updateWrapUp({
      ...state.wrapUp,
      crewHours: state.wrapUp.crewHours.map((m) =>
        m.id === memberId ? { ...m, hours: Math.max(0, hours) } : m,
      ),
    });
  }

  function addHelper(name: string, role: string) {
    if (state.wrapUp.crewHours.some((m) => m.name === name)) return;
    updateWrapUp({
      ...state.wrapUp,
      crewHours: [
        ...state.wrapUp.crewHours,
        {
          id: `helper-${name}`,
          name,
          role,
          hours: clockHours,
          fromOtherCrew: true,
        },
      ],
    });
    setShowHelperPicker(false);
  }

  function removeCrewMember(memberId: string) {
    updateWrapUp({
      ...state.wrapUp,
      crewHours: state.wrapUp.crewHours.filter((m) => m.id !== memberId),
    });
  }

  function addFee(fee: WrapUpAddedFee) {
    updateWrapUp({
      ...state.wrapUp,
      addedFees: [...state.wrapUp.addedFees, fee],
    });
    setShowFeePicker(false);
  }

  function removeFee(feeId: string) {
    updateWrapUp({
      ...state.wrapUp,
      addedFees: state.wrapUp.addedFees.filter((f) => f.id !== feeId),
    });
  }

  function syncHoursFromClock() {
    updateWrapUp({
      ...state.wrapUp,
      crewHours: buildDefaultWrapUpCrewHours(job, state).map((fresh) => {
        const existing = state.wrapUp.crewHours.find((m) => m.id === fresh.id);
        return existing ? { ...existing, hours: fresh.hours } : fresh;
      }),
    });
  }

  const billableMaterials = job.shopMaterials.filter((m) => (m.unitPrice ?? 0) > 0);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-600">
        Log materials used, fees, and crew hours before final sign-off on the Finish tab.
      </p>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Crew hours
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Pulled from clock ({clockHours}h billable). Adjust per person if needed.
            </p>
          </div>
          <button
            type="button"
            onClick={syncHoursFromClock}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-3 w-3" />
            Sync
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {state.wrapUp.crewHours.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">{member.name}</p>
                <p className="text-[10px] capitalize text-slate-500">
                  {member.role}
                  {member.fromOtherCrew ? " · other crew" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={member.hours}
                  onChange={(e) =>
                    setCrewHours(member.id, parseFloat(e.target.value) || 0)
                  }
                  className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm tabular-nums"
                />
                <span className="text-xs text-slate-500">hrs</span>
                {member.fromOtherCrew ? (
                  <button
                    type="button"
                    onClick={() => removeCrewMember(member.id)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    aria-label={`Remove ${member.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {showHelperPicker ? (
          <ul className="mt-2 space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
            {MOCK_OTHER_CREW_HELPERS.filter(
              (h) => !state.wrapUp.crewHours.some((m) => m.name === h.name),
            ).map((helper) => (
              <li key={helper.name}>
                <button
                  type="button"
                  onClick={() => addHelper(helper.name, helper.role)}
                  className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-white"
                >
                  <span className="font-medium text-slate-800">{helper.name}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {helper.crewLabel} · {helper.role}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={() => setShowHelperPicker((v) => !v)}
          className="mt-3 w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          + Add helper from another crew
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Materials used on job
        </h2>
        {billableMaterials.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {billableMaterials.map((material) => {
              const qty = materialQty(state, material.id);
              const lineTotal = materialLineTotal(material, qty);
              return (
                <li key={material.id} className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={qty || ""}
                    placeholder="0"
                    onChange={(e) =>
                      setMaterialQty(material.id, parseInt(e.target.value, 10) || 0)
                    }
                    className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm tabular-nums"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-slate-800">{material.label}</span>
                    <span className="ml-1.5 text-[11px] text-slate-500">
                      {formatMoney(material.unitPrice ?? 0)} / {material.unit ?? "ea"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      qty > 0 ? "text-slate-900" : "text-slate-300",
                    )}
                  >
                    {formatMoney(lineTotal)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-500">No billable materials on this job.</p>
        )}
        {materialsTotal > 0 ? (
          <p className="mt-3 border-t border-slate-100 pt-2 text-right text-xs text-slate-600">
            Materials subtotal:{" "}
            <strong className="text-slate-900">{formatMoney(materialsTotal)}</strong>
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Office &amp; misc fees
        </h2>
        {job.officeFees.length > 0 ? (
          <ul className="mt-2 space-y-1.5 text-sm">
            {job.officeFees.map((fee) => (
              <li key={fee.id} className="flex justify-between text-slate-800">
                <span>{fee.label}</span>
                <span className="font-medium tabular-nums">{formatMoney(fee.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-500">None on file from office.</p>
        )}

        {state.wrapUp.addedFees.length > 0 ? (
          <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            {state.wrapUp.addedFees.map((fee) => (
              <li key={fee.id} className="flex items-center justify-between gap-2 text-slate-800">
                <span>{fee.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium tabular-nums">{formatMoney(fee.amount)}</span>
                  <button
                    type="button"
                    onClick={() => removeFee(fee.id)}
                    className="rounded p-0.5 text-slate-400 hover:text-slate-700"
                    aria-label={`Remove ${fee.label}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {showFeePicker ? (
          <ul className="mt-2 space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
            {WRAP_UP_FEE_PRESETS.map((preset) => (
              <li key={preset.label}>
                <button
                  type="button"
                  onClick={() =>
                    addFee({
                      id: `fee-${Date.now()}-${preset.label}`,
                      label: preset.label,
                      amount: preset.amount,
                    })
                  }
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-white"
                >
                  <span className="font-medium text-slate-800">{preset.label}</span>
                  <span className="text-slate-600">{formatMoney(preset.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={() => setShowFeePicker((v) => !v)}
          className="mt-3 w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          + Add dump / crating / misc fee
        </button>

        {(officeFeesTotal > 0 || addedFeesTotal > 0) && (
          <p className="mt-3 border-t border-slate-100 pt-2 text-right text-xs text-slate-600">
            Fees subtotal:{" "}
            <strong className="text-slate-900">
              {formatMoney(officeFeesTotal + addedFeesTotal)}
            </strong>
          </p>
        )}
      </section>
    </div>
  );
}
