"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { useMoveIntakeEdit } from "@/components/moves/detail/use-move-intake-edit";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Button } from "@/components/ui/Button";
import type { LiabilityCoverage } from "@/lib/moves/flat-rate-intake";
import type { MoveRecord } from "@/lib/moves/types";
import {
  FULL_VALUE_MAX,
  FULL_VALUE_MIN,
  VALUATION_RELEASED,
  VALUATION_UNREGULATED,
  declaredValueForMove,
  fullValuePremium,
  isRegulatedMove,
  liabilityCoverageLabel,
  resolveValuationSelection,
} from "@/lib/settings/document-valuation";
import { cn } from "@/lib/utils";
import { AlertCircle, Pencil, Shield } from "lucide-react";
import { useMemo, useState } from "react";

type MoveDetailValuationSectionProps = {
  move: MoveRecord;
};

export function MoveDetailValuationSection({ move }: MoveDetailValuationSectionProps) {
  const { settings } = useSettings();
  const { intake, disabled, patch } = useMoveIntakeEdit(move.id);
  const [editing, setEditing] = useState(false);
  const accentColor = settings.branding.accentColor;
  const jobTypeRegulated = isRegulatedMove(move);
  const selection = resolveValuationSelection(move);
  const isExplicitOverride = intake?.liabilityCoverage !== "";

  const declaredValue = useMemo(() => {
    if (!intake) return FULL_VALUE_MIN;
    if (intake.declaredValue != null && intake.declaredValue > 0) return intake.declaredValue;
    return declaredValueForMove(move);
  }, [intake, move]);

  const premium = useMemo(
    () =>
      selection === "full"
        ? intake?.liabilityPremium ?? fullValuePremium(declaredValue)
        : 0,
    [selection, declaredValue, intake?.liabilityPremium],
  );

  if (!intake) return null;

  function setSelection(next: LiabilityCoverage) {
    if (next === "unregulated") {
      patch({
        liabilityCoverage: "unregulated",
        declaredValue: null,
        liabilityPremium: null,
      });
      return;
    }
    if (next === "released") {
      patch({
        liabilityCoverage: "released",
        declaredValue: null,
        liabilityPremium: null,
      });
      return;
    }
    const value = declaredValueForMove(move);
    patch({
      liabilityCoverage: "full",
      declaredValue: value,
      liabilityPremium: fullValuePremium(value),
    });
  }

  function setDeclaredValue(raw: number) {
    const value = Math.min(FULL_VALUE_MAX, Math.max(FULL_VALUE_MIN, raw));
    patch({
      liabilityCoverage: "full",
      declaredValue: value,
      liabilityPremium: fullValuePremium(value),
    });
  }

  const canEdit = !disabled;
  const overrideHint = isExplicitOverride
    ? intake.liabilityCoverage === "unregulated" && jobTypeRegulated
      ? "Override: unregulated despite a regulated job type."
      : (intake.liabilityCoverage === "released" || intake.liabilityCoverage === "full") &&
          !jobTypeRegulated
        ? "Override: Texas valuation applied on a normally exempt job type."
        : null
    : !isExplicitOverride && selection === "unregulated"
      ? "Default from job type — choose Released or Full to apply Texas valuation."
      : null;

  return (
    <DetailSection
      title="Valuation & liability"
      description="Released value, full value, or unregulated — override job-type defaults when needed."
    >
      <div className="space-y-4">
        {overrideHint ? (
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-900">
            {overrideHint}
          </p>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {!editing ? (
              <CustomerSelectionSummary
                selection={selection}
                declaredValue={declaredValue}
                premium={premium}
                accentColor={accentColor}
                isExplicit={isExplicitOverride}
              />
            ) : (
              <ValuationEditor
                moveId={move.id}
                selection={selection}
                declaredValue={declaredValue}
                premium={premium}
                accentColor={accentColor}
                disabled={disabled}
                onSetSelection={setSelection}
                onSetDeclaredValue={setDeclaredValue}
              />
            )}
          </div>
          {canEdit && !editing ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : null}
        </div>

        {editing && canEdit ? (
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)}>
              Done
            </Button>
          </div>
        ) : null}
      </div>
    </DetailSection>
  );
}

function CustomerSelectionSummary({
  selection,
  declaredValue,
  premium,
  accentColor,
  isExplicit,
}: {
  selection: LiabilityCoverage | "";
  declaredValue: number;
  premium: number;
  accentColor: string;
  isExplicit: boolean;
}) {
  if (!selection) {
    return (
      <p className="text-sm text-slate-600">
        No coverage selected yet — customer has not chosen on intake or the portal.
      </p>
    );
  }

  if (selection === "unregulated") {
    return (
      <SelectedCard
        accentColor={accentColor}
        title={VALUATION_UNREGULATED.title}
        detail={VALUATION_UNREGULATED.description}
        badge={isExplicit ? "Override selected" : "From job type"}
        icon="alert"
      />
    );
  }

  if (selection === "full") {
    return (
      <SelectedCard
        accentColor={accentColor}
        title="Full Value Protection"
        detail={`Declared shipment value: $${declaredValue.toLocaleString()} · Premium (1.5%): $${premium.toLocaleString()}`}
        badge={isExplicit ? "Customer selected" : undefined}
      />
    );
  }

  return (
    <SelectedCard
      accentColor={accentColor}
      title={VALUATION_RELEASED.title}
      detail={`${VALUATION_RELEASED.subtitle} · Included at no charge`}
      badge={isExplicit ? "Customer selected" : undefined}
    />
  );
}

