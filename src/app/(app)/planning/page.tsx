"use client";

import { PlanningProgressProvider } from "@/components/planning/PlanningProgressProvider";
import { PlanningScheduleProvider } from "@/components/planning/PlanningScheduleProvider";
import { useTesterFeedback } from "@/components/providers/TesterFeedbackProvider";
import { ModulePage } from "@/components/shared/ModulePage";
import { PLANNING_TODO_TAB_LABEL } from "@/lib/planning/meeting-notes";
import { openTesterFeedbackCount } from "@/lib/planning/tester-feedback";
import { SAAS_PLAN_TAB_LABEL } from "@/lib/planning/saas-plan";
import { lazyNamedWorkspace } from "@/lib/navigation/lazy-route";
import { pageMeta } from "@/lib/navigation/page-meta";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const V1PlanView = lazyNamedWorkspace(
  () => import("@/components/planning/V1PlanView"),
  (module) => module.V1PlanView,
);
const V2PlanView = lazyNamedWorkspace(
  () => import("@/components/planning/V2PlanView"),
  (module) => module.V2PlanView,
);
const MeetingNotesView = lazyNamedWorkspace(
  () => import("@/components/planning/MeetingNotesView"),
  (module) => module.MeetingNotesView,
);
const SaasPlanView = lazyNamedWorkspace(
  () => import("@/components/planning/SaasPlanView"),
  (module) => module.SaasPlanView,
);
const TesterFeedbackView = lazyNamedWorkspace(
  () => import("@/components/planning/TesterFeedbackView"),
  (module) => module.TesterFeedbackView,
);

const TABS = [
  { id: "v1", label: "V1 Roadmap" },
  { id: "v2", label: "V2 Roadmap" },
  { id: "todo", label: PLANNING_TODO_TAB_LABEL },
  { id: "feedback", label: "Tester feedback" },
  { id: "saas", label: SAAS_PLAN_TAB_LABEL },
  { id: "database", label: "Database Design" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function DatabaseDesignView() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
      <p className="text-sm font-medium text-slate-600">Database design coming soon.</p>
      <p className="mt-1 text-sm text-slate-400">Nothing here yet.</p>
    </div>
  );
}

function TabPanel({ tab }: { tab: TabId }) {
  switch (tab) {
    case "v1":
      return <V1PlanView />;
    case "v2":
      return <V2PlanView />;
    case "todo":
      return <MeetingNotesView />;
    case "feedback":
      return <TesterFeedbackView />;
    case "saas":
      return <SaasPlanView />;
    case "database":
      return <DatabaseDesignView />;
    default:
      return <V1PlanView />;
  }
}

export default function PlanningPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: feedbackItems } = useTesterFeedback();
  const feedbackOpenCount = openTesterFeedbackCount(feedbackItems);
  const rawTab = searchParams.get("tab");
  const normalizedTab = rawTab === "meeting-notes" ? "todo" : rawTab;
  const activeTab: TabId = TABS.some((t) => t.id === normalizedTab)
    ? (normalizedTab as TabId)
    : "v1";
  const meta = pageMeta["/planning"];

  function setTab(tab: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab !== "todo") {
      params.delete("meeting");
    }
    router.push(`/planning?${params.toString()}`, { scroll: false });
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
                {tab.id === "feedback" && feedbackOpenCount > 0 ? (
                  <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-amber-900">
                    {feedbackOpenCount}
                  </span>
                ) : null}
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
