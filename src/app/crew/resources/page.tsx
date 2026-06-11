"use client";

import { CrewAppShell } from "@/components/crew-app/CrewAppShell";
import { CrewResourcesScreen } from "@/components/crew-app/screens/CrewResourcesScreen";

export default function CrewResourcesPage() {
  return (
    <CrewAppShell title="Resources" subtitle="Payroll, benefits & links">
      <CrewResourcesScreen />
    </CrewAppShell>
  );
}
