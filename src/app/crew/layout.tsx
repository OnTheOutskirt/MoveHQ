import { CrewAppProvider } from "@/components/crew-app/CrewAppProvider";
import { CrewAppChrome } from "@/components/crew-app/CrewAppChrome";
import { ClaimsProvider } from "@/components/providers/ClaimsProvider";
import { CrewRecordsProvider } from "@/components/providers/CrewRecordsProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Jonah's Movers — Crew",
  description: "Crew schedule and field tools",
  manifest: "/crew-app-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JM Crew",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function CrewAppFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 text-sm text-slate-600">
      Loading crew app…
    </div>
  );
}

export default function CrewLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <CrewRecordsProvider>
        <ClaimsProvider>
          <Suspense fallback={<CrewAppFallback />}>
            <CrewAppProvider>
              <CrewAppChrome>{children}</CrewAppChrome>
            </CrewAppProvider>
          </Suspense>
        </ClaimsProvider>
      </CrewRecordsProvider>
    </SettingsProvider>
  );
}
