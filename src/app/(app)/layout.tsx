import { AppShell } from "@/components/layout/AppShell";
import { MovesProvider } from "@/components/moves/MovesProvider";
import { CalendarSettingsProvider } from "@/components/providers/CalendarSettingsProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { FleetProvider } from "@/components/providers/FleetProvider";
import { TeamMembersProvider } from "@/components/providers/TeamMembersProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <TeamMembersProvider>
        <FleetProvider>
          <CalendarSettingsProvider>
            <MovesProvider>
              <AppShell>{children}</AppShell>
            </MovesProvider>
          </CalendarSettingsProvider>
        </FleetProvider>
      </TeamMembersProvider>
    </SettingsProvider>
  );
}
