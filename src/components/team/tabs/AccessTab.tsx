"use client";

import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { accessIsValidForPermission } from "@/lib/team/permissions";
import { formatPermission, memberDisplayName } from "@/lib/team/format";
import type { TeamMemberRecord } from "@/lib/team/types";
import { useMemo } from "react";

function accessMatchesPermission(m: TeamMemberRecord): boolean {
  return accessIsValidForPermission(m);
}

export function AccessTab() {
  const { members } = useTeamMembers();
  const active = members.filter((m) => m.status === "active");

  const softwareCount = active.filter((m) => m.hasSoftwareAccess).length;
  const crewCount = active.filter((m) => m.hasCrewAppAccess).length;
  const bothCount = active.filter((m) => m.hasSoftwareAccess && m.hasCrewAppAccess).length;
  const neitherCount = active.filter((m) => !m.hasSoftwareAccess && !m.hasCrewAppAccess).length;

  const columns: Column<TeamMemberRecord>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{memberDisplayName(row)}</p>
          <p className="text-xs text-slate-500">{formatPermission(row.permissionLevel)}</p>
        </div>
      ),
    },
    {
      key: "software",
      header: "JM Software",
      cell: (row) => (
        <Badge variant={row.hasSoftwareAccess ? "success" : "default"}>
          {row.hasSoftwareAccess ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "crew",
      header: "Crew app",
      cell: (row) => (
        <Badge variant={row.hasCrewAppAccess ? "success" : "default"}>
          {row.hasCrewAppAccess ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "email",
      header: "Login email",
      cell: (row) => row.email,
    },
  ];

  const needsReview = useMemo(
    () =>
      active.filter(
        (m) =>
          !accessMatchesPermission(m) ||
          (m.hasCrewAppAccess &&
            !m.jobTitles.some((t) => ["Skipper", "Driver", "Mover"].includes(t))),
      ),
    [active],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-2xl font-semibold text-slate-900">{softwareCount}</p>
            <p className="text-sm text-slate-500">JM software access</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-2xl font-semibold text-slate-900">{crewCount}</p>
            <p className="text-sm text-slate-500">Crew app access</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-2xl font-semibold text-slate-900">{bothCount}</p>
            <p className="text-sm text-slate-500">Both apps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-2xl font-semibold text-slate-900">{neitherCount}</p>
            <p className="text-sm text-slate-500">No app access</p>
          </CardContent>
        </Card>
      </div>

      {needsReview.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-amber-900">Needs review ({needsReview.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-amber-900/80">
              {needsReview.map((m) => (
                <li key={m.id}>
                  {memberDisplayName(m)} — access flags do not match permission level or job titles
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Access by person</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={active} emptyMessage="No active team members." />
        </CardContent>
      </Card>
    </div>
  );
}
