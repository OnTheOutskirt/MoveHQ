"use client";

import { SettingsField, SettingsInput } from "@/components/settings/SettingsField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSettingsSection } from "@/lib/settings/use-settings-editor";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-3">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
    </label>
  );
}

export function FollowUpsTab() {
  const { value: followUps, update } = useSettingsSection("followUps");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Follow-up timing</CardTitle>
          <p className="text-sm text-slate-500">
            Default delays for auto-created follow-ups and how quickly overdue tasks escalate on the
            Follow-Ups board.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="After quote sent (days)" hint="First sales callback if no response.">
            <SettingsInput
              type="number"
              min={0}
              max={30}
              value={followUps.quotedFollowUpDays}
              onChange={(e) => update({ quotedFollowUpDays: Number(e.target.value) || 0 })}
            />
          </SettingsField>
          <SettingsField label="After booking (days)" hint="Check-in before move day.">
            <SettingsInput
              type="number"
              min={0}
              max={30}
              value={followUps.bookedCheckInDays}
              onChange={(e) => update({ bookedCheckInDays: Number(e.target.value) || 0 })}
            />
          </SettingsField>
          <SettingsField
            label="Waiting lead nudge (days)"
            hint="New or waiting leads with no contact yet."
            className="sm:col-span-2"
          >
            <SettingsInput
              type="number"
              min={0}
              max={14}
              value={followUps.waitingLeadFollowUpDays}
              onChange={(e) => update({ waitingLeadFollowUpDays: Number(e.target.value) || 0 })}
            />
          </SettingsField>
          <SettingsField
            label="Escalate overdue after (hours)"
            hint="Marks follow-ups urgent on the board and topbar count."
            className="sm:col-span-2"
          >
            <SettingsInput
              type="number"
              min={1}
              max={72}
              value={followUps.escalateOverdueAfterHours}
              onChange={(e) => update({ escalateOverdueAfterHours: Number(e.target.value) || 1 })}
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto follow-ups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            label="Quoted — auto schedule follow-up"
            description="When a move enters Quoted, create a follow-up task using the delay above."
            checked={followUps.enableAutoQuotedFollowUp}
            onChange={(v) => update({ enableAutoQuotedFollowUp: v })}
          />
          <ToggleRow
            label="Booked — auto schedule check-in"
            description="Post-booking call or text before the first job day."
            checked={followUps.enableAutoBookedCheckIn}
            onChange={(v) => update({ enableAutoBookedCheckIn: v })}
          />
          <ToggleRow
            label="Waiting — auto nudge salesperson"
            description="Creates a task when a lead sits in New/Waiting too long."
            checked={followUps.enableWaitingLeadNudge}
            onChange={(v) => update({ enableWaitingLeadNudge: v })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
