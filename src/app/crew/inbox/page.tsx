"use client";

import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewInboxScreen } from "@/components/crew-app/screens/CrewInboxScreen";

export default function CrewInboxPage() {
  return (
    <CrewAppShell title="Inbox" subtitle="Notifications from dispatch">
      <CrewInboxScreen />
    </CrewAppShell>
  );
}
