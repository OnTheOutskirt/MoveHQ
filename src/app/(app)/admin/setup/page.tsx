"use client";

import { TerminologyTab } from "@/components/admin/setup/TerminologyTab";
import { ModulePage } from "@/components/shared/ModulePage";
import { TabBar } from "@/components/shared/TabBar";
import { SETUP_INTEGRATIONS_PATH } from "@/lib/navigation/admin-redirects";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const TABS = [
  { id: "pricing", label: "Pricing" },
  { id: "fields", label: "Statuses & fields" },
  { id: "terminology", label: "Terminology" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_COPY: Record<TabId, { title: string; description: string }> = {
  pricing: {
    title: "Pricing",
    description:
      "Hourly rates, flat-rate rules, truck and travel fees, deposits, and discounts.",
  },
  fields: {
    title: "Statuses & fields",
    description:
      "Move statuses, tags, referral sources, move types, lost reasons, and custom fields.",
  },
  terminology: {
    title: "Terminology",
    description:
      "Names for crew roles (lead, driver, mover) used across dispatch, calendar, and roster.",
  },
};

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "pricing";
  const meta = pageMeta["/admin/setup"];
  const section = TAB_COPY[activeTab];

  useEffect(() => {
    if (rawTab === "integrations") {
      router.replace(SETUP_INTEGRATIONS_PATH);
    }
  }, [rawTab, router]);

  function setTab(tab: TabId) {
    router.push(`/admin/setup?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <ModulePage title={meta.title} description={meta.description} />

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setTab} />

      {activeTab === "terminology" ? (
        <TerminologyTab />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12">
          <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">({section.description})</p>
        </div>
      )}
    </div>
  );
}
