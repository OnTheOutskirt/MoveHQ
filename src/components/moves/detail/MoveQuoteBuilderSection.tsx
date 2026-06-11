"use client";

import { DocumentHourlyBreakdown } from "@/components/admin/setup/document-templates/DocumentHourlyBreakdown";
import { MoveDetailChangeOrdersSection } from "@/components/moves/detail/MoveDetailChangeOrdersSection";
import { MoveQuoteDiscountSection } from "@/components/moves/detail/MoveQuoteDiscountSection";
import { MoveSentDocumentsPanel } from "@/components/moves/detail/MoveSentDocumentsPanel";
import { DetailSection } from "@/components/moves/detail/DetailSection";
import { useMoveSendDocument } from "@/components/moves/detail/MoveSendDocumentProvider";
import { useMoveIntakeEdit } from "@/components/moves/detail/use-move-intake-edit";
import { WebsiteIntakeStrip } from "@/components/moves/detail/WebsiteIntakePanel";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import {
  formatInventoryBasisLabel,
  formatInventoryVolumeDetail,
  inventoryVolumeForMove,
} from "@/lib/moves/inventory-basis";
import { computeQuoteDiscount } from "@/lib/moves/quote-discount";
import {
  buildDocumentValuationContext,
  buildFlatPricingLines,
  buildHourlyPricingLines,
} from "@/lib/settings/document-valuation";
import {
  DEFAULT_HOURLY_QUOTE_SETTINGS,
  resolveHourlyQuote,
  type HourlyQuoteSettings,
} from "@/lib/moves/hourly-quote-settings";
import { formatQuote } from "@/lib/moves/format";
import {
  aiQuoteSummary,
  computeAiQuoteAmount,
  runAiQuoteGeneration,
  type AiQuoteType,
} from "@/lib/moves/generate-ai-quote";
import { getMoveOperationalSummary } from "@/lib/moves/move-operational";
import { isMoveRateLocked } from "@/lib/pricing/rate-resolution";
import {
  moveHasCreatedQuote,
  pricingModelLabel,
} from "@/lib/moves/move-document-send";
import { resolveDocumentAccentColor } from "@/lib/settings/document-accent";
import { getTemplateForKind } from "@/lib/moves/document-template-render";
import { loadDocumentTemplates } from "@/lib/settings/storage";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  FileSignature,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

type MoveQuoteBuilderSectionProps = {
  move: MoveRecord;
};

type PricingChoice = AiQuoteType;

