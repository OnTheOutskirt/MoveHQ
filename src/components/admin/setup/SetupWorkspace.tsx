"use client";

import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AutomationsTab } from "@/components/admin/setup/AutomationsTab";
import { CrewAppTab } from "@/components/admin/setup/CrewAppTab";
import { PipelineTab } from "@/components/admin/setup/PipelineTab";
import { SetupPlaceholder } from "@/components/admin/setup/SetupPlaceholder";
import { TemplatesTab } from "@/components/admin/setup/TemplatesTab";
import { SettingsDraftProvider, useSettingsDraft } from "@/components/providers/SettingsDraftProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { ModulePage } from "@/components/shared/ModulePage";
import { TabBar } from "@/components/shared/TabBar";
import { SETUP_INTEGRATIONS_PATH, setupTabRedirect } from "@/lib/navigation/admin-redirects";
import { pageMeta } from "@/lib/navigation/page-meta";
import { defaultDocumentTemplates } from "@/lib/settings/defaults";
import { loadDocumentTemplates, saveDocumentTemplates } from "@/lib/settings/storage";
import type { DocumentTemplate } from "@/lib/settings/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const TABS = [
  { id: "pricing", label: "Pricing" },
  { id: "pipeline", label: "Pipeline & fields" },
  { id: "documents", label: "Documents" },
  { id: "automations", label: "Automations" },
  { id: "crew-app", label: "Crew app" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PRICING_COPY = {
  title: "Pricing",
  description:
    "Hourly rates, flat-rate rules, truck and travel fees, deposits, and discounts.",
};

function templatesSnapshot(t: DocumentTemplate[]): string {
  return JSON.stringify(t);
}

function SetupWorkspaceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady } = useSettings();
  const draftCtx = useSettingsDraft();
  const meta = pageMeta["/admin/setup"];

  const rawTab = searchParams.get("tab");
  const resolvedTab = rawTab ? (setupTabRedirect[rawTab] ?? rawTab) : "pricing";
  const activeTab: TabId = TABS.some((t) => t.id === resolvedTab) ? (resolvedTab as TabId) : "pricing";

  const [templates, setTemplates] = useState<DocumentTemplate[]>(defaultDocumentTemplates);
  const [savedTemplatesSnapshot, setSavedTemplatesSnapshot] = useState("");

  useEffect(() => {
    if (!isReady) return;
    const loaded = loadDocumentTemplates();
    setTemplates(loaded);
    setSavedTemplatesSnapshot(templatesSnapshot(loaded));
  }, [isReady]);

  useEffect(() => {
    if (rawTab === "integrations") {
      router.replace(SETUP_INTEGRATIONS_PATH);
      return;
    }
    if (rawTab && rawTab !== resolvedTab) {
      router.replace(`/admin/setup?tab=${resolvedTab}`, { scroll: false });
    }
  }, [rawTab, resolvedTab, router]);

  const templatesDirty = useMemo(
    () => templatesSnapshot(templates) !== savedTemplatesSnapshot,
    [templates, savedTemplatesSnapshot],
  );

  const dirty = draftCtx.dirty || templatesDirty;

  function setTab(tab: TabId) {
    router.push(`/admin/setup?tab=${tab}`, { scroll: false });
  }

  function saveAll() {
    draftCtx.save();
    if (templatesDirty) {
      saveDocumentTemplates(templates);
      setSavedTemplatesSnapshot(templatesSnapshot(templates));
    }
  }

  function discardAll() {
    draftCtx.discard();
    const loaded = loadDocumentTemplates();
    setTemplates(loaded);
    setSavedTemplatesSnapshot(templatesSnapshot(loaded));
  }

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading setup…</p>;
  }

  return (
    <div className="space-y-6 pb-20">
      <ModulePage title={meta.title} description={meta.description} />

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setTab} />

      {activeTab === "pricing" && (
        <SetupPlaceholder title={PRICING_COPY.title} description={PRICING_COPY.description} />
      )}
      {activeTab === "pipeline" && <PipelineTab />}
      {activeTab === "documents" && <TemplatesTab templates={templates} onChange={setTemplates} />}
      {activeTab === "automations" && <AutomationsTab />}
      {activeTab === "crew-app" && <CrewAppTab />}

      <AdminSaveBar dirty={dirty} onSave={saveAll} onDiscard={discardAll} />
    </div>
  );
}

export function SetupWorkspace() {
  return (
    <SettingsDraftProvider>
      <SetupWorkspaceInner />
    </SettingsDraftProvider>
  );
}
