"use client";

import { ClaimsWorkflowPanel } from "@/components/operations/claims/ClaimsWorkflowPanel";
import {
  CompletedMoveJobRefPicker,
  type CompletedMoveJobRefValue,
} from "@/components/operations/crew/CompletedMoveJobRefPicker";
import { useClaims } from "@/components/providers/ClaimsProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { TabBar } from "@/components/shared/TabBar";
import { Badge } from "@/components/ui/Badge";
import {
  CLAIM_CATEGORY_LABELS,
  CLAIM_STATUS_BADGE,
  CLAIM_STATUS_LABELS,
  currentStepLabel,
  formatClaimMoney,
} from "@/lib/operations/claims";
import {
  CLAIM_CATEGORIES,
  type ClaimCategory,
  type MoveClaim,
  type NewMoveClaim,
} from "@/lib/operations/claims-types";
import {
  buildClaimDraftFromMove,
  createDefaultChecklist,
  migrateChecklistForCategory,
} from "@/lib/operations/claims-workflow";
import { salesMovePath } from "@/lib/navigation/routes";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PanelMode =
  | { type: "closed" }
  | { type: "view"; claimId: string }
  | { type: "add"; moveId?: string };

type SidebarTab = "workflow" | "details";

type ClaimsDetailSidebarProps = {
  mode: PanelMode;
  moves: MoveRecord[];
  onClose: () => void;
};

type FormState = {
  jobLink: CompletedMoveJobRefValue;
  category: ClaimCategory;
  title: string;
  description: string;
  reportedDate: string;
  amountClaimed: string;
  reportedBy: string;
  notes: string;
};

function jobLinkForMove(moves: MoveRecord[], moveId = ""): CompletedMoveJobRefValue {
  const move = moves.find((m) => m.id === moveId);
  return {
    jobRef: move?.reference ?? "",
    moveId: move?.id,
  };
}

function emptyForm(moveId = "", moves: MoveRecord[]): FormState {
  const move = moves.find((m) => m.id === moveId);
  if (move) {
    const draft = buildClaimDraftFromMove(move);
    return {
      jobLink: jobLinkForMove(moves, moveId),
      category: draft.category,
      title: draft.title,
      description: draft.description ?? "",
      reportedDate: draft.reportedDate,
      amountClaimed: String(draft.amountClaimed || ""),
      reportedBy: draft.reportedBy ?? "",
      notes: "",
    };
  }
  return {
    jobLink: jobLinkForMove(moves, moveId),
    category: "damage",
    title: "",
    description: "",
    reportedDate: new Date().toISOString().slice(0, 10),
    amountClaimed: "",
    reportedBy: "",
    notes: "",
  };
}

function formFromClaim(claim: MoveClaim, moves: MoveRecord[]): FormState {
  return {
    jobLink: jobLinkForMove(moves, claim.moveId),
    category: claim.category,
    title: claim.title,
    description: claim.description ?? "",
    reportedDate: claim.reportedDate,
    amountClaimed: String(claim.amountClaimed || ""),
    reportedBy: claim.reportedBy ?? "",
    notes: claim.notes ?? "",
  };
}

