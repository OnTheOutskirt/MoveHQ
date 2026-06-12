"use client";

import { useEmployeeHrDocs } from "@/components/providers/EmployeeHrDocsProvider";
import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatMoveDate } from "@/lib/moves/format";
import {
  EMPLOYEE_HR_DOC_KIND_LABELS,
  EMPLOYEE_HR_DOC_KINDS,
  EMPLOYEE_HR_DOC_STATUS_LABELS,
  EMPLOYEE_HR_DOC_STATUSES,
  teamMembersForHrDocumentation,
  type EmployeeHrDoc,
  type EmployeeHrDocKind,
  type EmployeeHrDocStatus,
} from "@/lib/team/employee-hr-docs-types";
import { memberDisplayName } from "@/lib/team/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, ClipboardList, FileWarning, Plus, Target } from "lucide-react";
import { useMemo, useState } from "react";

function kindIcon(kind: EmployeeHrDocKind) {
  switch (kind) {
    case "write_up":
      return ClipboardList;
    case "warning":
      return FileWarning;
    case "improvement_plan":
      return Target;
  }
}

function kindBadgeVariant(kind: EmployeeHrDocKind): "default" | "warning" | "danger" | "brand" {
  switch (kind) {
    case "write_up":
      return "default";
    case "warning":
      return "warning";
    case "improvement_plan":
      return "brand";
  }
}

function statusBadgeVariant(status: EmployeeHrDocStatus): "default" | "warning" | "success" {
  switch (status) {
    case "active":
      return "warning";
    case "acknowledged":
      return "default";
    case "closed":
      return "success";
  }
}

type EmployeeHrDocsPanelProps = {
  memberId: string;
  memberName: string;
};

type DocPanel = { type: "closed" } | { type: "add" } | { type: "view"; id: string };

