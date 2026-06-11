"use client";

import { CrewRoleBadges } from "@/components/dispatch/CrewRoleBadges";
import { CrewWorkScheduleDays } from "@/components/operations/crew/CrewScheduleTab";
import { CrewRolePicker } from "@/components/operations/shared/CrewRolePicker";
import { useFleet } from "@/components/providers/FleetProvider";
import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatCrewRolesList, type FleetCrewMember } from "@/lib/operations/fleet";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type PanelMode = { type: "closed" } | { type: "edit"; id: string };

export function CrewListTab() {
  const { crew, updateCrewMember } = useFleet();
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
        key: "schedule",
        header: "Schedule",
        cell: (row) => <CrewWorkScheduleDays crewId={row.id} />,
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
      <p className="text-sm text-slate-600">
        Add headshots and short bios for the customer move-day portal (linked from day-before SMS &
        email). Tap work days under Schedule to set regular availability. Add new crew via{" "}
        <Link href="/admin/staff" className="font-medium text-brand-600 hover:text-brand-700">
          Admin → Staff
        </Link>
        .
      </p>

      <DataTable
        columns={columns}
        data={crew}
        getRowKey={(row) => row.id}
        onRowClick={(row) => setPanel({ type: "edit", id: row.id })}
        emptyMessage="No crew on the roster. Add people in Admin → Staff."
      />

      <DetailSidebar
        open={panel.type !== "closed"}
        onClose={() => setPanel({ type: "closed" })}
        title={editing?.name ?? "Crew"}
        widthClassName="max-w-md"
      >
        {editing ? (
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
  const [bio, setBio] = useState(member.bio ?? "");
  const [headshotDataUrl, setHeadshotDataUrl] = useState(member.headshotDataUrl ?? null);
  const [showOnCustomerPortal, setShowOnCustomerPortal] = useState(
    member.showOnCustomerPortal !== false,
  );
  const tm = member.teamMemberId ? getMember(member.teamMemberId) : undefined;

  function onHeadshotFile(file: File | null) {
    if (!file) {
      setHeadshotDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setHeadshotDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          name: name.trim(),
          roles,
          active,
          bio: bio.trim() || undefined,
          headshotDataUrl,
          showOnCustomerPortal,
        });
      }}
    >
      {tm ? (
        <Link
          href="/admin/staff"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Admin → Staff
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
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Customer portal profile
        </label>
        <div className="mt-2 flex items-start gap-3">
          {headshotDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={headshotDataUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
              {name.charAt(0) || "?"}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onHeadshotFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:font-medium"
            />
            {headshotDataUrl ? (
              <button
                type="button"
                onClick={() => setHeadshotDataUrl(null)}
                className="text-xs text-slate-500 hover:text-red-600"
              >
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Short bio for customers (e.g. years of experience, specialties)"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={showOnCustomerPortal}
            onChange={(e) => setShowOnCustomerPortal(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          Show on customer move-day portal
        </label>
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