export function MoveQuoteBuilderSection({ move }: MoveQuoteBuilderSectionProps) {
  const { settings } = useSettings();
  const { getMoveById, updateMoveQuote } = useMoves();
  const liveMove = getMoveById(move.id) ?? move;
  const {
    openSendQuote,
    openSendContract,
    canSendDocuments,
    sentQuote,
    sentContract,
  } = useMoveSendDocument();
  const { intake, disabled, patch } = useMoveIntakeEdit(liveMove.id);

  const [pricingChoice, setPricingChoice] = useState<PricingChoice>(
    liveMove.quoteType === "hourly" ? "hourly" : "flat",
  );
  const [pendingPricing, setPendingPricing] = useState<PricingChoice | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genLabel, setGenLabel] = useState("");
  const [genPercent, setGenPercent] = useState(0);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const quoteSent = sentQuote != null;
  const contractSent = sentContract != null;
  const customerBooked = liveMove.pipelineStage === "needs_contract";
  const contractSigned =
    liveMove.pipelineStage === "booked" || liveMove.pipelineStage === "completed";
  const ratesLocked = isMoveRateLocked(liveMove);
  const lockedRateLabel = liveMove.intake.pricingRateSnapshot?.effectiveFrom;

  const hasQuote = moveHasCreatedQuote(liveMove);
  const showFlatChangeOrders =
    pricingChoice === "flat" && liveMove.quoteType === "flat" && liveMove.quoteAmount != null;
  const ops = useMemo(() => getMoveOperationalSummary(liveMove), [liveMove]);
  const hourlySettings = useMemo(
    () => (intake ? resolveHourlyQuote(intake, liveMove) : DEFAULT_HOURLY_QUOTE_SETTINGS),
    [intake, liveMove],
  );

  const templates = useMemo(() => loadDocumentTemplates(), []);
  const quoteTemplate = useMemo(() => getTemplateForKind(templates, "quote"), [templates]);
  const previewAccent = useMemo(
    () => resolveDocumentAccentColor(quoteTemplate, settings.branding.accentColor),
    [quoteTemplate, settings.branding.accentColor],
  );

  const inventoryVolume = useMemo(
    () => inventoryVolumeForMove(liveMove, settings.defaults),
    [liveMove, settings.defaults],
  );

  const quoteDiscount = useMemo(
    () => computeQuoteDiscount(liveMove, settings.fieldCatalog.discountReasons),
    [liveMove, settings.fieldCatalog.discountReasons],
  );

  const hourlyLines = useMemo(() => {
    if (liveMove.quoteType !== "hourly" || liveMove.quoteAmount == null) return [];
    return buildHourlyPricingLines(
      liveMove,
      buildDocumentValuationContext(liveMove),
      settings.defaults.hourlyNotToExceedAmount,
      quoteDiscount,
    );
  }, [liveMove, settings.defaults.hourlyNotToExceedAmount, quoteDiscount]);

  const flatLines = useMemo(() => {
    if (liveMove.quoteType !== "flat" || liveMove.quoteAmount == null) return [];
    return buildFlatPricingLines(
      liveMove,
      buildDocumentValuationContext(liveMove),
      quoteDiscount,
    );
  }, [liveMove, quoteDiscount]);

  function applyPricing(next: PricingChoice) {
    setPricingChoice(next);
    setLastGenerated(null);
    if (liveMove.quoteType !== next) {
      updateMoveQuote(liveMove.id, { quoteType: next, quoteAmount: null });
    }
  }

  function requestPricing(next: PricingChoice) {
    if (next === pricingChoice) return;
    const switchingExistingQuote =
      liveMove.quoteAmount != null &&
      liveMove.quoteType != null &&
      liveMove.quoteType !== next;
    if (switchingExistingQuote) {
      setPendingPricing(next);
      return;
    }
    applyPricing(next);
  }

  function patchHourlyQuote(partial: Partial<HourlyQuoteSettings>) {
    patch({
      hourlyQuote: { ...hourlySettings, ...partial },
    });
  }

  function setLaborRate(amount: number) {
    updateMoveQuote(liveMove.id, {
      quoteType: "hourly",
      quoteAmount: amount,
    });
  }

  async function handleGenerateFlat() {
    if (generating || pricingChoice !== "flat") return;
    setGenerating(true);
    setGenStep(0);
    setGenPercent(0);
    setLastGenerated(null);

    await runAiQuoteGeneration("flat", (index, label, percent) => {
      setGenStep(index);
      setGenLabel(label);
      setGenPercent(percent);
    });

    const amount = computeAiQuoteAmount(liveMove, "flat");
    updateMoveQuote(liveMove.id, { quoteType: "flat", quoteAmount: amount });
    setLastGenerated(aiQuoteSummary(liveMove, "flat", amount));
    setGenerating(false);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold text-slate-900">Send to customer</p>
            <div className="flex flex-wrap gap-2">
              <StatusPill
                label="Quote"
                value={quoteSent ? "Sent" : "Draft"}
                tone={quoteSent ? "brand" : "muted"}
              />
              <StatusPill
                label="Contract"
                value={
                  contractSigned
                    ? "Signed"
                    : contractSent
                      ? "Sent"
                      : customerBooked
                        ? "Ready to send"
                        : "Not sent"
                }
                tone={
                  contractSigned
                    ? "success"
                    : contractSent || customerBooked
                      ? "brand"
                      : "muted"
                }
              />
            </div>
            {!canSendDocuments ? (
              <p className="text-xs text-amber-800">
                Create a flat rate or hourly quote before sending to the customer.
              </p>
            ) : null}
            <p className="text-xs text-slate-500">
              Preview and send use your document templates — deposit comes from company defaults.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              className={cn("gap-1.5", quoteSent && canSendDocuments && "opacity-60")}
              disabled={!canSendDocuments}
              title={
                !canSendDocuments ? "Create a flat rate or hourly quote first" : undefined
              }
              onClick={openSendQuote}
            >
              <FileText className="h-4 w-4" />
              Send quote
            </Button>
            <Button
              type="button"
              variant="secondary"
              className={cn("gap-1.5", contractSent && canSendDocuments && "opacity-60")}
              disabled={!canSendDocuments}
              title={
                !canSendDocuments ? "Create a flat rate or hourly quote first" : undefined
              }
              onClick={openSendContract}
            >
              <FileSignature className="h-4 w-4" />
              Send contract
            </Button>
          </div>
        </div>
      </div>

      {(quoteSent || contractSent) && (
        <DetailSection
          title="Sent documents"
          description="Customer engagement from portal views, booking requests, signatures, and deposits."
        >
          <MoveSentDocumentsPanel move={liveMove} />
        </DetailSection>
      )}

      <WebsiteIntakeStrip move={liveMove} />

      <DetailSection
        title="Pricing model"
        description={
          pricingChoice === "flat"
            ? "Flat rate — all-inclusive total for the agreed scope."
            : "Hourly — set rates and fees that appear on the hourly quote document."
        }
      >
        {ratesLocked && lockedRateLabel ? (
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
            Supply and hourly rates are locked to the schedule effective{" "}
            {new Date(`${lockedRateLabel}T12:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            . Admin rate changes won&apos;t affect this contracted move.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <PricingToggle
            active={pricingChoice === "flat"}
            onClick={() => requestPricing("flat")}
            label="Flat rate"
            icon={Sparkles}
          />
          <PricingToggle
            active={pricingChoice === "hourly"}
            onClick={() => requestPricing("hourly")}
            label="Hourly"
            icon={Clock}
          />
        </div>

        {pricingChoice === "flat" ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="mb-3 text-xs text-slate-600">
              Inventory basis:{" "}
              <span className="font-semibold text-slate-800">
                {formatInventoryBasisLabel(inventoryVolume.basis)}
              </span>
              {" · "}
              {formatInventoryVolumeDetail(inventoryVolume)}
              <span className="text-slate-400">
                {" "}
                (company default — Admin → Defaults)
              </span>
            </p>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {hasQuote && liveMove.quoteType === "flat"
                    ? formatQuote(liveMove.quoteAmount, liveMove.quoteType)
                    : "No flat rate yet"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {hasQuote && liveMove.quoteType === "flat"
                    ? lastGenerated ?? `${ops.aiQuoteRecommendation} · ${ops.inventorySummary}`
                    : "Generate an AI flat-rate total from move scope and inventory."}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 gap-1.5"
                disabled={generating || disabled}
                onClick={() => void handleGenerateFlat()}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generating ? "Generating…" : "Generate AI flat rate quote"}
              </Button>
            </div>

            {generating ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{genLabel}</span>
                  <span className="tabular-nums text-slate-500">{genPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-[width] duration-300 ease-out"
                    style={{ width: `${genPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">Step {genStep + 1} of 5</p>
              </div>
            ) : null}

            {lastGenerated && !generating ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {lastGenerated}
              </p>
            ) : null}

            <MoveQuoteDiscountSection move={liveMove} disabled={disabled} />

            {liveMove.quoteType === "flat" &&
            liveMove.quoteAmount != null &&
            flatLines.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    All-in flat rate breakdown (customer document)
                  </p>
                </div>
                <DocumentHourlyBreakdown
                  lines={flatLines}
                  showMaterialRates={false}
                  accentColor={previewAccent}
                  title="What's included in your flat rate"
                  footerNote="Each line rolls into the all-in price — liability, wardrobe, and card processing are covered."
                />
              </div>
            ) : null}

            {showFlatChangeOrders ? (
              <MoveDetailChangeOrdersSection move={liveMove} embedded />
            ) : null}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <MoveQuoteDiscountSection move={liveMove} disabled={disabled} />

            <div className="grid gap-4 sm:grid-cols-2">
              <HourlyField
                label="Labor rate"
                hint="Per hour — billed with minimum below"
                suffix="/hr"
                value={liveMove.quoteType === "hourly" ? liveMove.quoteAmount : null}
                disabled={disabled}
                onChange={setLaborRate}
              />
              <HourlyField
                label="Travel fee (flat)"
                hint="Covers crew travel to and from addresses"
                prefix="$"
                value={hourlySettings.travelFee}
                disabled={disabled}
                onChange={(v) => patchHourlyQuote({ travelFee: v })}
              />
              <HourlyField
                label="Minimum hours"
                hint="Local move minimum billed time"
                suffix="hrs"
                value={hourlySettings.minimumHours}
                disabled={disabled}
                onChange={(v) => patchHourlyQuote({ minimumHours: v })}
                integer
              />
              {liveMove.intake.hasJunk ? (
                <HourlyField
                  label="Dump / disposal fee"
                  hint="If haul-away is required"
                  prefix="$"
                  value={hourlySettings.dumpFee}
                  disabled={disabled}
                  onChange={(v) => patchHourlyQuote({ dumpFee: v })}
                />
              ) : null}
              {liveMove.intake.hasSpecialtyItems ? (
                <HourlyField
                  label="Crating / specialty (from)"
                  hint="Quoted per item when applicable"
                  prefix="$"
                  value={hourlySettings.cratingFrom}
                  disabled={disabled}
                  onChange={(v) => patchHourlyQuote({ cratingFrom: v })}
                />
              ) : null}
            </div>

            {(liveMove.intake.packingService === "full" ||
              liveMove.intake.packingService === "partial") && (
              <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                Packing materials are billed as used on move day — rates come from your hourly
                document template material list.
              </p>
            )}

            {settings.defaults.hourlyNotToExceedAmount > 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
                Not-to-exceed ceiling:{" "}
                <span className="font-semibold tabular-nums">
                  ${settings.defaults.hourlyNotToExceedAmount.toLocaleString("en-US")}
                </span>
                {" "}
                — shown on hourly quotes and contracts (Admin → Defaults).
              </p>
            ) : null}

            {liveMove.quoteType === "hourly" &&
            liveMove.quoteAmount != null &&
            hourlyLines.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Customer document preview
                  </p>
                </div>
                <DocumentHourlyBreakdown
                  lines={hourlyLines}
                  showMaterialRates
                  accentColor={previewAccent}
                />
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Enter a labor rate to build the hourly pricing block on the quote.
              </p>
            )}
          </div>
        )}
      </DetailSection>

      <ConfirmDialog
        open={pendingPricing != null}
        onClose={() => setPendingPricing(null)}
        onConfirm={() => {
          if (pendingPricing) applyPricing(pendingPricing);
        }}
        title={
          pendingPricing
            ? `Switch to ${pricingModelLabel(pendingPricing)}?`
            : "Switch pricing model?"
        }
        description={
          pendingPricing && liveMove.quoteType
            ? `You already have a ${pricingModelLabel(liveMove.quoteType)} quote. Switching to ${pricingModelLabel(pendingPricing)} will clear it so you can build a new one.`
            : "Switching pricing models will clear your current quote."
        }
        confirmLabel="Switch"
      />
    </div>
  );
}

