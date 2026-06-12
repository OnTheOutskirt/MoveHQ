"use client";

import { DocumentContentsSection } from "@/components/admin/setup/document-templates/DocumentContentsSection";
import { DocumentContractCheckout } from "@/components/admin/setup/document-templates/DocumentContractCheckout";
import { DocumentContractConfirmation } from "@/components/admin/setup/document-templates/DocumentContractConfirmation";
import { DocumentPortalFooter } from "@/components/admin/setup/document-templates/DocumentPortalFooter";
import { DocumentQuoteResponseSection } from "@/components/admin/setup/document-templates/DocumentQuoteResponseSection";
import { DocumentPricingHero } from "@/components/admin/setup/document-templates/DocumentPricingHero";
import { DocumentTermsSection } from "@/components/admin/setup/document-templates/DocumentTermsSection";
import {
  DocumentValuationSection,
  type ValuationSelectionState,
} from "@/components/admin/setup/document-templates/DocumentValuationSection";
import {
  renderDocumentTemplate,
  renderPortalRichText,
  videoEmbedUrl,
  type DocumentSendKind,
} from "@/lib/moves/document-template-render";
import { pricingKindFromVars } from "@/lib/settings/document-accent";
import type { DocumentPortalView } from "@/lib/settings/document-preview";
import {
  applyValuationToPortalVars,
  isRegulatedFromVars,
  parseFlatLinesFromVars,
  parseHourlyLinesFromVars,
  type PortalValuationSelection,
} from "@/lib/settings/document-valuation";
import type { DocumentPortalSettings } from "@/lib/settings/document-template-types";
import type { PortalPreviewViewport } from "@/components/admin/setup/document-templates/DocumentPortalPreviewFrame";
import { ArrowRight, Clock, FileSignature, Play, Sparkles, Truck } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { documentPortalCtaLabel } from "./DocumentPricingHero";

type DocumentPortalPreviewProps = {
  portal: DocumentPortalSettings;
  vars: Record<string, string>;
  kind: DocumentSendKind;
  logoDataUrl: string | null;
  accentColor: string;
  companyName: string;
  compact?: boolean;
  previewForceUnregulated?: boolean;
  portalView?: DocumentPortalView;
  onPortalViewChange?: (view: DocumentPortalView) => void;
  interactive?: boolean;
  /** Inside DocumentPortalPreviewFrame — no max-width cap or outer chrome. */
  framed?: boolean;
  viewport?: PortalPreviewViewport;
  /** Live move id — enables portal booking to advance pipeline. */
  moveId?: string;
  portalHomeHref?: string;
  onQuoteBookRequested?: () => void;
  onContractCompleted?: () => void;
};