function SelectedCard({
  title,
  detail,
  accentColor,
  badge,
  icon = "shield",
}: {
  title: string;
  detail: string;
  accentColor: string;
  badge?: string;
  icon?: "shield" | "alert";
}) {
  const Icon = icon === "alert" ? AlertCircle : Shield;

  return (
    <div
      className="rounded-xl border px-3 py-3"
      style={{
        borderColor: `color-mix(in srgb, ${accentColor} 25%, white)`,
        backgroundColor: `color-mix(in srgb, ${accentColor} 6%, white)`,
      }}
    >
      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        <Icon className="h-4 w-4" style={{ color: accentColor }} />
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{detail}</p>
      {badge ? (
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {badge}
        </p>
      ) : null}
    </div>
  );
}

function ValuationEditor({
  moveId,
  selection,
  declaredValue,
  premium,
  accentColor,
  disabled,
  onSetSelection,
  onSetDeclaredValue,
}: {
  moveId: string;
  selection: LiabilityCoverage | "";
  declaredValue: number;
  premium: number;
  accentColor: string;
  disabled: boolean;
  onSetSelection: (next: LiabilityCoverage) => void;
  onSetDeclaredValue: (value: number) => void;
}) {
  const effectiveSelection = selection || "released";

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Choose how this move is treated on quotes and contracts — overrides job-type defaults.
      </p>

      <label
        className={cn(
          "flex gap-3 rounded-xl border p-3 transition-colors",
          disabled ? "opacity-60" : "cursor-pointer",
          effectiveSelection === "released"
            ? "border-brand-300 bg-brand-50/50 ring-1 ring-brand-200"
            : "border-slate-200 hover:border-slate-300",
        )}
      >
        <input
          type="radio"
          name={`valuation-${moveId}`}
          checked={effectiveSelection === "released"}
          disabled={disabled}
          onChange={() => onSetSelection("released")}
          className="mt-1"
          style={{ accentColor }}
        />
        <span>
          <span className="block text-sm font-semibold text-slate-900">
            {VALUATION_RELEASED.title}
          </span>
          <span className="block text-xs text-slate-600">{liabilityCoverageLabel("released")}</span>
        </span>
      </label>

      <label
        className={cn(
          "flex gap-3 rounded-xl border p-3 transition-colors",
          disabled ? "opacity-60" : "cursor-pointer",
          effectiveSelection === "full"
            ? "border-brand-300 bg-brand-50/50 ring-1 ring-brand-200"
            : "border-slate-200 hover:border-slate-300",
        )}
      >
        <input
          type="radio"
          name={`valuation-${moveId}`}
          checked={effectiveSelection === "full"}
          disabled={disabled}
          onChange={() => onSetSelection("full")}
          className="mt-1"
          style={{ accentColor }}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900">Full Value Protection</span>
          {effectiveSelection === "full" ? (
            <div className="mt-3 space-y-2">
              <label className="block text-[10px] font-semibold uppercase text-slate-500">
                Declared shipment value
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">$</span>
                <input
                  type="number"
                  min={FULL_VALUE_MIN}
                  max={FULL_VALUE_MAX}
                  step={500}
                  disabled={disabled}
                  value={declaredValue}
                  onChange={(e) => onSetDeclaredValue(Number(e.target.value) || FULL_VALUE_MIN)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                />
              </div>
              <p className="text-xs text-slate-600">
                Premium (1.5%):{" "}
                <strong className="tabular-nums">${premium.toLocaleString()}</strong>
              </p>
            </div>
          ) : (
            <span className="mt-1 block text-xs text-slate-600">
              Declare shipment value ($5k–$100k) — premium is 1.5% of declared value
            </span>
          )}
        </span>
      </label>

      <label
        className={cn(
          "flex gap-3 rounded-xl border p-3 transition-colors",
          disabled ? "opacity-60" : "cursor-pointer",
          effectiveSelection === "unregulated"
            ? "border-slate-300 bg-slate-50 ring-1 ring-slate-200"
            : "border-slate-200 hover:border-slate-300",
        )}
      >
        <input
          type="radio"
          name={`valuation-${moveId}`}
          checked={effectiveSelection === "unregulated"}
          disabled={disabled}
          onChange={() => onSetSelection("unregulated")}
          className="mt-1"
          style={{ accentColor }}
        />
        <span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <AlertCircle className="h-3.5 w-3.5 text-slate-500" />
            {VALUATION_UNREGULATED.title}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-600">
            {VALUATION_UNREGULATED.description}
          </span>
        </span>
      </label>
    </div>
  );
}
