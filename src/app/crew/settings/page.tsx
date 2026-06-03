"use client";

import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewSettingsScreen } from "@/components/crew-app/screens/CrewSettingsScreen";

export default function CrewSettingsPage() {
  return (
    <CrewAppShell title="Settings">
      <CrewSettingsScreen />
    </CrewAppShell>
  );
}