function HourlyField({
  label,
  hint,
  prefix,
  suffix,
  value,
  disabled,
  onChange,
  integer,
}: {
  label: string;
  hint: string;
  prefix?: string;
  suffix?: string;
  value: number | null;
  disabled?: boolean;
  onChange: (value: number) => void;
  integer?: boolean;
}) {
  return (
    <label className="block rounded-xl border border-slate-200 bg-white p-3">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-1.5">
        {prefix ? <span className="text-sm text-slate-500">{prefix}</span> : null}
        <input
          type="number"
          min={0}
          step={integer ? 1 : 1}
          disabled={disabled}
          value={value ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return;
            const n = integer ? Math.round(Number(raw)) : Number(raw);
            if (!Number.isFinite(n)) return;
            onChange(Math.max(0, n));
          }}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
        />
        {suffix ? <span className="shrink-0 text-sm text-slate-500">{suffix}</span> : null}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">{hint}</p>
    </label>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "brand" | "warning" | "success";
}) {
  const styles = {
    muted: "bg-slate-100 text-slate-600",
    brand: "bg-brand-100 text-brand-800",
    warning: "bg-amber-100 text-amber-900",
    success: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        styles[tone],
      )}
    >
      <span className="text-slate-500">{label}</span>
      {value}
    </span>
  );
}

function PricingToggle({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: typeof Sparkles;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "border-brand-300 bg-brand-50 text-brand-900 ring-1 ring-brand-200"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
