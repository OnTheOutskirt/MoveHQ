"use client";

import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AutomationsTab } from "@/components/admin/setup/AutomationsTab";
import { CrewAppTab } from "@/components/admin/setup/CrewAppTab";
import { LeadsTab } from "@/components/admin/setup/LeadsTab";
import { MoveTypesTab } from "@/components/admin/setup/MoveTypesTab";
import { PipelineTab } from "@/components/admin/setup/PipelineTab";
import { RatesCatalogTab } from "@/components/admin/setup/RatesCatalogTab";
import { MessageTemplatesTab } from "@/components/admin/setup/MessageTemplatesTab";
import { TemplatesTab } from "@/components/admin/setup/TemplatesTab";
import { TerminologyTab } from "@/components/admin/setup/TerminologyTab";
import { SettingsDraftProvider, useSettingsDraft } from "@/components/providers/SettingsDraftProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { ModulePage } from "@/components/shared/ModulePage";
import { TabBar } from "@/components/shared/TabBar";
import { SETUP_INTEGRATIONS_PATH, setupTabRedirect } from "@/lib/navigation/admin-redirects";
import { pageMeta } from "@/lib/navigation/page-meta";
import { defaultDocumentTemplates } from "@/lib/settings/defaults";
import { loadDocumentTemplates, saveDocumentTemplates } from "@/lib/settings/storage";
import {
  defaultMessageTemplates,
  loadMessageTemplates,
  saveMessageTemplates,
  templatesSnapshot as messageTemplatesSnapshot,
} from "@/lib/communications/message-templates";
import {
  defaultWalkthroughShareTemplates,
  loadWalkthroughShareTemplates,
  saveWalkthroughShareTemplates,
  walkthroughShareTemplatesSnapshot,
  type WalkthroughShareTemplates,
} from "@/lib/communications/walkthrough-share-templates";
import type { EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import {
  catalogSnapshot,
  loadEquipmentCatalog,
  saveEquipmentCatalog,
} from "@/lib/moves/equipment-catalog-storage";
import {
  normalizeFlatRateQuoteSettings,
  normalizeHourlyQuoteSettings,
  type FlatRateQuoteSettings,
  type HourlyQuoteSettings,
} from "@/lib/moves/hourly-quote-settings";
import {
  appendRateScheduleEntry,
  buildSupplyPriceMap,
  loadPricingRateSchedule,
  savePricingRateSchedule,
  scheduleSnapshot,
} from "@/lib/pricing/rate-history-storage";
import { applyCatalogPricesFromEntry, currentRateEntry } from "@/lib/pricing/rate-resolution";
import type { PricingRateSchedule } from "@/lib/pricing/rate-history-types";
import { useEquipmentCatalog } from "@/components/providers/EquipmentCatalogProvider";
import type { DocumentTemplate } from "@/lib/settings/types";
import type { MessageTemplate } from "@/lib/communications/message-templates";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const TABS = [
  { id: "rates", label: "Rates & catalog" },
  { id: "pipeline", label: "Pipeline & fields" },
  { id: "leads", label: "Leads" },
  { id: "move-types", label: "Move types" },
  { id: "documents", label: "Documents" },
  { id: "messages", label: "Email & SMS" },
  { id: "automations", label: "Automations" },
  { id: "terminology", label: "Terminology" },
  { id: "crew-app", label: "Crew app" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function templatesSnapshot(t: DocumentTemplate[]): string {
  return JSON.stringify(t);
}

function SetupWorkspaceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady } = useSettings();
  const { replaceCatalog } = useEquipmentCatalog();
  const draftCtx = useSettingsDraft();
  const meta = pageMeta["/admin/setup"];

  const rawTab = searchParams.get("tab");
  const resolvedTab = rawTab ? (setupTabRedirect[rawTab] ?? rawTab) : "rates";
  const activeTab: TabId = TABS.some((t) => t.id === resolvedTab) ? (resolvedTab as TabId) : "rates";

  const [templates, setTemplates] = useState<DocumentTemplate[]>(defaultDocumentTemplates);
  const [savedTemplatesSnapshot, setSavedTemplatesSnapshot] = useState("");
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(defaultMessageTemplates);
  const [savedMessageTemplatesSnapshot, setSavedMessageTemplatesSnapshot] = useState("");
  const [walkthroughTemplates, setWalkthroughTemplates] = useState<WalkthroughShareTemplates>(
    defaultWalkthroughShareTemplates,
  );
  const [savedWalkthroughTemplatesSnapshot, setSavedWalkthroughTemplatesSnapshot] = useState("");
  const [equipmentCatalog, setEquipmentCatalog] = useState<EquipmentCatalogItem[]>(() =>
    loadEquipmentCatalog(),
  );
  const [savedEquipmentSnapshot, setSavedEquipmentSnapshot] = useState(() =>
    catalogSnapshot(loadEquipmentCatalog()),
  );
  const [rateSchedule, setRateSchedule] = useState<PricingRateSchedule>(() =>
    loadPricingRateSchedule(),
  );
  const [savedRateScheduleSnapshot, setSavedRateScheduleSnapshot] = useState(() =>
    scheduleSnapshot(loadPricingRateSchedule()),
  );
  const [hourlySettings, setHourlySettings] = useState<HourlyQuoteSettings>(() =>
    normalizeHourlyQuoteSettings(currentRateEntry()?.hourlySettings),
  );
  const [flatRateSettings, setFlatRateSettings] = useState<FlatRateQuoteSettings>(() =>
    normalizeFlatRateQuoteSettings(currentRateEntry()?.flatRateSettings),
  );
  const [savedPricingSnapshot, setSavedPricingSnapshot] = useState("");

  useEffect(() => {
    if (!isReady) return;
    const loaded = loadDocumentTemplates();
    setTemplates(loaded);
    setSavedTemplatesSnapshot(templatesSnapshot(loaded));
    const loadedMessages = loadMessageTemplates();
    setMessageTemplates(loadedMessages);
    setSavedMessageTemplatesSnapshot(messageTemplatesSnapshot(loadedMessages));
    const loadedWalkthrough = loadWalkthroughShareTemplates();
    setWalkthroughTemplates(loadedWalkthrough);
    setSavedWalkthroughTemplatesSnapshot(walkthroughShareTemplatesSnapshot(loadedWalkthrough));
    const loadedSchedule = loadPricingRateSchedule();
    setRateSchedule(loadedSchedule);
    setSavedRateScheduleSnapshot(scheduleSnapshot(loadedSchedule));
    const entry = currentRateEntry();
    const loadedEquipment = entry
      ? applyCatalogPricesFromEntry(loadEquipmentCatalog(), entry)
      : loadEquipmentCatalog();
    setEquipmentCatalog(loadedEquipment);
    setSavedEquipmentSnapshot(catalogSnapshot(loadedEquipment));
    setHourlySettings(normalizeHourlyQuoteSettings(entry?.hourlySettings));
    setFlatRateSettings(normalizeFlatRateQuoteSettings(entry?.flatRateSettings));
    setSavedPricingSnapshot(
      JSON.stringify({
        hourlySettings: normalizeHourlyQuoteSettings(entry?.hourlySettings),
        flatRateSettings: normalizeFlatRateQuoteSettings(entry?.flatRateSettings),
      }),
    );
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

  const messagesDirty = useMemo(
    () =>
      messageTemplatesSnapshot(messageTemplates) !== savedMessageTemplatesSnapshot ||
      walkthroughShareTemplatesSnapshot(walkthroughTemplates) !== savedWalkthroughTemplatesSnapshot,
    [
      messageTemplates,
      savedMessageTemplatesSnapshot,
      walkthroughTemplates,
      savedWalkthroughTemplatesSnapshot,
    ],
  );

  const equipmentDirty = useMemo(
    () => catalogSnapshot(equipmentCatalog) !== savedEquipmentSnapshot,
    [equipmentCatalog, savedEquipmentSnapshot],
  );

  const pricingDirty = useMemo(
    () =>
      JSON.stringify({ hourlySettings, flatRateSettings }) !== savedPricingSnapshot ||
      scheduleSnapshot(rateSchedule) !== savedRateScheduleSnapshot,
    [hourlySettings, flatRateSettings, savedPricingSnapshot, rateSchedule, savedRateScheduleSnapshot],
  );

  const dirty =
    draftCtx.dirty || templatesDirty || messagesDirty || equipmentDirty || pricingDirty;

  function setTab(tab: TabId) {
    router.push(`/admin/setup?tab=${tab}`, { scroll: false });
  }

  function saveAll() {
    draftCtx.save();
    if (templatesDirty) {
      saveDocumentTemplates(templates);
      setSavedTemplatesSnapshot(templatesSnapshot(templates));
    }
    if (messagesDirty) {
      saveMessageTemplates(messageTemplates);
      setSavedMessageTemplatesSnapshot(messageTemplatesSnapshot(messageTemplates));
      saveWalkthroughShareTemplates(walkthroughTemplates);
      setSavedWalkthroughTemplatesSnapshot(walkthroughShareTemplatesSnapshot(walkthroughTemplates));
    }
    if (equipmentDirty || pricingDirty) {
      const effectiveFrom = new Date().toISOString().slice(0, 10);
      const nextSchedule = appendRateScheduleEntry(rateSchedule, {
        effectiveFrom,
        note: equipmentDirty && pricingDirty
          ? "Rates & catalog updated"
          : equipmentDirty
            ? "Catalog prices updated"
            : "Rate schedule updated",
        supplyUnitPrices: buildSupplyPriceMap(equipmentCatalog),
        hourlySettings: normalizeHourlyQuoteSettings(hourlySettings),
        flatRateSettings: normalizeFlatRateQuoteSettings(flatRateSettings),
        defaultPricingType: draftCtx.draft.defaults.defaultPricingType,
      });
      savePricingRateSchedule(nextSchedule);
      setRateSchedule(nextSchedule);
      setSavedRateScheduleSnapshot(scheduleSnapshot(nextSchedule));
      saveEquipmentCatalog(equipmentCatalog);
      replaceCatalog(equipmentCatalog);
      setSavedEquipmentSnapshot(catalogSnapshot(equipmentCatalog));
      setSavedPricingSnapshot(JSON.stringify({ hourlySettings, flatRateSettings }));
    }
  }

  function discardAll() {
    draftCtx.discard();
    const loaded = loadDocumentTemplates();
    setTemplates(loaded);
    setSavedTemplatesSnapshot(templatesSnapshot(loaded));
    const loadedMessages = loadMessageTemplates();
    setMessageTemplates(loadedMessages);
    setSavedMessageTemplatesSnapshot(messageTemplatesSnapshot(loadedMessages));
    const loadedWalkthrough = loadWalkthroughShareTemplates();
    setWalkthroughTemplates(loadedWalkthrough);
    setSavedWalkthroughTemplatesSnapshot(walkthroughShareTemplatesSnapshot(loadedWalkthrough));
    const loadedSchedule = loadPricingRateSchedule();
    setRateSchedule(loadedSchedule);
    setSavedRateScheduleSnapshot(scheduleSnapshot(loadedSchedule));
    const entry = currentRateEntry();
    const loadedEquipment = entry
      ? applyCatalogPricesFromEntry(loadEquipmentCatalog(), entry)
      : loadEquipmentCatalog();
    setEquipmentCatalog(loadedEquipment);
    setSavedEquipmentSnapshot(catalogSnapshot(loadedEquipment));
    replaceCatalog(loadedEquipment);
    setHourlySettings(normalizeHourlyQuoteSettings(entry?.hourlySettings));
    setFlatRateSettings(normalizeFlatRateQuoteSettings(entry?.flatRateSettings));
    setSavedPricingSnapshot(
      JSON.stringify({
        hourlySettings: normalizeHourlyQuoteSettings(entry?.hourlySettings),
        flatRateSettings: normalizeFlatRateQuoteSettings(entry?.flatRateSettings),
      }),
    );
  }

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading setup…</p>;
  }

  return (
    <div className="space-y-6 pb-20">
      <ModulePage title={meta.title} description={meta.description} />

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setTab} />

      {activeTab === "rates" && (
        <RatesCatalogTab
          hourlySettings={hourlySettings}
          onHourlySettingsChange={(patch) =>
            setHourlySettings((prev) => normalizeHourlyQuoteSettings({ ...prev, ...patch }))
          }
          flatRateSettings={flatRateSettings}
          onFlatRateSettingsChange={(patch) =>
            setFlatRateSettings((prev) => normalizeFlatRateQuoteSettings({ ...prev, ...patch }))
          }
          catalog={equipmentCatalog}
          onCatalogChange={setEquipmentCatalog}
          schedule={rateSchedule}
        />
      )}
      {activeTab === "pipeline" && <PipelineTab />}
      {activeTab === "leads" && <LeadsTab />}
      {activeTab === "move-types" && <MoveTypesTab />}
      {activeTab === "documents" && <TemplatesTab templates={templates} onChange={setTemplates} />}
      {activeTab === "messages" && (
        <MessageTemplatesTab
          templates={messageTemplates}
          onChange={setMessageTemplates}
          walkthroughTemplates={walkthroughTemplates}
          onWalkthroughChange={setWalkthroughTemplates}
        />
      )}
      {activeTab === "automations" && <AutomationsTab />}
      {activeTab === "terminology" && <TerminologyTab />}
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
