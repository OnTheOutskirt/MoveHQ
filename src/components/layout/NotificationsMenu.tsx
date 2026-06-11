"use client";

import { useClaims } from "@/components/providers/ClaimsProvider";
import { useInventory } from "@/components/providers/InventoryProvider";
import { useUserPreferences } from "@/components/providers/UserPreferencesProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import {
  buildOfficeNotifications,
  dismissAllNotifications,
  dismissNotification,
  filterUnreadNotifications,
  getDismissedNotificationIds,
  NOTIFICATIONS_FOLLOW_UPS_HREF,
  unreadNotificationCount,
  type OfficeNotification,
} from "@/lib/notifications/office-notifications";
import {
  NOTIFICATION_CHANNEL_LABELS,
  type NotificationChannel,
} from "@/lib/notifications/notification-types";
import { useSession } from "@/components/providers/SessionProvider";
import { getOfficePersona, repFilterForPersona } from "@/lib/session/personas";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  ClipboardList,
  FileText,
  Package,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORY_ICONS = {
  follow_up: CalendarClock,
  document: FileText,
  claim: ClipboardList,
  inventory: Package,
  job_day: Truck,
  new_lead: Sparkles,
} as const;

export function NotificationsMenu() {
  const { user } = useSession();
  const persona = getOfficePersona(user.id);
  const { moves } = useMoves();
  const { claims } = useClaims();
  const { stockLines } = useInventory();
  const { preferences } = useUserPreferences();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDismissed(getDismissedNotificationIds());
  }, [open, moves, claims, stockLines]);

  const allNotifications = useMemo(
    () =>
      buildOfficeNotifications({
        moves,
        claims,
        stockLines,
        assignedRep: repFilterForPersona(persona),
        workspaceRole: persona.workspaceRole,
        preferences,
      }),
    [moves, claims, stockLines, persona, preferences],
  );

  const unread = useMemo(
    () => filterUnreadNotifications(allNotifications, dismissed),
    [allNotifications, dismissed],
  );

  const unreadCount = unreadNotificationCount(allNotifications, dismissed);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleDismiss(id: string) {
    dismissNotification(id);
    setDismissed(getDismissedNotificationIds());
  }

  function handleDismissAll() {
    dismissAllNotifications(unread.map((n) => n.id));
    setDismissed(getDismissedNotificationIds());
  }

  const visible = open ? unread.slice(0, 15) : [];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"
        }
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:w-[26rem]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
              <p className="text-[10px] text-slate-500">
                In-app alerts · email/SMS/push follow your account settings
              </p>
            </div>
            {unread.length > 0 ? (
              <button
                type="button"
                onClick={handleDismissAll}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {visible.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
              <p className="mt-3 text-sm font-medium text-slate-700">You&apos;re all caught up</p>
              <p className="mt-1 text-xs text-slate-500">
                Follow-ups, claims, inventory, and job-day alerts appear here for your role.
              </p>
              <Link
                href="/account?tab=notifications"
                onClick={() => setOpen(false)}
                className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline"
              >
                Notification settings →
              </Link>
            </div>
          ) : (
            <ul className="max-h-[min(28rem,70vh)] overflow-y-auto divide-y divide-slate-100">
              {visible.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onNavigate={() => setOpen(false)}
                  onDismiss={() => handleDismiss(item.id)}
                />
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
            <Link
              href={NOTIFICATIONS_FOLLOW_UPS_HREF}
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Follow-ups queue →
            </Link>
            <Link
              href="/account?tab=notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Settings
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({
  item,
  onNavigate,
  onDismiss,
}: {
  item: OfficeNotification;
  onNavigate: () => void;
  onDismiss: () => void;
}) {
  const Icon = CATEGORY_ICONS[item.category] ?? AlertTriangle;
  const outbound = item.channels.filter((c) => c !== "in_app");

  return (
    <li>
      <Link
        href={item.href}
        onClick={() => {
          onDismiss();
          onNavigate();
        }}
        className="flex gap-3 px-4 py-3 hover:bg-slate-50"
      >
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            item.category === "follow_up" && "bg-amber-100 text-amber-800",
            item.category === "document" && "bg-brand-50 text-brand-700",
            item.category === "claim" && "bg-violet-100 text-violet-800",
            item.category === "inventory" && "bg-orange-100 text-orange-800",
            item.category === "job_day" && "bg-sky-100 text-sky-800",
            item.category === "new_lead" && "bg-emerald-100 text-emerald-800",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-snug text-slate-900">
            {item.title}
          </span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">{item.body}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-medium text-slate-400">{item.timeLabel}</span>
            {outbound.length > 0 ? (
              <ChannelBadges channels={outbound} />
            ) : null}
          </span>
        </span>
      </Link>
    </li>
  );
}

function ChannelBadges({ channels }: { channels: NotificationChannel[] }) {
  return (
    <span className="inline-flex flex-wrap gap-0.5">
      {channels.map((channel) => (
        <span
          key={channel}
          className="rounded bg-slate-100 px-1 py-px text-[9px] font-medium text-slate-600"
        >
          {NOTIFICATION_CHANNEL_LABELS[channel]}
        </span>
      ))}
    </span>
  );
}
