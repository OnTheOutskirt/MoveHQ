"use client";

import { cn } from "@/lib/utils";
import { isOfficeSignedIn } from "@/lib/session/office-auth";
import { ROUTES } from "@/lib/navigation/routes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RouteCapabilityGuard } from "@/components/auth/RouteCapabilityGuard";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isOfficeSignedIn()) {
      router.replace(ROUTES.signIn);
    }
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 transition-opacity lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <RouteCapabilityGuard>{children}</RouteCapabilityGuard>
        </main>
      </div>
    </div>
  );
}
