"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { permissionLevelMeta } from "@/lib/team/permissions";
import { PERMISSION_LEVELS } from "@/lib/team/types";
import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { memberDisplayName } from "@/lib/team/format";

export function PermissionsTab() {
  const { members } = useTeamMembers();
  const active = members.filter((m) => m.status === "active");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {PERMISSION_LEVELS.map((level) => {
          const meta = permissionLevelMeta[level];
          const count = active.filter((m) => m.permissionLevel === level).length;
          const names = active
            .filter((m) => m.permissionLevel === level)
            .map((m) => memberDisplayName(m));

          return (
            <Card key={level}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{meta.label}</CardTitle>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {count} active
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">{meta.description}</p>
                {names.length > 0 ? (
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Assigned: </span>
                    {names.join(", ")}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">No active members at this level.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