function parseMoney(value: string): number {
  const n = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function ClaimsDetailSidebar({ mode, moves, onClose }: ClaimsDetailSidebarProps) {
  const { addClaim, updateClaim, removeClaim, getClaimById } = useClaims();
  const claim = mode.type === "view" ? getClaimById(mode.claimId) : undefined;
  const open = mode.type !== "closed";
  const isAdd = mode.type === "add";

  const [tab, setTab] = useState<SidebarTab>("workflow");
  const [form, setForm] = useState<FormState>(() =>
    isAdd
      ? emptyForm(mode.type === "add" ? (mode.moveId ?? "") : "", moves)
      : emptyForm("", moves),
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (mode.type === "view" && claim) {
      setForm(formFromClaim(claim, moves));
      setTab("workflow");
    }
    if (mode.type === "add") setForm(emptyForm(mode.moveId ?? "", moves));
  }, [mode, claim, moves]);

  const selectedMove = useMemo(
    () => (form.jobLink.moveId ? moves.find((m) => m.id === form.jobLink.moveId) : undefined),
    [moves, form.jobLink.moveId],
  );

  useEffect(() => {
    if (!isAdd || !selectedMove) return;
    const draft = buildClaimDraftFromMove(selectedMove, form.category);
    setForm((f) => ({
      ...f,
      title: f.title.trim() ? f.title : draft.title,
      description: f.description.trim() ? f.description : (draft.description ?? ""),
      reportedBy: f.reportedBy.trim() ? f.reportedBy : (draft.reportedBy ?? ""),
    }));
  }, [isAdd, selectedMove, form.category]);

  function buildPayload(): NewMoveClaim | null {
    if (!form.jobLink.moveId || !form.title.trim() || !selectedMove) return null;
    return {
      moveId: form.jobLink.moveId,
      customerName: selectedMove.customerName,
      moveReference: selectedMove.reference,
      status: "new",
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      reportedDate: form.reportedDate,
      amountClaimed: parseMoney(form.amountClaimed),
      amountPaid: 0,
      reportedBy: form.reportedBy.trim() || undefined,
      notes: form.notes.trim() || undefined,
      checklist: createDefaultChecklist(form.category),
      commsLog: [],
    };
  }

  function buildUpdatePatch(): Partial<MoveClaim> | null {
    const payload = buildPayload();
    if (!payload || !claim) return null;
    const { moveId: _moveId, customerName: _cn, moveReference: _mr, status: _s, ...rest } =
      payload;
    const checklist =
      form.category !== claim.category
        ? migrateChecklistForCategory(claim, form.category)
        : claim.checklist;
    return {
      ...rest,
      checklist,
      commsLog: claim.commsLog,
      status: claim.status,
      pendingReason: claim.pendingReason,
      amountPaid: claim.amountPaid,
      vendorId: claim.vendorId,
      acknowledgementSentAt: claim.acknowledgementSentAt,
      vendorSentAt: claim.vendorSentAt,
      vendorResponseDue: claim.vendorResponseDue,
      vendorResponseReceivedAt: claim.vendorResponseReceivedAt,
      damageDocumentation: claim.damageDocumentation,
      resolutionProposal: claim.resolutionProposal,
      resolutionType: claim.resolutionType,
      denialReason: claim.denialReason,
    };
  }

  function handleSave() {
    const payload = buildPayload();
    if (!payload) return;
    if (isAdd) {
      addClaim(payload);
      onClose();
      return;
    }
    const patch = buildUpdatePatch();
    if (claim && patch) {
      updateClaim(claim.id, patch);
      onClose();
    }
  }

  const linkedMove = claim
    ? moves.find((m) => m.id === claim.moveId)
    : selectedMove;

  return (
    <>
      <DetailSidebar
        open={open}
        onClose={onClose}
        title={isAdd ? "New claim" : claim?.reference ?? "Claim"}
        description={
          isAdd
            ? "Pre-filled from the move — complete the workflow checklist after intake."
            : claim
              ? `${claim.customerName} · ${claim.moveReference}`
              : undefined
        }
        widthClassName="max-w-xl"
      >
        {open ? (
          <div className="space-y-4">
            {!isAdd && claim ? (
              <Link
                href={salesMovePath(claim.moveId)}
                className="inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Open move →
              </Link>
            ) : null}

            {!isAdd && claim ? (
              <TabBar
                tabs={[
                  { id: "workflow" as const, label: "Workflow" },
                  { id: "details" as const, label: "Details" },
                ]}
                activeTab={tab}
                onChange={setTab}
              />
            ) : null}

            {!isAdd && claim && tab === "workflow" ? (
              <ClaimsWorkflowPanel claim={claim} move={linkedMove} />
            ) : (
              <ClaimDetailsForm
                isAdd={isAdd}
                claim={claim}
                form={form}
                setForm={setForm}
                moves={moves}
                selectedMove={selectedMove}
                onSave={handleSave}
                onClose={onClose}
                onDelete={claim ? () => setConfirmDelete(true) : undefined}
              />
            )}
          </div>
        ) : null}
      </DetailSidebar>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (claim) {
            removeClaim(claim.id);
            setConfirmDelete(false);
            onClose();
          }
        }}
        title="Delete this claim?"
        description="This removes the claim from the operations log. The move record is not affected."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}

