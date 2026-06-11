"use client";

import {
  buildMoveDocumentPortalUrl,
  inferSentContractFromPipeline,
  inferSentQuoteFromPipeline,
  resolveSentContract,
  resolveSentQuote,
} from "@/lib/moves/move-document-send";
import { isMovePostComplete } from "@/lib/moves/move-customer-portal";
import type { MoveRecord } from "@/lib/moves/types";
import { ChevronRight, FileSignature, FileText, MessageSquareHeart } from "lucide-react";
import Link from "next/link";

type MoveCustomerPortalHubProps = {
  move: MoveRecord;
  companyName: string;
  logoDataUrl?: string | null;
  accentColor: string;
};

function PortalLinkCard({
  href,
  title,
  description,
  icon: Icon,
  accentColor,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof FileText;
  accentColor: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)` }}
      >
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </Link>
  );
}

export function MoveCustomerPortalHub({
  move,
  companyName,
  logoDataUrl,
  accentColor,
}: MoveCustomerPortalHubProps) {
  const firstName = move.customerName.split(/\s+/)[0] ?? "there";
  const quoteSent = resolveSentQuote(move) ?? inferSentQuoteFromPipeline(move);
  const contractSent = resolveSentContract(move) ?? inferSentContractFromPipeline(move);
  const postComplete = isMovePostComplete(move);

  const quoteUrl = buildMoveDocumentPortalUrl(move.id, "quote");
  const contractUrl = buildMoveDocumentPortalUrl(move.id, "contract");
  const feedbackUrl = `/portal/move?move=${encodeURIComponent(move.id)}`;

  const hasDocuments = Boolean(quoteSent || contractSent);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg bg-white">
      <header className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          {logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoDataUrl} alt="" className="h-9 w-9 rounded-lg object-contain" />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {companyName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{companyName}</p>
            <p className="text-xs text-slate-500">Your move portal</p>
          </div>
        </div>
      </header>

      <main className="space-y-5 px-5 py-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Hi {firstName}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Everything for your move with {companyName} lives here — estimates, agreements,
            and feedback after your crew finishes.
          </p>
        </div>

        <div className="space-y-2.5">
          {quoteSent ? (
            <PortalLinkCard
              href={quoteUrl}
              title="View your estimate"
              description="Review pricing, scope, and request to book your move date."
              icon={FileText}
              accentColor={accentColor}
            />
          ) : null}
          {contractSent ? (
            <PortalLinkCard
              href={contractUrl}
              title="Review & sign agreement"
              description="Choose valuation coverage and complete your moving contract."
              icon={FileSignature}
              accentColor={accentColor}
            />
          ) : null}
          {postComplete ? (
            <PortalLinkCard
              href={feedbackUrl}
              title="Rate your crew"
              description="Tell us how your movers did — we'll follow up if anything needs attention."
              icon={MessageSquareHeart}
              accentColor={accentColor}
            />
          ) : null}
        </div>

        {!hasDocuments && !postComplete ? (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Your team hasn&apos;t shared documents here yet. Check your email for a link when
            your estimate or contract is ready.
          </p>
        ) : null}
      </main>
    </div>
  );
}
