"use client";

import { FutureNotes } from "@/components/shared/FutureNotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function NotificationsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Email and SMS notification preferences will be configured here once Twilio and Outlook
            integrations are connected.
          </p>
        </CardContent>
      </Card>
      <FutureNotes
        title="Planned notification types"
        items={[
          "New lead / website form received",
          "Quote viewed or accepted",
          "Deposit collected",
          "Job day reminder to customer and crew",
          "Balance due before move day",
          "Post-move review request",
        ]}
      />
    </div>
  );
}
