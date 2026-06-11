"use client";

import { EmployeeHrDocsPanel } from "@/components/team/EmployeeHrDocsPanel";
import { useEmployeeHrDocs } from "@/components/providers/EmployeeHrDocsProvider";
import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { EMPLOYEE_HR_DOC_KIND_LABELS } from "@/lib/team/employee-hr-docs-types";
import { formatPermission, memberDisplayName } from "@/lib/team/format";
import type { TeamMemberRecord } from "@/lib/team/types";
import { formatMoveDate } from "@/lib/moves/format";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PanelMode = { type: "closed" } | { type: "view"; memberId: string };

type MemberHrRow = TeamMemberRecord & {
  docCount: number;
  activeCount: number;
  latestDate: string | null;
  latestKind: string | null;
};

export function CrewHrDocsTab() {
  const { members, isReady: membersReady } = useTeamMembers();
  const { docsForMember, isReady: docsReady } = useEmployeeHrDocs();
  const [panel, setPanel] = useState<PanelMode>({ type: "closed" });
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");
  const [personFilter, setPersonFilter] = useState<string>("all");

  useEffect(() => {
    if (personFilter === "all") return;
    const visible = members.filter((m) => statusFilter === "all" || m.status === statusFilter);
    if (!visible.some((m) => m.id === personFilter)) setPersonFilter("all");
  }, [personFilter, statusFilter, members]);

  const rows = useMemo<MemberHrRow[]>(() => {
    return members
      .filter((m) => personFilter === "all" || m.id === personFilter)
      .filter((m) => statusFilter === "all" || m.status === statusFilter)
      .map((member) => {
        const docs = docsForMember(member.id);
        const active = docs.filter((d) => d.status === "active" || d.status === "acknowledged");
        const latest = docs[0];
        return {
          ...member,
          docCount: docs.length,
          activeCount: active.length,
          latestDate: latest?.date ?? null,
          latestKind: latest ? EMPLOYEE_HR_DOC_KIND_LABELS[latest.kind] : null,
        };
      })
      .sort((a, b) => {
        if (b.activeCount !== a.activeCount) return b.activeCount - a.activeCount;
        if (b.docCount !== a.docCount) return b.docCount - a.docCount;
        return memberDisplayName(a).localeCompare(memberDisplayName(b), undefined, {
          sensitivity: "base",
        });
      });
  }, [members, docsForMember, statusFilter, personFilter]);

  const selected = panel.type === "view" ? members.find((m) => m.id === panel.memberId) : undefined;

  const columns = useMemo<Column<MemberHrRow>[]>(
    () => [
      {
        key: "name",
        header: "Employee",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{memberDisplayName(row)}</p>
            <p className="text-xs text-slate-500">{formatPermission(row.permissionLevel)}</p>
          </div>
        ),
      },
      {
        key: "docs",
        header: "Documents",
        cell: (row) =>
          row.docCount === 0 ? (
            <span className="text-slate-400">None on file</span>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-800">
                {row.docCount} on file
                {row.activeCount > 0 ? (
                  <span className="font-normal text-slate-500"> · {row.activeCount} open</span>
                ) : null}
              </p>
              {row.latestKind && row.latestDate ? (
                <p className="text-xs text-slate-500">
                  Latest: {row.latestKind} · {formatMoveDate(row.latestDate)}
                </p>
              ) : null}
            </div>
          ),
      },
      {
        key: "status",
        header: "Employment",
        cell: (row) => (
          <Badge variant={row.status === "active" ? "success" : "default"}>
            {row.status === "active" ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (!membersReady || !docsReady) {
    return <p className="text-sm text-slate-500">Loading write-ups…</p>;
  }

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Write-ups, warnings, and improvement plans for employees. Ops and office use this for
          discipline and follow-up — separate from customer-facing crew track record. Employee
          profiles are managed in{" "}
          <Link href="/admin/staff" className="font-medium text-brand-600 hover:text-brand-700">
            Admin → Staff
          </Link>
          .
        </p>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["active", "inactive", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                  statusFilter === f
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
          <label className="text-xs font-medium text-slate-500">
            Person
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800"
            >
              <option value="all">All employees</option>
              {members
                .filter((m) => statusFilter === "all" || m.status === statusFilter)
                .sort((a, b) =>
                  memberDisplayName(a).localeCompare(memberDisplayName(b), undefined, {
                    sensitivity: "base",
                  }),
                )
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {memberDisplayName(m)}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          getRowKey={(row) => row.id}
          onRowClick={(row) => setPanel({ type: "view", memberId: row.id })}
          emptyMessage="No employees match this filter."
        />
      </div>

      <DetailSidebar
        open={panel.type === "view"}
        onClose={() => setPanel({ type: "closed" })}
        title={selected ? memberDisplayName(selected) : "Employee"}
        description="Write-ups & discipline"
        widthClassName="max-w-lg"
      >
        {selected ? (
          <EmployeeHrDocsPanel memberId={selected.id} memberName={memberDisplayName(selected)} />
        ) : null}
      </DetailSidebar>
    </>
  );
}