export function EmployeeHrDocsPanel({ memberId, memberName }: EmployeeHrDocsPanelProps) {
  const { docsForMember, addDoc, updateDoc } = useEmployeeHrDocs();
  const docs = docsForMember(memberId);
  const [panel, setPanel] = useState<DocPanel>({ type: "closed" });

  const viewing = panel.type === "view" ? docs.find((d) => d.id === panel.id) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">HR documentation</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            Write-ups, warnings, and improvement plans for {memberName}. Office-visible only —
            separate from crew field track record.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={() => setPanel({ type: "add" })}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-700">No documentation yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Log a write-up, warning, or performance improvement plan when needed.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
          {docs.map((doc) => {
            const Icon = kindIcon(doc.kind);
            return (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => setPanel({ type: "view", id: doc.id })}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{doc.title}</p>
                      <Badge variant={kindBadgeVariant(doc.kind)}>
                        {EMPLOYEE_HR_DOC_KIND_LABELS[doc.kind]}
                      </Badge>
                      <Badge variant={statusBadgeVariant(doc.status)}>
                        {EMPLOYEE_HR_DOC_STATUS_LABELS[doc.status]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {doc.description}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatMoveDate(doc.date)}
                      {doc.documentedBy ? ` · ${doc.documentedBy}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <HrDocFormSidebar
        open={panel.type === "add"}
        title="New HR document"
        onClose={() => setPanel({ type: "closed" })}
        onSubmit={(draft) => {
          addDoc({ ...draft, memberId });
          setPanel({ type: "closed" });
        }}
      />

      <HrDocViewSidebar
        open={panel.type === "view" && Boolean(viewing)}
        doc={viewing}
        onClose={() => setPanel({ type: "closed" })}
        onUpdate={(patch) => {
          if (!viewing) return;
          updateDoc(viewing.id, patch);
        }}
      />
    </div>
  );
}

type HrDocDraft = {
  kind: EmployeeHrDocKind;
  title: string;
  date: string;
  description: string;
  followUpDate?: string;
  status: EmployeeHrDocStatus;
  documentedBy?: string;
};

function HrDocFormSidebar({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  initial?: Partial<HrDocDraft>;
  onClose: () => void;
  onSubmit: (draft: HrDocDraft) => void;
}) {
  const { user } = useSession();
  const { members } = useTeamMembers();
  const managers = useMemo(() => teamMembersForHrDocumentation(members), [members]);
  const defaultManager = useMemo(() => {
    const match = managers.find(
      (member) => member.email.toLowerCase() === user.email.toLowerCase(),
    );
    return match ? memberDisplayName(match) : managers[0] ? memberDisplayName(managers[0]) : "";
  }, [managers, user.email]);

  const [kind, setKind] = useState<EmployeeHrDocKind>(initial?.kind ?? "write_up");
  const [docTitle, setDocTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [followUpDate, setFollowUpDate] = useState(initial?.followUpDate ?? "");
  const [status, setStatus] = useState<EmployeeHrDocStatus>(initial?.status ?? "active");
  const [documentedBy, setDocumentedBy] = useState(initial?.documentedBy ?? defaultManager);

  const canSave =
    docTitle.trim().length > 0 && description.trim().length > 0 && documentedBy.trim().length > 0;

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={title}
      widthClassName="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSubmit({
                kind,
                title: docTitle.trim(),
                date,
                description: description.trim(),
                followUpDate: followUpDate.trim() || undefined,
                status,
                documentedBy: documentedBy.trim() || undefined,
              })
            }
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Type</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as EmployeeHrDocKind)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {EMPLOYEE_HR_DOC_KINDS.map((k) => (
              <option key={k} value={k}>
                {EMPLOYEE_HR_DOC_KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Title</span>
          <input
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Brief summary"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Follow-up</span>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EmployeeHrDocStatus)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {EMPLOYEE_HR_DOC_STATUSES.map((s) => (
              <option key={s} value={s}>
                {EMPLOYEE_HR_DOC_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Manager</span>
          <select
            value={documentedBy}
            onChange={(e) => setDocumentedBy(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Select manager…</option>
            {managers.map((member) => {
              const name = memberDisplayName(member);
              return (
                <option key={member.id} value={name}>
                  {name}
                </option>
              );
            })}
            {initial?.documentedBy &&
            !managers.some((member) => memberDisplayName(member) === initial.documentedBy) ? (
              <option value={initial.documentedBy}>{initial.documentedBy}</option>
            ) : null}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Details</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed"
            placeholder="What happened, expectations, and next steps…"
          />
        </label>
      </div>
    </DetailSidebar>
  );
}

function HrDocViewSidebar({
  open,
  doc,
  onClose,
  onUpdate,
}: {
  open: boolean;
  doc?: EmployeeHrDoc;
  onClose: () => void;
  onUpdate: (patch: Partial<EmployeeHrDoc>) => void;
}) {
  const statusOptions = useMemo(() => EMPLOYEE_HR_DOC_STATUSES, []);

  if (!doc) return null;

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={doc.title}
      description={`${EMPLOYEE_HR_DOC_KIND_LABELS[doc.kind]} · ${formatMoveDate(doc.date)}`}
      headerBelow={
        <Badge variant={statusBadgeVariant(doc.status)}>
          {EMPLOYEE_HR_DOC_STATUS_LABELS[doc.status]}
        </Badge>
      }
      widthClassName="max-w-md"
    >
      <div className="space-y-4 text-sm">
        <p className="leading-relaxed text-slate-700 whitespace-pre-wrap">{doc.description}</p>
        <dl className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
          {doc.documentedBy ? (
            <div>
              <dt className="font-semibold uppercase tracking-wide text-slate-500">Manager</dt>
              <dd className="mt-0.5 text-slate-800">{doc.documentedBy}</dd>
            </div>
          ) : null}
          {doc.followUpDate ? (
            <div>
              <dt className="font-semibold uppercase tracking-wide text-slate-500">Follow-up</dt>
              <dd className="mt-0.5 text-slate-800">{formatMoveDate(doc.followUpDate)}</dd>
            </div>
          ) : null}
          {doc.acknowledgedAt ? (
            <div>
              <dt className="font-semibold uppercase tracking-wide text-slate-500">Acknowledged</dt>
              <dd className="mt-0.5 text-slate-800">{formatMoveDate(doc.acknowledgedAt.slice(0, 10))}</dd>
            </div>
          ) : null}
        </dl>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Update status</span>
          <select
            value={doc.status}
            onChange={(e) => {
              const next = e.target.value as EmployeeHrDocStatus;
              onUpdate({
                status: next,
                acknowledgedAt:
                  next === "acknowledged" && !doc.acknowledgedAt
                    ? new Date().toISOString()
                    : doc.acknowledgedAt,
              });
            }}
            className={cn("mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm")}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {EMPLOYEE_HR_DOC_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </DetailSidebar>
  );
}
