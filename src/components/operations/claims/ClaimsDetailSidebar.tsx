"use client";

import { useClaims } from "@/components/providers/ClaimsProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  CLAIM_CATEGORY_LABELS,
  CLAIM_PENDING_LABELS,
  CLAIM_STATUS_LABELS,
  formatClaimMoney,
} from "@/lib/operations/claims";
import {
  CLAIM_CATEGORIES,
  CLAIM_PENDING_REASONS,
  CLAIM_STATUSES,
  type ClaimCategory,
  type ClaimPendingReason,
  type ClaimStatus,
  type MoveClaim,
  type NewMoveClaim,
} from "@/lib/operations/claims-types";
import { formatMoveDate } from "@/lib/moves/format";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveRecord } from "@/lib/moves/types";
import { salesMovePath } from "@/lib/navigation/routes";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PanelMode =
  | { type: "closed" }
  | { type: "view"; claimId: string }
  | { type: "add"; moveId?: string };

type ClaimsDetailSidebarProps = {
  mode: PanelMode;
  moves: MoveRecord[];
  onClose: () => void;
};

type FormState = {
  moveId: string;
  jobDayId: string;
  status: ClaimStatus;
  category: ClaimCategory;
  title: string;
  description: string;
  reportedDate: string;
  pendingReason: ClaimPendingReason | "";
  amountClaimed: string;
  amountReserved: string;
  amountPaid: string;
  assignedTo: string;
  reportedBy: string;
  notes: string;
};

function emptyForm(moveId = "", moves: MoveRecord[]): FormState {
  const move = moves.find((m) => m.id === moveId);
  return {
    moveId,
    jobDayId: "",
    status: "new",
    category: "damage",
    title: "",
    description: "",
    reportedDate: new Date().toISOString().slice(0, 10),
    pendingReason: "",
    amountClaimed: "",
    amountReserved: "",
    amountPaid: "",
    assignedTo: move?.coordinator ?? move?.assignedRep ?? "",
    reportedBy: "",
    notes: "",
  };
}

function formFromClaim(claim: MoveClaim): FormState {
  return {
    moveId: claim.moveId,
    jobDayId: claim.jobDayId ?? "",
    status: claim.status,
    category: claim.category,
    title: claim.title,
    description: claim.description ?? "",
    reportedDate: claim.reportedDate,
    pendingReason: claim.pendingReason ?? "",
    amountClaimed: String(claim.amountClaimed || ""),
    amountReserved: String(claim.amountReserved || ""),
    amountPaid: String(claim.amountPaid || ""),
    assignedTo: claim.assignedTo,
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
  const { claims, addClaim, updateClaim, removeClaim, getClaimById } = useClaims();
  const claim = mode.type === "view" ? getClaimById(mode.claimId) : undefined;
  const open = mode.type !== "closed";
  const isAdd = mode.type === "add";

  const [form, setForm] = useState<FormState>(() =>
    isAdd
      ? emptyForm(mode.type === "add" ? (mode.moveId ?? "") : "", moves)
      : emptyForm("", moves),
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (mode.type === "view" && claim) setForm(formFromClaim(claim));
    if (mode.type === "add") setForm(emptyForm(mode.moveId ?? "", moves));
  }, [mode, claim, moves]);

  const selectedMove = useMemo(
    () => moves.find((m) => m.id === form.moveId),
    [moves, form.moveId],
  );

  const jobDayOptions = selectedMove?.jobDays ?? [];

  function buildPayload(): NewMoveClaim | null {
    if (!form.moveId || !form.title.trim() || !selectedMove) return null;
    const day = jobDayOptions.find((d) => d.id === form.jobDayId);
    return {
      moveId: form.moveId,
      customerName: selectedMove.customerName,
      moveReference: selectedMove.reference,
      jobDayId: day?.id,
      jobDayLabel: day?.label,
      status: form.status,
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      reportedDate: form.reportedDate,
      pendingReason:
        form.status === "pending" && form.pendingReason
          ? form.pendingReason
          : undefined,
      amountClaimed: parseMoney(form.amountClaimed),
      amountReserved: parseMoney(form.amountReserved),
      amountPaid: parseMoney(form.amountPaid),
      assignedTo: form.assignedTo.trim() || "Unassigned",
      reportedBy: form.reportedBy.trim() || undefined,
      notes: form.notes.trim() || undefined,
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
    if (claim) {
      updateClaim(claim.id, payload);
      onClose();
    }
  }

  return (
    <>
      <DetailSidebar
        open={open}
        onClose={onClose}
        title={isAdd ? "New claim" : claim?.reference ?? "Claim"}
        description={
          isAdd
            ? "Link to a move and track amounts through resolution."
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

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Move">
                <select
                  value={form.moveId}
                  onChange={(e) => {
                    const move = moves.find((m) => m.id === e.target.value);
                    setForm((f) => ({
                      ...f,
                      moveId: e.target.value,
                      jobDayId: "",
                      assignedTo: move?.coordinator ?? move?.assignedRep ?? f.assignedTo,
                    }));
                  }}
                  className={inputClass}
                  disabled={!isAdd}
                >
                  <option value="">Select move…</option>
                  {moves
                    .filter((m) => !isMoveLost(m))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.reference} · {m.customerName}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Job day (optional)">
                <select
                  value={form.jobDayId}
                  onChange={(e) => setForm((f) => ({ ...f, jobDayId: e.target.value }))}
                  className={inputClass}
                  disabled={!selectedMove}
                >
                  <option value="">Move-wide</option>
                  {jobDayOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label} · {formatMoveDate(d.date)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Title">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputClass}
                placeholder="Short summary"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as ClaimStatus,
                    }))
                  }
                  className={inputClass}
                >
                  {CLAIM_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {CLAIM_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
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
                >
                  {CLAIM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CLAIM_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {form.status === "pending" ? (
              <Field label="Pending reason">
                <select
                  value={form.pendingReason}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pendingReason: e.target.value as ClaimPendingReason,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {CLAIM_PENDING_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {CLAIM_PENDING_LABELS[r]}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className={inputClass}
              />
            </Field>

            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Amounts
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                <Field label="Claimed">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.amountClaimed}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amountClaimed: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Reserved / approved">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.amountReserved}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amountReserved: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Paid out">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.amountPaid}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amountPaid: e.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              {form.amountClaimed ? (
                <p className="mt-2 text-xs text-slate-600">
                  Claimed {formatClaimMoney(parseMoney(form.amountClaimed))}
                  {form.amountReserved
                    ? ` · Reserved ${formatClaimMoney(parseMoney(form.amountReserved))}`
                    : ""}
                  {form.amountPaid
                    ? ` · Paid ${formatClaimMoney(parseMoney(form.amountPaid))}`
                    : ""}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Reported date">
                <input
                  type="date"
                  value={form.reportedDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reportedDate: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Assigned to">
                <input
                  type="text"
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, assignedTo: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Reported by">
              <input
                type="text"
                value={form.reportedBy}
                onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))}
                className={inputClass}
                placeholder="Customer, skipper, billing…"
              />
            </Field>

            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className={inputClass}
              />
            </Field>

            <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              <Button type="button" onClick={handleSave} disabled={!form.title.trim() || !form.moveId}>
                {isAdd ? "Create claim" : "Save"}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              {!isAdd && claim ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="ml-auto text-red-700 hover:bg-red-50"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
              ) : null}
            </div>
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
