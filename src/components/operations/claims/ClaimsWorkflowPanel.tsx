"use client";

import { MessageTemplateBar } from "@/components/communications/MessageTemplateBar";
import { useClaims } from "@/components/providers/ClaimsProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { buildMessageTemplateContextFromMove } from "@/lib/communications/message-templates";
import { formatMoveDate } from "@/lib/moves/format";
import type { MoveRecord } from "@/lib/moves/types";
import {
  CLAIM_RESOLUTION_LABELS,
  CLAIM_STATUS_BADGE,
  CLAIM_STATUS_LABELS,
  formatClaimMoney,
} from "@/lib/operations/claims";
import { claimVendorLabel } from "@/lib/operations/claims-vendors";
import { CLAIM_VENDORS } from "@/lib/operations/claims-vendors";
import {
  applyAcknowledgementSent,
  applyCloseout,
  applyIntakeReviewed,
  applyIssueDocumented,
  applyResolutionProposed,
  applyVendorPackageSent,
  applyVendorResponseReceived,
  checklistProgress,
  documentStepLabel,
  getWorkflowStepState,
  isWaitingOnVendor,
  nextWorkflowFocus,
  WORKFLOW_STEP_META,
} from "@/lib/operations/claims-workflow";
import {
  CLAIM_RESOLUTION_TYPES,
  type ClaimChecklistId,
  type ClaimResolutionType,
  type MoveClaim,
} from "@/lib/operations/claims-types";
import { salesMovePath } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronRight,
  Circle,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ClaimsWorkflowPanelProps = {
  claim: MoveClaim;
  move?: MoveRecord;
};

