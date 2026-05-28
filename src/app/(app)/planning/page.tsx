"use client";

import { MeetingNotesView } from "@/components/planning/MeetingNotesView";
import { OverallPlanView } from "@/components/planning/OverallPlanView";
import { PlanningProgressProvider } from "@/components/planning/PlanningProgressProvider";
import { PlanningScheduleProvider } from "@/components/planning/PlanningScheduleProvider";
import { V1PlanView } from "@/components/planning/V1PlanView";
import { V2PlanView } from "@/components/planning/V2PlanView";
import { ModulePage } from "@/components/shared/ModulePage";
import { MEETING_NOTES_TAB_LABEL } from "@/lib/planning/meeting-notes";
import { pageMeta } from "@/lib/navigation/page-meta";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { id: "overall", label: "Overall Plan" },
  { id: "v1", label: "V1 Roadmap" },
  { id: "v2", label: "V2 Roadmap" },
  { id: "meeting-notes", label: MEETING_NOTES_TAB_LABEL },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabPanel({ tab }: { tab: TabId }) {
  switch (tab) {
    case "overall":
      return <OverallPlanView />;
    case "v1":
      return <V1PlanView />;
    case "v2":
      return <V2PlanView />;
    case "meeting-notes":
      return <MeetingNotesView />;
    default:
      return <OverallPlanView />;
  }
}

export default function PlanningPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "overall";
  const meta = pageMeta["/planning"];

  function setTab(tab: TabId) {
    router.push(`/planning?tab=${tab}`, { scroll: false });
  }

  return (
    <PlanningProgressProvider>
      <PlanningScheduleProvider>
      <div className="space-y-6">
        <ModulePage title={meta.title} description={meta.description} />

        <div className="border-b border-slate-200">
          <nav className="-mb-px flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTab(tab.id)}
                className={cn(
                  "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <TabPanel tab={activeTab} />
      </div>
      </PlanningScheduleProvider>
    </PlanningProgressProvider>
  );
}