function ClaimDetailsForm({
  isAdd,
  claim,
  form,
  setForm,
  moves,
  selectedMove,
  onSave,
  onClose,
  onDelete,
}: {
  isAdd: boolean;
  claim?: MoveClaim;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  moves: MoveRecord[];
  selectedMove?: MoveRecord;
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="space-y-4">
      {isAdd ? (
        <Field label="Related move">
          <CompletedMoveJobRefPicker
            value={form.jobLink}
            onChange={(jobLink) => setForm((f) => ({ ...f, jobLink }))}
            placeholder="Search completed jobs…"
          />
          {selectedMove ? (
            <p className="mt-1 text-xs text-slate-500">
              Fields below are pre-filled from {selectedMove.reference}.
            </p>
          ) : null}
        </Field>
      ) : claim ? (
        <Field label="Related move">
          <input
            type="text"
            value={`${claim.moveReference} · ${claim.customerName}`}
            readOnly
            className={cn(inputClass, "bg-slate-50 text-slate-700")}
          />
        </Field>
      ) : null}

      {!isAdd && claim ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Workflow status
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge className={CLAIM_STATUS_BADGE[claim.status]}>
              {CLAIM_STATUS_LABELS[claim.status]}
            </Badge>
            <span className="text-sm text-slate-700">
              Current step: <span className="font-medium">{currentStepLabel(claim)}</span>
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Status and payout are set by the workflow — use the Workflow tab to advance this claim.
          </p>
        </div>
      ) : null}

      <Field label="Title">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className={inputClass}
          placeholder="Short summary"
        />
      </Field>

      <Field label="Category">
        <select
          value={form.category}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              category: e.target.value as ClaimCategory,
            }))
          }
          className={inputClass}
          disabled={!isAdd && claim ? claim.checklist.some((c) => c.done) : false}
        >
          {CLAIM_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CLAIM_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        {!isAdd && claim?.checklist.some((c) => c.done) ? (
          <p className="mt-1 text-xs text-slate-500">
            Category locked after workflow has started.
          </p>
        ) : null}
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className={inputClass}
        />
      </Field>

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Amounts</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <Field label="Claimed">
            <input
              type="number"
              min={0}
              step={1}
              value={form.amountClaimed}
              onChange={(e) => setForm((f) => ({ ...f, amountClaimed: e.target.value }))}
              className={inputClass}
              disabled={!isAdd && claim?.checklist.some((c) => c.id === "document_damage" && c.done)}
            />
          </Field>
          {!isAdd && claim ? (
            <Field label="Paid out">
              <input
                type="text"
                readOnly
                value={claim.amountPaid > 0 ? formatClaimMoney(claim.amountPaid) : "—"}
                className={cn(inputClass, "bg-slate-50 text-slate-700")}
              />
            </Field>
          ) : null}
        </div>
        {form.amountClaimed ? (
          <p className="mt-2 text-xs text-slate-600">
            Claimed {formatClaimMoney(parseMoney(form.amountClaimed))}
            {!isAdd && claim && claim.amountPaid > 0
              ? ` · Paid ${formatClaimMoney(claim.amountPaid)}`
              : ""}
          </p>
        ) : null}
        {!isAdd ? (
          <p className="mt-1 text-xs text-slate-500">
            Amount claimed is set in the Document step. Payout is recorded at closeout.
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Reported date">
          <input
            type="date"
            value={form.reportedDate}
            onChange={(e) => setForm((f) => ({ ...f, reportedDate: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Reported by">
          <input
            type="text"
            value={form.reportedBy}
            onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))}
            className={inputClass}
            placeholder="Customer, skipper, billing…"
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={3}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
        <Button
          type="button"
          onClick={onSave}
          disabled={!form.title.trim() || !form.jobLink.moveId}
        >
          {isAdd ? "Create claim" : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        {!isAdd && onDelete ? (
          <Button
            type="button"
            variant="secondary"
            className="ml-auto text-red-700 hover:bg-red-50"
            onClick={onDelete}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}
