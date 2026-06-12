import { PortalClientReady } from "@/components/portal/PortalClientReady";
import { EquipmentCatalogProvider } from "@/components/providers/EquipmentCatalogProvider";
import { RoleTemplatesProvider } from "@/components/providers/RoleTemplatesProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { TeamMembersProvider } from "@/components/providers/TeamMembersProvider";
import { WorkspaceProvider } from "@/components/providers/WorkspaceProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { MovesProvider } from "@/components/moves/MovesProvider";
import type { ReactNode } from "react";
import { Suspense } from "react";

function PortalFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-slate-600">
      Loading preview…
    </div>
  );
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <EquipmentCatalogProvider>
        <SessionProvider>
          <TeamMembersProvider>
            <RoleTemplatesProvider>
              <WorkspaceProvider>
                <MovesProvider>
                  <Suspense fallback={<PortalFallback />}>
                    <PortalClientReady>
                      <div className="min-h-dvh bg-slate-100">{children}</div>
                    </PortalClientReady>
                  </Suspense>
                </MovesProvider>
              </WorkspaceProvider>
            </RoleTemplatesProvider>
          </TeamMembersProvider>
        </SessionProvider>
      </EquipmentCatalogProvider>
    </SettingsProvider>
  );
}