export function ClaimsWorkflowPanel({ claim, move }: ClaimsWorkflowPanelProps) {
  const { updateClaim } = useClaims();
  const progress = useMemo(() => checklistProgress(claim.checklist), [claim.checklist]);
  const focus = useMemo(() => nextWorkflowFocus(claim.checklist), [claim.checklist]);
  const waiting = isWaitingOnVendor(claim);
  const isClosed = claim.status === "completed" || claim.status === "denied";
  const templateContext = useMemo(
    () => (move ? buildMessageTemplateContextFromMove(move) : {}),
    [move],
  );

  function patchClaim(patch: Partial<MoveClaim>) {
    updateClaim(claim.id, patch);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Claim status
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge className={CLAIM_STATUS_BADGE[claim.status]}>
                {CLAIM_STATUS_LABELS[claim.status]}
              </Badge>
              {waiting ? (
                <Badge className="bg-amber-100 text-amber-900">Waiting on vendor</Badge>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Progress
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">
              {progress.done}/{progress.total} steps
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        {!isClosed && focus ? (
          <p className="mt-3 text-sm text-slate-700">
            <span className="font-medium text-brand-800">Your next step:</span>{" "}
            {WORKFLOW_STEP_META[focus].shortLabel}
          </p>
        ) : isClosed && claim.resolutionType ? (
          <p className="mt-3 text-sm text-slate-700">
            Resolved as{" "}
            <span className="font-medium">{CLAIM_RESOLUTION_LABELS[claim.resolutionType]}</span>
            {claim.amountPaid > 0 ? ` · ${formatClaimMoney(claim.amountPaid)}` : ""}
          </p>
        ) : null}
        {waiting && claim.vendorResponseDue ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-800">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Vendor response due {formatMoveDate(claim.vendorResponseDue)}
          </div>
        ) : null}
      </div>

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Guided workflow
        </p>
        <p className="mt-0.5 text-xs text-slate-600">
          Complete each step in order — the checklist updates automatically when you take action.
        </p>
        <ol className="mt-3 space-y-2">
          {claim.checklist.map((item, index) => {
            const state = getWorkflowStepState(claim, item.id);
            if (state === "skipped") return null;
            const meta = WORKFLOW_STEP_META[item.id];
            const isCurrent = state === "current" && !isClosed;

            return (
              <li key={item.id}>
                <div
                  className={cn(
                    "rounded-lg border transition-colors",
                    state === "completed" && "border-emerald-200 bg-emerald-50/40",
                    isCurrent && "border-brand-300 bg-brand-50/50 shadow-sm",
                    state === "upcoming" && "border-slate-200 bg-slate-50/50 opacity-70",
                  )}
                >
                  <div className="flex items-start gap-2.5 px-3 py-2.5">
                    <StepIcon state={state} stepNumber={index + 1} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium text-slate-900",
                            state === "completed" && "text-emerald-900",
                          )}
                        >
                          {item.id === "document_damage"
                            ? documentStepLabel(claim.category)
                            : meta.label}
                        </p>
                        {isCurrent ? (
                          <Badge className="bg-brand-100 text-brand-900">Do this now</Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600">{meta.description}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{meta.ownerHint}</p>
                      {item.doneAt ? (
                        <p className="mt-1 text-[10px] text-emerald-700">
                          Completed {formatMoveDate(item.doneAt.slice(0, 10))}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {isCurrent ? (
                    <div className="border-t border-brand-200/60 bg-white/60 px-3 py-3">
                      <ActiveStepForm
                        stepId={item.id}
                        claim={claim}
                        move={move}
                        templateContext={templateContext}
                        onPatch={patchClaim}
                      />
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {claim.commsLog.length > 0 ? (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Communication log
          </p>
          <ul className="mt-2 space-y-2">
            {claim.commsLog.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs"
              >
                <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
                  <span className="font-medium capitalize text-slate-700">{entry.channel}</span>
                  <span>·</span>
                  <span>{entry.direction}</span>
                  <span>·</span>
                  <span>{formatMoveDate(entry.at.slice(0, 10))}</span>
                </div>
                <p className="mt-1 text-slate-800">{entry.summary}</p>
                {entry.recipient ? (
                  <p className="mt-0.5 text-slate-500">To: {entry.recipient}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function StepIcon({ state, stepNumber }: { state: string; stepNumber: number }) {
  if (state === "completed") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
        {stepNumber}
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400">
      <Circle className="h-3 w-3" />
    </span>
  );
}

function ActiveStepForm({
  stepId,
  claim,
  move,
  templateContext,
  onPatch,
}: {
  stepId: ClaimChecklistId;
  claim: MoveClaim;
  move?: MoveRecord;
  templateContext: Record<string, string>;
  onPatch: (patch: Partial<MoveClaim>) => void;
}) {
  switch (stepId) {
    case "intake_review":
      return <IntakeReviewStep claim={claim} move={move} onPatch={onPatch} />;
    case "document_damage":
      return <DocumentIssueStep claim={claim} onPatch={onPatch} />;
    case "send_acknowledgement":
      return (
        <AcknowledgementStep claim={claim} templateContext={templateContext} onPatch={onPatch} />
      );
    case "select_vendor":
    case "send_to_vendor":
      return (
        <VendorSendStep claim={claim} templateContext={templateContext} onPatch={onPatch} />
      );
    case "waiting_vendor":
      return <VendorWaitStep claim={claim} onPatch={onPatch} />;
    case "propose_resolution":
      return (
        <ProposeResolutionStep
          claim={claim}
          templateContext={templateContext}
          onPatch={onPatch}
        />
      );
    case "closeout":
      return <CloseoutStep claim={claim} onPatch={onPatch} />;
    default:
      return null;
  }
}

function IntakeReviewStep({
  claim,
  move,
  onPatch,
}: {
  claim: MoveClaim;
  move?: MoveRecord;
  onPatch: (patch: Partial<MoveClaim>) => void;
}) {
  const [notes, setNotes] = useState("");

  const checklist = [
    "Open the linked move file and review crew photos",
    "Check pre-move / post-move documentation",
    "Read customer report and compare to move notes",
    "Confirm claim category matches the issue",
  ];

  return (
    <div className="space-y-3">
      {move ? (
        <Link
          href={salesMovePath(claim.moveId)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Open move file
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
      <ul className="space-y-1.5">
        {checklist.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-slate-700">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            {item}
          </li>
        ))}
      </ul>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Optional intake notes (logged internally)…"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <Button
        type="button"
        size="sm"
        onClick={() =>
          onPatch(
            applyIntakeReviewed(
              claim,
              notes.trim() || "Intake review completed — move file reviewed",
            ),
          )
        }
      >
        Complete intake review
      </Button>
    </div>
  );
}

function DocumentIssueStep({
  claim,
  onPatch,
}: {
  claim: MoveClaim;
  onPatch: (patch: Partial<MoveClaim>) => void;
}) {
  const [documentation, setDocumentation] = useState(claim.damageDocumentation ?? "");
  const [amount, setAmount] = useState(String(claim.amountClaimed || ""));

  return (
    <div className="space-y-3">
      <textarea
        value={documentation}
        onChange={(e) => setDocumentation(e.target.value)}
        rows={4}
        placeholder={
          claim.category === "lost_item"
            ? "Item description, box label, last known location, estimated replacement cost…"
            : "What happened, where on the property, extent of damage, photos referenced…"
        }
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Amount claimed ($)
        </span>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </label>
      <Button
        type="button"
        size="sm"
        disabled={!documentation.trim()}
        onClick={() =>
          onPatch(
            applyIssueDocumented(
              claim,
              documentation,
              Number(amount.replace(/[^0-9.-]/g, "")) || 0,
            ),
          )
        }
      >
        Save documentation & continue
      </Button>
    </div>
  );
}

function AcknowledgementStep({
  claim,
  templateContext,
  onPatch,
}: {
  claim: MoveClaim;
  templateContext: Record<string, string>;
  onPatch: (patch: Partial<MoveClaim>) => void;
}) {
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <ChannelButton
          active={channel === "email"}
          onClick={() => setChannel("email")}
          icon={Mail}
          label="Email"
        />
        <ChannelButton
          active={channel === "sms"}
          onClick={() => setChannel("sms")}
          icon={MessageSquare}
          label="SMS"
        />
      </div>
      <MessageTemplateBar
        channel={channel}
        category="ops"
        context={templateContext}
        onApply={setDraft}
        onApplyEmail={({ body }) => setDraft(body)}
      />
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        placeholder="Message preview…"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <Button
        type="button"
        size="sm"
        onClick={() => {
          const summary =
            draft.trim() ||
            `${channel === "email" ? "Email" : "SMS"} acknowledgement sent to customer`;
          onPatch(applyAcknowledgementSent(claim, channel, summary));
          setDraft("");
        }}
      >
        Send acknowledgement & mark complete
      </Button>
    </div>
  );
}

function VendorSendStep({
  claim,
  templateContext,
  onPatch,
}: {
  claim: MoveClaim;
  templateContext: Record<string, string>;
  onPatch: (patch: Partial<MoveClaim>) => void;
}) {
  const [vendorId, setVendorId] = useState(claim.vendorId ?? "");
  const [draft, setDraft] = useState("");
  const selectedVendor = CLAIM_VENDORS.find((v) => v.id === vendorId);

  return (
    <div className="space-y-3">
      <select
        value={vendorId}
        onChange={(e) => setVendorId(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
      >
        <option value="">Select repair vendor…</option>
        {CLAIM_VENDORS.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name} — {v.specialty}
          </option>
        ))}
      </select>
      {selectedVendor ? (
        <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-600">
          <p className="font-medium text-slate-800">{selectedVendor.name}</p>
          <p className="mt-0.5">{selectedVendor.specialty}</p>
          <p className="mt-1">{selectedVendor.contactEmail}</p>
          {selectedVendor.portalUrl ? (
            <a
              href={selectedVendor.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-brand-600 hover:underline"
            >
              Vendor portal
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      ) : null}
      <MessageTemplateBar
        channel="email"
        category="ops"
        context={templateContext}
        onApply={setDraft}
        onApplyEmail={({ body }) => setDraft(body)}
      />
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        placeholder="Vendor email body — include photos, address, and scope…"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <Button
        type="button"
        size="sm"
        disabled={!vendorId}
        onClick={() => {
          const summary =
            draft.trim() || `Claim package sent to ${claimVendorLabel(vendorId)}`;
          onPatch(applyVendorPackageSent(claim, vendorId, summary));
          setDraft("");
        }}
      >
        Send to vendor & start tracking
      </Button>
    </div>
  );
}

function VendorWaitStep({
  claim,
  onPatch,
}: {
  claim: MoveClaim;
  onPatch: (patch: Partial<MoveClaim>) => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-2.5 text-xs text-amber-900">
        <p className="font-medium">
          Waiting on {claim.vendorId ? claimVendorLabel(claim.vendorId) : "vendor"}
        </p>
        <p className="mt-1">
          Follow up if no response by{" "}
          {claim.vendorResponseDue
            ? formatMoveDate(claim.vendorResponseDue)
            : "the due date"}
          . Log the response when received.
        </p>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Vendor quote, walkthrough notes, or response summary…"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() =>
          onPatch(
            applyVendorResponseReceived(
              claim,
              notes.trim() || "Vendor response received and logged",
            ),
          )
        }
      >
        Log vendor response & continue
      </Button>
    </div>
  );
}

function ProposeResolutionStep({
  claim,
  templateContext,
  onPatch,
}: {
  claim: MoveClaim;
  templateContext: Record<string, string>;
  onPatch: (patch: Partial<MoveClaim>) => void;
}) {
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [proposal, setProposal] = useState(claim.resolutionProposal ?? "");

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">
        Present the repair plan, credit amount, or next steps to the customer. Get verbal or
        written agreement before closeout.
      </p>
      <div className="flex gap-2">
        <ChannelButton
          active={channel === "email"}
          onClick={() => setChannel("email")}
          icon={Mail}
          label="Email"
        />
        <ChannelButton
          active={channel === "sms"}
          onClick={() => setChannel("sms")}
          icon={MessageSquare}
          label="SMS"
        />
      </div>
      <MessageTemplateBar
        channel={channel}
        category="ops"
        context={templateContext}
        onApply={setProposal}
        onApplyEmail={({ body }) => setProposal(body)}
      />
      <textarea
        value={proposal}
        onChange={(e) => setProposal(e.target.value)}
        rows={4}
        placeholder="Resolution proposal to customer…"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <Button
        type="button"
        size="sm"
        disabled={!proposal.trim()}
        onClick={() => onPatch(applyResolutionProposed(claim, proposal, channel))}
      >
        Send proposal & mark complete
      </Button>
    </div>
  );
}

function CloseoutStep({
  claim,
  onPatch,
}: {
  claim: MoveClaim;
  onPatch: (patch: Partial<MoveClaim>) => void;
}) {
  const [resolutionType, setResolutionType] = useState<ClaimResolutionType>(
    claim.resolutionType ?? "credit",
  );
  const [amountPaid, setAmountPaid] = useState(String(claim.amountPaid || claim.amountClaimed || ""));
  const [denialReason, setDenialReason] = useState(claim.denialReason ?? "");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (resolutionType === "denied") setAmountPaid("0");
  }, [resolutionType]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">
        Record the final outcome. This closes the claim and moves it to Resolved.
      </p>
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Resolution type
        </span>
        <select
          value={resolutionType}
          onChange={(e) => setResolutionType(e.target.value as ClaimResolutionType)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
        >
          {CLAIM_RESOLUTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {CLAIM_RESOLUTION_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      {resolutionType !== "denied" ? (
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Amount paid / credited ($)
          </span>
          <input
            type="number"
            min={0}
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          />
        </label>
      ) : (
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Denial reason
          </span>
          <textarea
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            rows={2}
            placeholder="Why the claim was denied…"
            className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          />
        </label>
      )}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Closeout notes (optional)…"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <Button
        type="button"
        size="sm"
        disabled={resolutionType === "denied" && !denialReason.trim()}
        onClick={() =>
          onPatch(
            applyCloseout(claim, {
              resolutionType,
              amountPaid: Number(amountPaid.replace(/[^0-9.-]/g, "")) || 0,
              denialReason: resolutionType === "denied" ? denialReason : undefined,
              closeoutNotes: notes.trim() || undefined,
            }),
          )
        }
      >
        Close claim
      </Button>
    </div>
  );
}

function ChannelButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium",
        active
          ? "border-brand-300 bg-white text-brand-800 shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
