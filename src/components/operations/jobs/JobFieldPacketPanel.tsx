"use client";

import { ClaimsDetailSidebar } from "@/components/operations/claims/ClaimsDetailSidebar";
import { useClaims } from "@/components/providers/ClaimsProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MediaList } from "@/components/crew-app/CrewFieldCapturePanel";
import {
  CLAIM_CATEGORY_LABELS,
  CLAIM_STATUS_BADGE,
  CLAIM_STATUS_LABELS,
  claimsForMove,
  formatClaimMoney,
} from "@/lib/operations/claims";
import { checklistProgress, currentStepLabel } from "@/lib/operations/claims-workflow";
import {
  buildDocumentPreview,
  formatSignedAt,
  type JobFieldDocument,
  type JobFieldPacket,
} from "@/lib/operations/job-field-packet";
import { formatMoveDate } from "@/lib/moves/format";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import {
  Camera,
  ChevronLeft,
  Clock,
  CreditCard,
  FileText,
  PenLine,
  Plus,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const DOC_ICONS: Record<JobFieldDocument["kind"], typeof FileText> = {
  bill_of_lading: FileText,
  inventory: FileText,
  damage_waiver: PenLine,
  job_completion: PenLine,
  payment: CreditCard,
};

type PanelMode =
  | { type: "closed" }
  | { type: "view"; claimId: string }
  | { type: "add"; moveId?: string };

type JobFieldPacketPanelProps = {
  packet: JobFieldPacket;
  move: MoveRecord;
};

export function JobFieldPacketPanel({ packet, move }: JobFieldPacketPanelProps) {
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [claimPanel, setClaimPanel] = useState<PanelMode>({ type: "closed" });
  const { claims } = useClaims();
  const { moves } = useMoves();

  const activeDoc = useMemo(
    () => packet.documents.find((d) => d.id === activeDocId) ?? null,
    [packet, activeDocId],
  );

  const preview = useMemo(
    () => (activeDoc ? buildDocumentPreview(packet, activeDoc) : null),
    [packet, activeDoc],
  );

  const moveClaims = useMemo(() => claimsForMove(claims, move.id), [claims, move.id]);

  if (activeDoc && preview) {
    return (
      <div className="space-y-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => setActiveDocId(null)}>
          <ChevronLeft className="h-4 w-4" />
          All forms
        </Button>
        <DocumentPreview preview={preview} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Forms from crew app
          </h3>
          <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {packet.documents.map((doc) => {
              const Icon = DOC_ICONS[doc.kind];
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => setActiveDocId(doc.id)}
                    className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{doc.label}</span>
                        <Badge variant={doc.status === "signed" ? "success" : "default"}>
                          {doc.status === "signed" ? "Signed" : "Submitted"}
                        </Badge>
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {doc.signedBy
                          ? `${doc.signedBy} · ${formatSignedAt(doc.signedAt)}`
                          : `${doc.submittedBy} · ${formatSignedAt(doc.signedAt)}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-brand-600">View</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</h3>
          <div className="mt-2 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{packet.payment.method}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                  {formatClaimMoney(packet.payment.amountCollected)}
                </p>
                {packet.payment.tip > 0 ? (
                  <p className="text-sm text-slate-600">
                    Includes {formatClaimMoney(packet.payment.tip)} tip
                  </p>
                ) : null}
              </div>
              <Badge variant={packet.payment.status === "paid" ? "success" : "warning"}>
                {packet.payment.status === "paid" ? "Paid" : "Partial"}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Collected by {packet.payment.collectedBy} ·{" "}
              {formatSignedAt(packet.payment.collectedAt)}
            </p>
          </div>
        </section>

        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            Time on job
          </h3>
          <ul className="mt-2 space-y-2">
            {packet.timeEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="text-slate-800">{entry.label}</span>
                <span className="shrink-0 text-right text-xs text-slate-500">
                  {formatSignedAt(entry.at)}
                  <span className="block text-[10px]">{entry.crewMember}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Camera className="h-3.5 w-3.5" />
            Field photos ({packet.photoCount})
          </h3>
          {packet.fieldMedia && packet.fieldMedia.length > 0 ? (
            <MediaList media={packet.fieldMedia} className="mt-2" />
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              {packet.photoCount} photos on file from the crew app.
            </p>
          )}
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Scale className="h-3.5 w-3.5" />
              Claims
            </h3>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setClaimPanel({ type: "add", moveId: move.id })}
            >
              <Plus className="h-3.5 w-3.5" />
              File claim
            </Button>
          </div>
          {moveClaims.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No claims filed for this move.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {moveClaims.map((claim) => (
                <li key={claim.id}>
                  <button
                    type="button"
                    onClick={() => setClaimPanel({ type: "view", claimId: claim.id })}
                    className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{claim.reference}</span>
                        <Badge className={CLAIM_STATUS_BADGE[claim.status]}>
                          {CLAIM_STATUS_LABELS[claim.status]}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-600">{claim.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {CLAIM_CATEGORY_LABELS[claim.category]} · {currentStepLabel(claim)} ·{" "}
                        {checklistProgress(claim.checklist).done}/
                        {checklistProgress(claim.checklist).total}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium tabular-nums text-slate-900">
                        {formatClaimMoney(claim.amountClaimed)}
                      </p>
                      <p className="text-xs text-slate-500">{formatMoveDate(claim.reportedDate)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/operations/claims"
            className="mt-2 inline-block text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Open claims workspace →
          </Link>
        </section>

        {packet.crewNotes ? (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Crew notes
            </h3>
            <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-sm text-amber-950">
              {packet.crewNotes}
            </p>
          </section>
        ) : null}
      </div>

      <ClaimsDetailSidebar
        mode={claimPanel}
        moves={moves}
        onClose={() => setClaimPanel({ type: "closed" })}
      />
    </>
  );
}

function DocumentPreview({
  preview,
}: {
  preview: ReturnType<typeof buildDocumentPreview>;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{preview.subtitle}</p>
      <div
        className={cn(
          "min-h-[20rem] rounded-lg border border-slate-200 bg-white shadow-inner",
          "bg-[linear-gradient(to_bottom,#fafafa_0%,#fff_12%)]",
        )}
      >
        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            PDF preview
          </p>
          <h4 className="font-serif text-lg font-semibold text-slate-900">{preview.title}</h4>
        </div>
        <div className="space-y-3 px-5 py-4 font-serif text-sm leading-relaxed text-slate-800">
          {preview.body.filter(Boolean).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        {preview.signatureLine ? (
          <div className="mx-5 mb-5 mt-6 border-t border-slate-200 pt-4">
            <p className="text-[10px] font-medium uppercase text-slate-400">Customer signature</p>
            <p className="mt-2 font-[family-name:var(--font-geist-sans)] text-2xl italic text-slate-800">
              {preview.signatureLine.name}
            </p>
            <p className="mt-1 text-xs text-slate-500">{preview.signatureLine.at}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
