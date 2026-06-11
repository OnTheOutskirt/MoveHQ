"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_DESCRIPTIONS,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_ROLE_DEFAULTS,
} from "@/lib/notifications/notification-types";
import type { WorkspaceRole } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

const ROLES: WorkspaceRole[] = [
  "owner",
  "manager",
  "sales",
  "operations",
  "crew",
];

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  sales: "Sales",
  operations: "Operations",
  crew: "Crew",
};

export function NotificationsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            MoveHQ supports four delivery channels. In-app alerts are live in the office bell menu.
            Email uses Outlook per user; SMS and push follow Twilio and mobile app go-live. Each
            person fine-tunes their matrix under{" "}
            <span className="font-medium text-slate-800">Account → Notifications</span>.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ChannelCard
              icon={Bell}
              label={NOTIFICATION_CHANNEL_LABELS.in_app}
              status="Live"
              detail="Header bell — role-scoped alerts"
            />
            <ChannelCard
              icon={Mail}
              label={NOTIFICATION_CHANNEL_LABELS.email}
              status="Per user"
              detail="Outlook mail sync when connected"
            />
            <ChannelCard
              icon={MessageSquare}
              label={NOTIFICATION_CHANNEL_LABELS.sms}
              status="Queued"
              detail="Twilio — customer & staff SMS"
            />
            <ChannelCard
              icon={Smartphone}
              label={NOTIFICATION_CHANNEL_LABELS.push}
              status="Queued"
              detail="Crew app & future mobile"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Defaults by role</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-600">
            New users start with these in-app categories enabled. Admins can still override per
            person in account settings.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-[40rem] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Alert type
                  </th>
                  {ROLES.map((role) => (
                    <th
                      key={role}
                      className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {ROLE_LABELS[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {NOTIFICATION_CATEGORIES.map((category) => (
                  <tr key={category} className="bg-white">
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-slate-900">
                        {NOTIFICATION_CATEGORY_LABELS[category]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {NOTIFICATION_CATEGORY_DESCRIPTIONS[category]}
                      </p>
                    </td>
                    {ROLES.map((role) => {
                      const on = NOTIFICATION_ROLE_DEFAULTS[role][category] ?? false;
                      return (
                        <td key={role} className="px-2 py-2.5 text-center">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                              on
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-400",
                            )}
                          >
                            {on ? "✓" : "—"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChannelCard({
  icon: Icon,
  label,
  status,
  detail,
}: {
  icon: typeof Bell;
  label: string;
  status: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-600" />
        <span className="text-sm font-semibold text-slate-900">{label}</span>
      </div>
      <p className="mt-1 text-xs font-medium text-brand-700">{status}</p>
      <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
