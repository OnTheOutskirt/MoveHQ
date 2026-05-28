"use client";

import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatPay, memberDisplayName } from "@/lib/team/format";
import type { TeamMemberRecord } from "@/lib/team/types";

export function PayRatesTab() {
  const { members } = useTeamMembers();
  const active = members.filter((m) => m.status === "active");
  const hourly = active.filter((m) => m.payType === "hourly" && m.payRate > 0);
  const avgRate =
    hourly.length > 0
      ? hourly.reduce((sum, m) => sum + m.payRate, 0) / hourly.length
      : 0;

  const columns: Column<TeamMemberRecord>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{memberDisplayName(row)}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {row.jobTitles.map((t) => (
              <Badge key={t} variant="brand">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "pay",
      header: "Pay",
      cell: (row) => <span className="font-medium">{formatPay(row)}</span>,
    },
  ];

  const sorted = [...active].sort((a, b) => {
    if (a.payType !== b.payType) return a.payType === "hourly" ? -1 : 1;
    if (a.payType === "salary") return b.salaryAmount - a.salaryAmount;
    return b.payRate - a.payRate;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-2xl font-semibold text-slate-900">{hourly.length}</p>
            <p className="text-sm text-slate-500">Hourly employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-2xl font-semibold text-slate-900">
              {avgRate > 0 ? `$${avgRate.toFixed(2)}` : "—"}
            </p>
            <p className="text-sm text-slate-500">Avg hourly rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-2xl font-semibold text-slate-900">
              {active.filter((m) => m.payType === "salary").length}
            </p>
            <p className="text-sm text-slate-500">Salary / owner</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pay rates & employment</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable columns={columns} data={sorted} emptyMessage="No active team members." />
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">
        Pay rates are stored locally for planning. Payroll integration will sync rates when auth and
        database are connected.
      </p>
    </div>
  );
}
