"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatClaimMoney } from "@/lib/operations/claims";
import {
  buildDocumentPreview,
  formatSignedAt,
  type JobFieldDocument,
  type JobFieldPacket,
} from "@/lib/operations/job-field-packet";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import {
  Camera,
  ChevronLeft,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  PenLine,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type JobFieldPacketSidebarProps = {
  packet: JobFieldPacket | null;
  onClose: () => void;
};

const DOC_ICONS: Record<JobFieldDocument["kind"], typeof FileText> = {
  bill_of_lading: FileText,
  inventory: FileText,
  damage_waiver: PenLine,
  job_completion: PenLine,
  payment: CreditCard,
};

export function JobFieldPacketSidebar({ packet, onClose }: JobFieldPacketSidebarProps) {
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const activeDoc = useMemo(
    () => packet?.documents.find((d) => d.id === activeDocId) ?? null,
    [packet, activeDocId],
  );

  const preview = useMemo(
    () => (packet && activeDoc ? buildDocumentPreview(packet, activeDoc) : null),
    [packet, activeDoc],
  );

  function closeAll() {
    setActiveDocId(null);
    onClose();
  }

  function backToList() {
    setActiveDocId(null);
  }

  if (!packet) return null;

  const title = activeDoc ? activeDoc.label : "Field packet";
  const description = activeDoc
    ? `${packet.customerName} · ${packet.dayLabel}`
    : `${packet.moveRef} · ${formatSignedAt(packet.payment.collectedAt)}`;

  return (
    <DetailSidebar
      open={!!packet}
      onClose={closeAll}
      title={title}
      description={description}
      widthClassName="max-w-lg"
      headerExtra={
        activeDoc ? (
          <Button type="button" variant="ghost" size="sm" onClick={backToList}>
            <ChevronLeft className="h-4 w-4" />
            All forms
          </Button>
        ) : (
          <Link
            href={salesMovePath(packet.moveId)}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Move
            <ExternalLink className="h-3 w-3" />
          </Link>
        )
      }
    >
      {activeDoc && preview ? (
        <DocumentPreview preview={preview} />
      ) : (
        <PacketOverview packet={packet} onOpenDocument={setActiveDocId} />
      )}
    </DetailSidebar>
  );
}

function PacketOverview({
  packet,
  onOpenDocument,
}: {
  packet: JobFieldPacket;
  onOpenDocument: (id: string) => void;
}) {
  return (
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
                  onClick={() => onOpenDocument(doc.id)}
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
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => onOpenDocument(packet.documents.find((d) => d.kind === "payment")?.id ?? packet.documents[0]!.id)}
          >
            View payment receipt
          </Button>
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

      <section className="flex items-center gap-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Camera className="h-4 w-4 text-slate-400" />
          {packet.photoCount} photos on file
        </span>
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

      <p className="text-xs text-slate-500">
        Demo field packet — live data will sync from the crew app (signatures, payments, photos, and
        clock events).
      </p>
    </div>
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
          "min-h-[28rem] rounded-lg border border-slate-200 bg-white shadow-inner",
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
      <p className="text-xs text-slate-500">
        Full PDF download will be available when crew app documents are stored in MoveHQ.
      </p>
    </div>
  );
}
