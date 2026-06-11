"use client";

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_DESCRIPTIONS,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_CHANNEL_LABELS,
  type NotificationCategory,
  type NotificationChannelPrefs,
  type NotificationPrefs,
} from "@/lib/notifications/notification-types";
import { patchNotificationCategory } from "@/lib/notifications/notification-preferences";
import { cn } from "@/lib/utils";

type NotificationPrefsEditorProps = {
  prefs: NotificationPrefs;
  onChange: (prefs: NotificationPrefs) => void;
  /** Hide categories the user's role doesn't typically receive */
  visibleCategories?: NotificationCategory[];
};

const CHANNEL_KEYS = [
  { key: "inApp" as const, label: NOTIFICATION_CHANNEL_LABELS.in_app },
  { key: "email" as const, label: NOTIFICATION_CHANNEL_LABELS.email },
  { key: "sms" as const, label: NOTIFICATION_CHANNEL_LABELS.sms },
  { key: "push" as const, label: NOTIFICATION_CHANNEL_LABELS.push },
];

export function NotificationPrefsEditor({
  prefs,
  onChange,
  visibleCategories,
}: NotificationPrefsEditorProps) {
  const categories = visibleCategories ?? [...NOTIFICATION_CATEGORIES];

  function patchCategory(
    category: NotificationCategory,
    patch: Partial<NotificationChannelPrefs>,
  ) {
    onChange(patchNotificationCategory(prefs, category, patch));
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-[32rem] w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Alert type
            </th>
            {CHANNEL_KEYS.map(({ label }) => (
              <th
                key={label}
                className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {categories.map((category) => {
            const row = prefs[category];
            return (
              <tr key={category} className="bg-white">
                <td className="px-3 py-3 align-top">
                  <p className="font-medium text-slate-900">
                    {NOTIFICATION_CATEGORY_LABELS[category]}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {NOTIFICATION_CATEGORY_DESCRIPTIONS[category]}
                  </p>
                </td>
                {CHANNEL_KEYS.map(({ key }) => (
                  <td key={key} className="px-2 py-3 text-center align-top">
                    <input
                      type="checkbox"
                      checked={row[key]}
                      onChange={(e) => patchCategory(category, { [key]: e.target.checked })}
                      className={cn(
                        "rounded border-slate-300 text-brand-600",
                        key !== "inApp" && "opacity-90",
                      )}
                      aria-label={`${NOTIFICATION_CATEGORY_LABELS[category]} — ${CHANNEL_KEYS.find((c) => c.key === key)?.label}`}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-slate-100 bg-slate-50/50 px-3 py-2 text-[10px] text-slate-500">
        In-app alerts appear in the bell menu. Email, SMS, and push delivery queue when those
        integrations are connected — toggles are saved per user now.
      </p>
    </div>
  );
}
