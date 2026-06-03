"use client";

import {
  renderDocumentTemplate,
  renderPortalRichText,
  videoEmbedUrl,
  type DocumentSendKind,
} from "@/lib/moves/document-template-render";
import type { DocumentPortalSettings } from "@/lib/settings/document-template-types";
import { FileSignature, Play, Truck } from "lucide-react";
import Image from "next/image";

type DocumentPortalPreviewProps = {
  portal: DocumentPortalSettings;
  vars: Record<string, string>;
  kind: DocumentSendKind;
  logoDataUrl: string | null;
  accentColor: string;
  companyName: string;
  compact?: boolean;
};

export function DocumentPortalPreview({
  portal,
  vars,
  kind,
  logoDataUrl,
  accentColor,
  companyName,
  compact,
}: DocumentPortalPreviewProps) {
  const headline = renderDocumentTemplate(portal.headline, vars);
  const introHtml = renderPortalRichText(portal.intro, vars);
  const mainHtml = renderPortalRichText(portal.mainContent, vars);
  const footerHtml = renderPortalRichText(portal.footerNote, vars);
  const embed = videoEmbedUrl(portal.videoUrl);

  return (
    <article
      className={
        compact
          ? "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          : "mx-auto max-w-lg overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-md"
      }
    >
      <header
        className="px-6 py-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 75%, #0f172a) 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          {logoDataUrl ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/95 p-1">
              <Image src={logoDataUrl} alt="" fill className="object-contain" unoptimized />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
              <Truck className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              {companyName}
            </p>
            <p className="truncate text-xs text-white/90">{vars.move_reference}</p>
          </div>
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">{headline}</h1>
        <div
          className="mt-2 text-sm leading-relaxed text-white/90 [&_li]:my-0.5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      </header>

      <div className="space-y-5 px-6 py-6">
        {kind === "quote" && embed ? (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-inner">
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-white/70">
              <Play className="h-3 w-3" />
              Welcome video
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

        {portal.showPricingSummary ? (
          <section className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Quote total
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
                {vars.quote_total}
              </p>
              <p className="text-xs text-slate-500">{vars.pricing_type}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Move date
              </p>
              <p className="mt-0.5 text-sm font-medium text-slate-900">{vars.move_date}</p>
              <p className="text-xs text-slate-500">{vars.arrival_window}</p>
            </div>
            <div className="col-span-2 border-t border-slate-200/80 pt-3">
              <p className="text-[10px] text-slate-500">From</p>
              <p className="text-sm text-slate-800">{vars.origin}</p>
              <p className="mt-2 text-[10px] text-slate-500">To</p>
              <p className="text-sm text-slate-800">{vars.destination}</p>
            </div>
          </section>
        ) : null}

        <section
          className="prose prose-sm max-w-none text-sm leading-relaxed text-slate-700 [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: mainHtml }}
        />

        {portal.showDepositLine ? (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 8%, white)`,
              border: `1px solid color-mix(in srgb, ${accentColor} 25%, white)`,
            }}
          >
            <p className="font-semibold text-slate-900">
              {kind === "contract" ? "Deposit to book" : "Deposit to hold your date"}
            </p>
            <p className="mt-0.5 tabular-nums text-slate-800">{vars.deposit_amount}</p>
            {kind === "contract" ? (
              <p className="mt-1 text-xs text-slate-600">
                Balance due on completion: {vars.balance_due}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-600">Valid until {vars.quote_expiry}</p>
            )}
          </div>
        ) : null}

        {portal.showSignatureBlock && kind === "contract" ? (
          <section className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <FileSignature className="h-3.5 w-3.5" />
              Customer signature
            </p>
            <div className="mt-3 h-14 rounded-lg border border-slate-200 bg-white" />
            <p className="mt-2 text-xs text-slate-500">Tap to sign · e-sign connects at go-live</p>
          </section>
        ) : null}

        <div
          className="text-center text-xs leading-relaxed text-slate-500 [&_li]:my-0.5 [&_p]:my-1 [&_ul]:inline-block [&_ul]:text-left"
          dangerouslySetInnerHTML={{ __html: footerHtml }}
        />

        <button
          type="button"
          className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          {kind === "quote" ? "Review & book" : "Sign & pay deposit"}
        </button>
      </div>
    </article>
  );
}