export function DocumentPortalPreview({
  portal,
  vars,
  kind,
  logoDataUrl,
  accentColor,
  companyName,
  compact,
  previewForceUnregulated,
  portalView = "document",
  onPortalViewChange,
  interactive = true,
  framed = false,
  viewport = "mobile",
  moveId,
  portalHomeHref,
  onQuoteBookRequested,
  onContractCompleted,
}: DocumentPortalPreviewProps) {
  const [localView, setLocalView] = useState<DocumentPortalView>(portalView);
  const [showCheckout, setShowCheckout] = useState(false);
  const [valuationSelection, setValuationSelection] = useState<PortalValuationSelection | null>(
    () => initialPortalValuationSelection(vars),
  );
  const view = onPortalViewChange ? portalView : localView;

  useEffect(() => {
    setValuationSelection(initialPortalValuationSelection(vars));
  }, [vars.move_reference, vars.pricing_type_key]);

  function setView(next: DocumentPortalView) {
    if (onPortalViewChange) onPortalViewChange(next);
    else setLocalView(next);
  }

  const pricingKind = pricingKindFromVars(vars);
  const isFlat = pricingKind === "flat";
  const isRegulated = isRegulatedFromVars(vars, previewForceUnregulated);

  const displayVars = useMemo(() => {
    if (!isRegulated || !valuationSelection) return vars;
    return applyValuationToPortalVars(vars, valuationSelection);
  }, [vars, isRegulated, valuationSelection]);

  const handleValuationChange = useCallback((selection: ValuationSelectionState) => {
    if (selection.coverageKey !== "released" && selection.coverageKey !== "full") return;
    setValuationSelection({
      coverageKey: selection.coverageKey,
      declaredValue: selection.declaredValue,
    });
  }, []);

  if (kind === "contract" && view === "confirmed") {
    return (
      <DocumentContractConfirmation
        vars={displayVars}
        accentColor={accentColor}
        logoDataUrl={logoDataUrl}
        companyName={companyName}
        compact={compact}
        framed={framed}
        viewport={viewport}
        portalHomeHref={portalHomeHref}
      />
    );
  }

  if (kind === "contract" && (showCheckout || view === "checkout")) {
    return (
      <DocumentContractCheckout
        vars={displayVars}
        accentColor={accentColor}
        logoDataUrl={logoDataUrl}
        companyName={companyName}
        compact={compact}
        framed={framed}
        viewport={viewport}
        interactive={interactive && view !== "checkout"}
        onComplete={() => {
          setShowCheckout(false);
          setView("confirmed");
          onContractCompleted?.();
        }}
        onBack={view === "checkout" ? undefined : () => setShowCheckout(false)}
      />
    );
  }

  const headline = renderDocumentTemplate(portal.headline, vars);
  const introHtml = renderPortalRichText(portal.intro, vars);
  const mainHtml = renderPortalRichText(portal.mainContent, vars);
  const footerHtml = renderPortalRichText(portal.footerNote, vars);
  const embed = videoEmbedUrl(portal.videoUrl);
  const isHourly = pricingKind === "hourly";
  const isFlatQuote = kind === "quote" && isFlat;
  const isHourlyQuote = kind === "quote" && isHourly;
  const ctaLabel = documentPortalCtaLabel(kind, displayVars);
  const hourlyLines = parseHourlyLinesFromVars(displayVars);
  const flatLines = parseFlatLinesFromVars(displayVars);
  const bookingCardChargeAcknowledgment = renderDocumentTemplate(
    portal.bookingCardChargeAcknowledgment,
    displayVars,
  );
  const declaredValue = Number(displayVars.declared_value) || 25_000;
  const liabilityPremium = displayVars.liability_premium
    ? Number(displayVars.liability_premium.replace(/[^0-9.-]/g, "")) || 0
    : 0;

  function handleContractCta() {
    if (kind === "contract" && interactive) {
      setShowCheckout(true);
    }
  }

  return (
    <article className={portalArticleClass({ compact, framed, viewport })}>
      <header
        className="relative overflow-hidden px-6 py-6 text-white"
        style={{
          background: isFlatQuote
            ? `linear-gradient(160deg, color-mix(in srgb, ${accentColor} 88%, #0f172a) 0%, ${accentColor} 45%, color-mix(in srgb, ${accentColor} 60%, #0f172a) 100%)`
            : `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 72%, #0f172a) 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
        />

        <div className="relative flex items-center gap-3">
          {logoDataUrl ? (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white/95 p-1 shadow-sm">
              <Image src={logoDataUrl} alt="" fill className="object-contain" unoptimized />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <Truck className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              {companyName}
            </p>
            <p className="truncate text-xs font-medium text-white/90">{displayVars.move_reference}</p>
          </div>
        </div>

        {isFlatQuote ? (
          <div className="relative mt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-white/20">
              <Sparkles className="h-3 w-3" />
              Your flat-rate proposal
            </span>
            <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight">{headline}</h1>
          </div>
        ) : isHourlyQuote ? (
          <div className="relative mt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-white/20">
              <Clock className="h-3 w-3" />
              Hourly estimate
            </span>
            <h1 className="mt-3 text-xl font-semibold tracking-tight">{headline}</h1>
          </div>
        ) : (
          <h1 className="relative mt-5 text-xl font-semibold tracking-tight">{headline}</h1>
        )}

        <div
          className="relative mt-3 text-sm leading-relaxed text-white/90 [&_li]:my-0.5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      </header>

      <div className="space-y-5 px-5 py-6 sm:px-6">
        {kind === "quote" && embed ? (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-inner">
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-white/70">
              <Play className="h-3 w-3" />
              A quick hello from Jonah
            </div>
            <div className="relative aspect-video bg-slate-950">
              {embed.endsWith(".mp4") || embed.endsWith(".webm") ? (
                <video src={embed} controls className="h-full w-full object-cover" />
              ) : (
                <iframe
                  src={embed}
                  title="Welcome video"
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )}
            </div>
          </section>
        ) : null}

        {portal.showValuation ? (
          <DocumentValuationSection
            kind={kind}
            accentColor={accentColor}
            isRegulated={isRegulated}
            unregulatedDisplay={portal.unregulatedValuationDisplay}
            initialCoverageKey={displayVars.liability_coverage_key}
            initialDeclaredValue={declaredValue}
            initialPremium={liabilityPremium}
            packingOnQuote={displayVars.packing_on_quote === "yes"}
            onSelectionChange={handleValuationChange}
          />
        ) : null}

        {portal.showPricingSummary ? (
          <DocumentPricingHero
            vars={displayVars}
            kind={kind}
            accentColor={accentColor}
            companyName={companyName}
            hourlyLines={hourlyLines}
            flatLines={flatLines}
            showFlatBreakdown={portal.showFlatBreakdown}
            showMaterialRates={displayVars.packing_on_quote === "yes"}
          />
        ) : null}

        {portal.showContents ? (
          <DocumentContentsSection
            vars={displayVars}
            kind={kind}
            accentColor={accentColor}
            interactive={interactive}
          />
        ) : null}

        <section
          className="prose prose-sm max-w-none text-sm leading-relaxed text-slate-700 [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: mainHtml }}
        />

        {portal.showDepositLine ? (
          <div
            className="rounded-xl px-4 py-3.5 text-sm"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 7%, white)`,
              border: `1px solid color-mix(in srgb, ${accentColor} 22%, white)`,
            }}
          >
            <p className="font-semibold text-slate-900">
              {kind === "contract"
                ? "Deposit to book your crew"
                : isFlat
                  ? "Ready to say yes?"
                  : "Next steps"}
            </p>
            <p className="mt-1 text-slate-700">
              {kind === "contract" ? (
                <>
                  Review and sign below, then pay{" "}
                  <span className="font-semibold tabular-nums">{displayVars.deposit_amount}</span> to secure{" "}
                  {displayVars.move_date}. Balance of{" "}
                  <span className="font-semibold tabular-nums">{displayVars.balance_due}</span> due on
                  completion — charged to your card on file after the move.
                </>
              ) : isFlat ? (
                <>
                  Tap below to request your date — no payment yet. If your date is available,
                  we&apos;ll follow up with a contract. Quote valid until {displayVars.quote_expiry}.
                </>
              ) : (
                <>
                  This is an hourly estimate
                  {displayVars.has_ballpark === "yes" && displayVars.hourly_ballpark_total
                    ? ` (ballpark ${displayVars.hourly_ballpark_total})`
                    : ""}{" "}
                  — final charges depend on actual time on move day. Tap below to request your date;
                  we&apos;ll send a contract if available. Valid until {displayVars.quote_expiry}.
                </>
              )}
            </p>
          </div>
        ) : null}

        {portal.showTerms ? (
          <DocumentTermsSection
            termsHourly={portal.termsHourly}
            termsFlat={portal.termsFlat}
            vars={vars}
            kind={kind}
            accentColor={accentColor}
          />
        ) : null}

        {portal.showSignatureBlock && kind === "contract" ? (
          <section className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <FileSignature className="h-3.5 w-3.5" />
              Agreement signature
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              When you tap <strong>{ctaLabel}</strong> below, you&apos;ll sign the agreement and enter
              your card to pay the deposit — your first payment with us.
            </p>
          </section>
        ) : null}

        <div
          className="text-center text-xs leading-relaxed text-slate-500 [&_li]:my-0.5 [&_p]:my-1 [&_ul]:inline-block [&_ul]:text-left"
          dangerouslySetInnerHTML={{ __html: footerHtml }}
        />

        {kind === "quote" ? (
          <DocumentQuoteResponseSection
            accentColor={accentColor}
            moveDate={displayVars.move_date}
            moveReference={displayVars.move_reference}
            companyName={companyName}
            interactive={interactive}
            moveId={moveId}
            bookingCardChargeAcknowledgment={bookingCardChargeAcknowledgment}
            onBookMove={onQuoteBookRequested}
          />
        ) : (
          <>
            <button
              type="button"
              onClick={handleContractCta}
              className="group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105 active:scale-[0.99]"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 8px 24px -8px color-mix(in srgb, ${accentColor} 55%, transparent)`,
              }}
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <p className="text-center text-[11px] leading-relaxed text-slate-400">
              Sign, pay deposit, and save your card for the balance due after your move
            </p>
          </>
        )}

        {isFlatQuote ? (
          <p className="text-center text-[11px] leading-relaxed text-slate-400">
            No hidden fees · Professional crew · Your price is locked in
          </p>
        ) : isHourlyQuote ? (
          <p className="text-center text-[11px] leading-relaxed text-slate-400">
            Billed hourly · Minimum applies · Crew keeps you updated on move day
          </p>
        ) : null}
      </div>

      <DocumentPortalFooter accentColor={accentColor} />
    </article>
  );
}

function initialPortalValuationSelection(
  vars: Record<string, string>,
): PortalValuationSelection | null {
  if (vars.is_regulated_move === "no") return null;
  const coverageKey =
    vars.liability_coverage_key === "full"
      ? "full"
      : vars.liability_coverage_key === "released"
        ? "released"
        : "released";
  const declaredValue = Math.max(
    5_000,
    Number(vars.declared_value) || 25_000,
  );
  return { coverageKey, declaredValue };
}

function portalArticleClass({
  compact,
  framed,
  viewport,
}: {
  compact?: boolean;
  framed?: boolean;
  viewport: PortalPreviewViewport;
}): string {
  if (framed) {
    return "w-full bg-white";
  }
  if (compact) {
    return "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm";
  }
  if (viewport === "desktop") {
    return "mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50";
  }
  return "mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50";
}
