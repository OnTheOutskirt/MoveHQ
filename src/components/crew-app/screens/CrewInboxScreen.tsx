"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { formatMoveDate } from "@/lib/moves/format";
import { cn } from "@/lib/utils";
import { Bell, CalendarDays, CheckCheck, Smartphone } from "lucide-react";
import Link from "next/link";

export function CrewInboxScreen() {
  const { inbox, refreshInbox, crewPath } = useCrewApp();

  const sorted = [...inbox.notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          Schedule updates, time-off decisions, and messages from dispatch.
        </p>
        {inbox.unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => refreshInbox({ markAllRead: true })}
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-700"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-800">No notifications</p>
          <p className="mt-1 text-xs text-slate-500">You're all caught up.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  if (!n.read) refreshInbox({ markReadId: n.id });
                }}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition",
                  n.read
                    ? "border-slate-200/80 bg-white"
                    : "border-brand-200 bg-brand-50/40 shadow-sm",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      n.category === "time_off" && "bg-amber-100 text-amber-800",
                      n.category === "schedule" && "bg-brand-100 text-brand-800",
                      n.category === "general" && "bg-slate-100 text-slate-600",
                    )}
                  >
                    {n.category === "schedule" ? (
                      <CalendarDays className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                      {!n.read ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden />
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{n.body}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {formatNotificationTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={crewPath("/crew/settings")}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
      >
        <Smartphone className="h-4 w-4 text-slate-400" />
        Install app &amp; account info
      </Link>
    </div>
  );
}

function formatNotificationTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return formatMoveDate(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
  );
}
