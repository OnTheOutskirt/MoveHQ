"use client";

import { MoveDetailChangeOrdersSection } from "@/components/moves/detail/MoveDetailChangeOrdersSection";
import { MoveDetailLiabilityTab } from "@/components/moves/detail/MoveDetailLiabilityTab";
import { MoveDetailPaymentTab } from "@/components/moves/detail/MoveDetailPaymentTab";
import { MoveDetailQuoteTab } from "@/components/moves/detail/MoveDetailQuoteTab";
import { SendDocumentButtons } from "@/components/moves/detail/SendDocumentButtons";
import { useMoveSendDocument } from "@/components/moves/detail/MoveSendDocumentProvider";
import { DetailSection } from "@/components/moves/detail/DetailSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { MoveDetailTabSections } from "@/components/moves/detail/MoveDetailTabSections";
import {
  QUOTE_CONTRACT_SECTION_IDS,
  QUOTE_CONTRACT_SECTIONS,
} from "@/lib/moves/move-detail-sections";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, FileSignature, FileText, Truck } from "lucide-react";

type MoveDetailQuoteContractTabProps = {
  move: MoveRecord;
};

/** Pricing, liability coverage, payments, and signed agreements. */
export function MoveDetailQuoteContractTab({ move }: MoveDetailQuoteContractTabProps) {
  const quoteSent =
    move.pipelineStage === "quote_sent" ||
    move.pipelineStage === "needs_contract" ||
    move.pipelineStage === "booked" ||
    move.pipelineStage === "completed";
  const contractStage =
    move.pipelineStage === "needs_contract"
      ? "awaiting"
      : move.pipelineStage === "booked" || move.pipelineStage === "completed"
        ? "signed"
        : "not_sent";

  return (
    <MoveDetailTabSections
      sections={QUOTE_CONTRACT_SECTIONS}
      ariaLabel="Quote and contract sections"
    >
      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.pricing}>
        <MoveDetailQuoteTab move={move} />
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.changeOrders}>
        <MoveDetailChangeOrdersSection move={move} />
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.liability}>
        <MoveDetailLiabilityTab move={move} />
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.contracts}>
        <ContractsDocumentsSection
          move={move}
          quoteSent={quoteSent}
          contractStage={contractStage}
        />
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.payment}>
        <MoveDetailPaymentTab move={move} />
      </MoveDetailSectionAnchor>
    </MoveDetailTabSections>
  );
}

function ContractsDocumentsSection({
  move,
  quoteSent,
  contractStage,
}: {
  move: MoveRecord;
  quoteSent: boolean;
  contractStage: "not_sent" | "awaiting" | "signed";
}) {
  const { openSendQuote, openSendContract } = useMoveSendDocument();

  return (
    <DetailSection title="Contracts & documents">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Send for e-sign and collect deposit from the customer portal.
        </p>
        <SendDocumentButtons />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DocumentStatusCard
          icon={FileText}
          title="Quote / estimate"
          status={quoteSent ? "sent" : "draft"}
          statusLabel={quoteSent ? "Sent to customer" : "Not sent"}
          onAction={openSendQuote}
          actionLabel={quoteSent ? "Resend quote" : "Send quote"}
        />
        <DocumentStatusCard
          icon={FileSignature}
          title="Moving agreement"
          status={
            contractStage === "signed"
              ? "signed"
              : contractStage === "awaiting"
                ? "pending"
                : "draft"
          }
          statusLabel={
            contractStage === "signed"
              ? "Signed"
              : contractStage === "awaiting"
                ? "Awaiting signature"
                : "Not sent"
          }
          onAction={openSendContract}
          actionLabel={
            contractStage === "signed" ? "View / resend" : "Send contract"
          }
        />
        <DocumentStatusCard
          icon={Truck}
          title="Bill of Lading"
          status="draft"
          statusLabel="Generated on job day"
          disabled
        />
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-center text-xs text-slate-500 sm:col-span-2">
          Additional packets (valuation, COI, access forms) will attach to the contract send in a
          later release.
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] text-slate-400">
        {move.reference} · templates from Admin → Setup
      </p>
    </DetailSection>
  );
}

function DocumentStatusCard({
  icon: Icon,
  title,
  status,
  statusLabel,
  onAction,
  actionLabel,
  disabled,
}: {
  icon: typeof FileText;
  title: string;
  status: "draft" | "sent" | "pending" | "signed";
  statusLabel: string;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
}) {
  const statusStyles = {
    draft: "bg-slate-100 text-slate-600",
    sent: "bg-brand-100 text-brand-800",
    pending: "bg-amber-100 text-amber-900",
    signed: "bg-emerald-100 text-emerald-800",
  };

  const StatusIcon =
    status === "signed" ? CheckCircle2 : status === "pending" ? Clock : null;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">{title}</p>
          <p
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              statusStyles[status],
            )}
          >
            {StatusIcon ? <StatusIcon className="h-3 w-3" /> : null}
            {statusLabel}
          </p>
        </div>
      </div>
      {onAction && actionLabel && !disabled ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-brand-700 hover:border-brand-300 hover:bg-brand-50"
        >
          {actionLabel}
        </button>
      ) : disabled ? (
        <p className="mt-4 text-center text-xs text-slate-400">Coming soon</p>
      ) : null}
    </div>
  );
}
