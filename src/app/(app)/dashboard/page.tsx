"use client";

import { AccessDenied } from "@/components/auth/AccessDenied";
import { DashboardViewPanel } from "@/components/dashboard/DashboardViewPanel";
import { useCapabilities } from "@/lib/auth/use-capabilities";
import { TabBar } from "@/components/shared/TabBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { dashboardViews } from "@/lib/dashboard/views";
import type { DashboardView } from "@/lib/dashboard/types";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can, defaultDashboardView, allowedDashboardViews: allowedViews } = useCapabilities();
  const meta = pageMeta["/dashboard"];

  const tabs = useMemo(
    () =>
      allowedViews.map((id) => ({
        id,
        label: dashboardViews[id].label,
      })),
    [allowedViews],
  );

  const rawView = searchParams.get("view");
  const normalizedView: DashboardView | null =
    rawView === "ceo"
      ? "executive"
      : allowedViews.includes(rawView as DashboardView)
        ? (rawView as DashboardView)
        : null;

  const activeView = normalizedView ?? defaultDashboardView;

  useEffect(() => {
    if (!can("nav.dashboard")) return;
    if (normalizedView && normalizedView === activeView) return;
    if (rawView === activeView) return;
    router.replace(`/dashboard?view=${activeView}`, { scroll: false });
  }, [activeView, can, normalizedView, rawView, router]);

  if (!can("nav.dashboard")) {
    return (
      <AccessDenied
        title="Dashboard not available"
        description="Your role doesn't include the dashboard home screen."
      />
    );
  }

  if (tabs.length === 0) {
    return (
      <AccessDenied
        title="No dashboard views assigned"
        description="Ask an admin to grant a dashboard view for your role."
      />
    );
  }

  const viewMeta = dashboardViews[activeView];

  function setView(view: DashboardView) {
    router.push(`/dashboard?view=${view}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <PageHeader title={meta.title} />

      {tabs.length > 1 ? (
        <TabBar tabs={tabs} activeTab={activeView} onChange={setView} />
      ) : null}

      <DashboardViewPanel view={viewMeta} />
    </div>
  );
}
