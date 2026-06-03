"use client";

import { FollowUpsTab } from "@/components/admin/setup/FollowUpsTab";
import { FutureNotes } from "@/components/shared/FutureNotes";
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
    <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-3 transition-colors hover:bg-slate-50">
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

export function AutomationsTab() {
  const { value: automations, update } = useSettingsSection("automations");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automations</CardTitle>
          <p className="text-sm text-slate-500">
            Rules that run automatically when leads move through the pipeline or job days approach.
            Saved here apply office-wide once integrations are live.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            label="Notify office on new lead"
            description="SMS or email to the on-call salesperson when a lead or web quote arrives."
            checked={automations.notifyOfficeOnNewLead}
            onChange={(v) => update({ notifyOfficeOnNewLead: v })}
          />
          <ToggleRow
            label="Send quote confirmation SMS"
            description="Customer receives a text when a quote or proposal is sent from MoveHQ."
            checked={automations.sendQuoteConfirmationSms}
            onChange={(v) => update({ sendQuoteConfirmationSms: v })}
          />
          <ToggleRow
            label="Send booking confirmation email"
            description="Email with move date and arrival window after deposit is collected."
            checked={automations.sendBookingConfirmationEmail}
            onChange={(v) => update({ sendBookingConfirmationEmail: v })}
          />
          <ToggleRow
            label="Day-before reminder — customer"
            description="SMS reminder the evening before the job day."
            checked={automations.dayBeforeCustomerReminder}
            onChange={(v) => update({ dayBeforeCustomerReminder: v })}
          />
          <ToggleRow
            label="Day-before reminder — crew"
            description="Push notification to assigned crew in the crew app."
            checked={automations.dayBeforeCrewReminder}
            onChange={(v) => update({ dayBeforeCrewReminder: v })}
          />
          <ToggleRow
            label="Auto follow-up when quote is sent"
            description="Creates a follow-up task on the move using Follow-up rules below."
            checked={automations.autoFollowUpOnQuoteSent}
            onChange={(v) => update({ autoFollowUpOnQuoteSent: v })}
          />
        </CardContent>
      </Card>

      <FutureNotes
        title="Coming with integrations"
        items={[
          "Twilio SMS triggers tied to pipeline stage changes",
          "Outlook email templates for confirmations",
          "Stripe events (deposit paid → booked automations)",
          "Website AI quote → office alert + optional auto-assign",
        ]}
      />

      <FollowUpsTab />
    </div>
  );
}
