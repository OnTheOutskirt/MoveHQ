"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import {
  buildCustomerPortalHomePath,
  customerHasSignedContract,
  customerPortalChecklist,
  customerPortalDocuments,
  getMoveDayCountdown,
  type CustomerPortalDocumentCard,
} from "@/lib/moves/customer-portal-home";
import { buildMoveDocumentPortalUrl } from "@/lib/moves/move-document-send";
import { isMovePostComplete } from "@/lib/moves/move-customer-portal";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  FileSignature,
  FileText,
  MessageSquareHeart,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type MoveCustomerPortalHubProps = {
  move: MoveRecord;
  companyName: string;
  accentColor: string;
  staffPreview?: boolean;
};

function DocumentCard({
  card,
  moveId,
  accentColor,
  staffPreview,
}: {
  card: CustomerPortalDocumentCard;
  moveId: string;
  accentColor: string;
  staffPreview?: boolean;
}) {
  const Icon = card.kind === "contract" ? FileSignature : FileText;
  const href = buildMoveDocumentPortalUrl(moveId, card.kind, { staffPreview });

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
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{card.title}</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {card.statusLabel}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{card.description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </Link>
  );
}

function InventoryChangePanel({ moveId }: { moveId: string }) {
  const { recordPortalInventoryChangeRequest } = useMoves();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    recordPortalInventoryChangeRequest(moveId, trimmed);
    setSubmitted(true);
    setMessage("");
    setOpen(false);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Package className="h-4 w-4 text-slate-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Inventory &amp; scope</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Need to add items, remove something, or fix a mistake? Send a change request to your
            move coordinator.
          </p>
          {submitted ? (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Request sent — we&apos;ll review your inventory and follow up if anything affects
              pricing.
            </p>
          ) : null}
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-3 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Request inventory change
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 space-y-2">
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what should change — e.g. add basement items, remove piano…"
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={!message.trim()}>
                  Send request
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function MoveCustomerPortalHub({
  move,
  companyName,
  accentColor,
  staffPreview = false,
}: MoveCustomerPortalHubProps) {
  const firstName = move.customerName.split(/\s+/)[0] ?? "there";
  const documents = customerPortalDocuments(move);
  const checklist = customerPortalChecklist(move);
  const countdown = getMoveDayCountdown(move);
  const postComplete = isMovePostComplete(move);
  const hasContract = customerHasSignedContract(move);
  const feedbackUrl = buildCustomerPortalHomePath(move.id, {
    previewFeedback: true,
    staffPreview,
  });

  return (
    <div className="space-y-5 px-5 py-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Hi {firstName}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Everything for your move with {companyName} lives here — estimates, agreements, prep
          checklists, and feedback after your crew finishes.
        </p>
      </div>

      {countdown && hasContract && !postComplete ? (
        <section
          className="overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50"
          style={{
            borderColor: `color-mix(in srgb, ${accentColor} 25%, white)`,
          }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 text-white"
            style={{
              background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 70%, #0f172a) 100%)`,
            }}
          >
            <CalendarDays className="h-5 w-5 shrink-0 opacity-90" />
            <div>
              <p className="text-sm font-semibold">{countdown.headline}</p>
              <p className="text-xs text-white/85">{countdown.subline}</p>
            </div>
          </div>
        </section>
      ) : null}

      {checklist.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <ClipboardList className="h-3.5 w-3.5" />
            Before move day
          </p>
          <ul className="mt-3 space-y-2.5">
            {checklist.map((item) => (
              <li key={item.id} className="flex gap-2.5">
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                )}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      item.done ? "text-slate-500 line-through" : "text-slate-900",
                    )}
                  >
                    {item.label}
                  </p>
                  {item.detail ? (
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {documents.length > 0 ? (
        <section className="space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Your documents
          </p>
          {documents.map((card) => (
            <DocumentCard
              key={card.kind}
              card={card}
              moveId={move.id}
              accentColor={accentColor}
              staffPreview={staffPreview}
            />
          ))}
        </section>
      ) : null}

      {(hasContract || documents.length > 0) && !postComplete ? (
        <InventoryChangePanel moveId={move.id} />
      ) : null}

      {postComplete ? (
        <Link
          href={feedbackUrl}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition hover:border-slate-300 hover:shadow-sm"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)` }}
          >
            <MessageSquareHeart className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Rate your crew</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Tell us how your movers did — we&apos;ll follow up if anything needs attention.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </Link>
      ) : null}

      {documents.length === 0 && !postComplete ? (
        <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Your team hasn&apos;t shared documents here yet. Check your email for a link when your
          estimate or contract is ready.
        </p>
      ) : null}
    </div>
  );
}
