"use client";

import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { MemberForm } from "@/components/team/MemberForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  APP_ACCESS_META,
  appsForPermissionLevel,
  memberModuleCustomizations,
} from "@/lib/team/access-profiles";
import { formatPay, formatPermission, memberDisplayName } from "@/lib/team/format";
import { createEmptyMember, type TeamMemberRecord } from "@/lib/team/types";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type PanelMode = { type: "closed" } | { type: "add" } | { type: "edit"; id: string };

type PendingDelete = {
  id: string;
  name: string;
};

function JobTitleBadges({ titles }: { titles: TeamMemberRecord["jobTitles"] }) {
  if (titles.length === 0) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {titles.map((t) => (
        <Badge key={t} variant="brand">
          {t}
        </Badge>
      ))}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DirectoryTab() {
  const { members, addMember, updateMember, removeMember } = useTeamMembers();
  const [panel, setPanel] = useState<PanelMode>({ type: "closed" });
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const filtered = useMemo(
    () => members.filter((m) => m.status === statusFilter),
    [members, statusFilter],
  );

  const editing = panel.type === "edit" ? members.find((m) => m.id === panel.id) : undefined;
  const sidebarOpen = panel.type !== "closed";

  function requestDelete(member: TeamMemberRecord) {
    setPendingDelete({ id: member.id, name: memberDisplayName(member) });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    removeMember(pendingDelete.id);
    if (panel.type === "edit" && panel.id === pendingDelete.id) {
      setPanel({ type: "closed" });
    }
    setPendingDelete(null);
  }

  const columns: Column<TeamMemberRecord>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{memberDisplayName(row)}</p>
          {row.nickname.trim() ? (
            <p className="text-xs text-slate-500">Goes by {row.nickname.trim()}</p>
          ) : null}
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "titles",
      header: "Field roles",
      cell: (row) => <JobTitleBadges titles={row.jobTitles} />,
    },
    {
      key: "access",
      header: "Access",
      cell: (row) => {
        const apps = appsForPermissionLevel(row.permissionLevel);
        const customizations = memberModuleCustomizations(
          row.permissionLevel,
          row.capabilityOverrides,
        );
        return (
          <div>
            <p className="text-sm font-medium text-slate-800">
              {formatPermission(row.permissionLevel)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {apps.map((a) => APP_ACCESS_META[a].short).join(" · ")}
            </p>
            {customizations.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {customizations.map((label) => (
                  <Badge key={label} variant="default" className="text-[10px]">
                    {label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "pay",
      header: "Pay",
      cell: (row) => formatPay(row),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.status === "active" ? "success" : "default"}>
          {row.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            label={`Edit ${memberDisplayName(row)}`}
            onClick={() => setPanel({ type: "edit", id: row.id })}
          >
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton
            label={`Delete ${memberDisplayName(row)}`}
            onClick={() => requestDelete(row)}
            className="hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["active", "inactive"] as const).map((f) => (
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
                {f}
              </button>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setPanel({ type: "add" })}
          >
            <Plus className="h-4 w-4" />
            Add team member
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Team directory ({filtered.length} {statusFilter})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <DataTable
              columns={columns}
              data={filtered}
              emptyMessage={`No ${statusFilter} team members.`}
            />
          </CardContent>
        </Card>
      </div>

      <DetailSidebar
        open={sidebarOpen}
        onClose={() => setPanel({ type: "closed" })}
        title={panel.type === "add" ? "Add team member" : `Edit — ${editing ? memberDisplayName(editing) : ""}`}
        description={
          panel.type === "add"
            ? "Profile, field roles, and access level. Rippling # required for payroll."
            : "Profile, field roles, access level, and pay."
        }
        widthClassName="max-w-lg"
      >
        {sidebarOpen ? (
          panel.type === "edit" && editing ? (
            <MemberForm
              key={panel.id}
              initial={(() => {
                const { id: _id, ...data } = editing;
                return data;
              })()}
              submitLabel="Save changes"
              onCancel={() => setPanel({ type: "closed" })}
              onDelete={() => requestDelete(editing)}
              onSubmit={(data) => {
                updateMember(panel.id, data);
                setPanel({ type: "closed" });
              }}
            />
          ) : (
            <MemberForm
              key="add"
              initial={createEmptyMember()}
              submitLabel="Add member"
              onCancel={() => setPanel({ type: "closed" })}
              onSubmit={(data) => {
                addMember(data);
                setPanel({ type: "closed" });
              }}
            />
          )
        ) : null}
      </DetailSidebar>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete team member?"
        description={
          pendingDelete
            ? `Are you sure you want to remove ${pendingDelete.name} from the team? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
