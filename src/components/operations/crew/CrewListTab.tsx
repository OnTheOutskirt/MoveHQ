"use client";

import { CrewRoleBadges } from "@/components/dispatch/CrewRoleBadges";
import { CrewRolePicker } from "@/components/operations/shared/CrewRolePicker";
import { useFleet } from "@/components/providers/FleetProvider";
import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatCrewRolesList, type FleetCrewMember } from "@/lib/operations/fleet";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type PanelMode =
  | { type: "closed" }
  | { type: "edit"; id: string }
  | { type: "add" };

export function CrewListTab() {
  const { crew, updateCrewMember, addCrewMember } = useFleet();
  const { terminology } = useTerminology();
  const [panel, setPanel] = useState<PanelMode>({ type: "closed" });

  const editing = panel.type === "edit" ? crew.find((c) => c.id === panel.id) : undefined;

  const columns = useMemo<Column<FleetCrewMember>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (row) => <p className="font-medium text-slate-900">{row.name}</p>,
      },
      {
        key: "roles",
        header: "Roles",
        cell: (row) => (
          <div className="flex flex-wrap items-center gap-2">
            <CrewRoleBadges roles={row.roles} />
            <span className="text-xs text-slate-500">
              {formatCrewRolesList(row.roles, terminology)}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <span
            className={cn(
              "text-xs font-medium",
              row.active ? "text-emerald-700" : "text-slate-400",
            )}
          >
            {row.active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPanel({ type: "edit", id: row.id });
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [terminology],
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" size="sm" variant="secondary" onClick={() => setPanel({ type: "add" })}>
          <Plus className="h-4 w-4" />
          Add crew
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={crew}
        getRowKey={(row) => row.id}
        onRowClick={(row) => setPanel({ type: "edit", id: row.id })}
        emptyMessage="No crew on the roster."
      />

      <DetailSidebar
        open={panel.type !== "closed"}
        onClose={() => setPanel({ type: "closed" })}
        title={panel.type === "add" ? "Add crew member" : editing?.name ?? "Crew"}
        widthClassName="max-w-md"
      >
        {panel.type === "add" ? (
          <AddCrewForm
            onCancel={() => setPanel({ type: "closed" })}
            onSave={(data) => {
              addCrewMember(data);
              setPanel({ type: "closed" });
            }}
          />
        ) : editing ? (
          <EditCrewForm
            member={editing}
            onCancel={() => setPanel({ type: "closed" })}
            onSave={(patch) => {
              updateCrewMember(editing.id, patch);
              setPanel({ type: "closed" });
            }}
          />
        ) : null}
      </DetailSidebar>
    </>
  );
}

function EditCrewForm({
  member,
  onSave,
  onCancel,
}: {
  member: FleetCrewMember;
  onSave: (patch: Partial<FleetCrewMember>) => void;
  onCancel: () => void;
}) {
  const { getMember } = useTeamMembers();
  const [name, setName] = useState(member.name);
  const [roles, setRoles] = useState(member.roles);
  const [active, setActive] = useState(member.active);
  const tm = member.teamMemberId ? getMember(member.teamMemberId) : undefined;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name: name.trim(), roles, active });
      }}
    >
      {tm ? (
        <Link
          href="/admin/settings?tab=team-members"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Team Members
        </Link>
      ) : (
        <p className="text-xs text-slate-500">Not linked to a team member record.</p>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Display name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Field roles</p>
        <div className="mt-2">
          <CrewRolePicker value={roles} onChange={setRoles} />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          Active on roster
        </label>
        <p className="mt-1 text-xs text-slate-500">Inactive crew are hidden from dispatch.</p>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}

function AddCrewForm({
  onSave,
  onCancel,
}: {
  onSave: (data: { name: string; roles: FleetCrewMember["roles"]; linkTeamMember: boolean }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<FleetCrewMember["roles"]>(["mover"]);
  const [linkTeamMember, setLinkTeamMember] = useState(true);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), roles, linkTeamMember });
      }}
    >
      <p className="text-sm text-slate-600">
        For full HR details (pay, permissions), use{" "}
        <Link href="/admin/settings?tab=team-members" className="font-medium text-brand-600">
          Team Members
        </Link>
        . Quick-add here creates a linked crew record when checked.
      </p>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First Last"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Roles</p>
        <div className="mt-2">
          <CrewRolePicker value={roles} onChange={setRoles} />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-800">
        <input
          type="checkbox"
          checked={linkTeamMember}
          onChange={(e) => setLinkTeamMember(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600"
        />
        <span>Also create linked team member (crew app access)</span>
      </label>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add crew</Button>
      </div>
    </form>
  );
}
