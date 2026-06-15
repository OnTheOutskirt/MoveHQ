"use client";

import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { DataImportWorkspace } from "@/components/admin/import/DataImportWorkspace";
import { AutomationsTab } from "@/components/admin/setup/AutomationsTab";
import { CrewAppTab } from "@/components/admin/setup/CrewAppTab";
import { MessageTemplatesTab } from "@/components/admin/setup/MessageTemplatesTab";
import { OperationsSetupTab } from "@/components/admin/setup/OperationsSetupTab";
import { SalesSetupTab } from "@/components/admin/setup/SalesSetupTab";
import { TerminologyTab } from "@/components/admin/setup/TerminologyTab";
import { SettingsDraftProvider, useSettingsDraft } from "@/components/providers/SettingsDraftProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { ModulePage } from "@/components/shared/ModulePage";
import { TabBar } from "@/components/shared/TabBar";
import { SETUP_INTEGRATIONS_PATH } from "@/lib/navigation/admin-redirects";
import { pageMeta } from "@/lib/navigation/page-meta";
import {
  operationsSectionFromLocation,
  resolveSetupLocation,
  salesSectionFromLocation,
  SETUP_TOP_TABS,
  setupLocationHref,
  type SetupLocation,
  type SetupOperationsSectionId,
  type SetupSalesSectionId,
  type SetupTopTabId,
} from "@/lib/navigation/setup-tabs";
import { defaultDocumentTemplates } from "@/lib/settings/defaults";
import { loadDocumentTemplates, saveDocumentTemplates } from "@/lib/settings/storage";
import {
  defaultMessageTemplates,
  loadMessageTemplates,
  saveMessageTemplates,
  templatesSnapshot as messageTemplatesSnapshot,
} from "@/lib/communications/message-templates";
import {
  loadVendorMessageTemplates,
  saveVendorMessageTemplates,
  vendorMessageTemplatesSnapshot,
  type VendorMessageTemplatesStore,
} from "@/lib/communications/vendor-message-templates";
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
  const rawSection = searchParams.get("section");
  const location = useMemo(
    () => resolveSetupLocation(rawTab, rawSection),
    [rawTab, rawSection],
  );
  const canonicalHref = setupLocationHref(location);

  const [templates, setTemplates] = useState<DocumentTemplate[]>(defaultDocumentTemplates);
  const [savedTemplatesSnapshot, setSavedTemplatesSnapshot] = useState("");
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(defaultMessageTemplates);
  const [savedMessageTemplatesSnapshot, setSavedMessageTemplatesSnapshot] = useState("");
  const [walkthroughTemplates, setWalkthroughTemplates] = useState<WalkthroughShareTemplates>(
    defaultWalkthroughShareTemplates,
  );
  const [savedWalkthroughTemplatesSnapshot, setSavedWalkthroughTemplatesSnapshot] = useState("");
  const [vendorTemplates, setVendorTemplates] = useState<VendorMessageTemplatesStore>(() =>
    loadVendorMessageTemplates(),
  );
  const [savedVendorTemplatesSnapshot, setSavedVendorTemplatesSnapshot] = useState("");
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
    const loadedVendorTemplates = loadVendorMessageTemplates();
    setVendorTemplates(loadedVendorTemplates);
    setSavedVendorTemplatesSnapshot(vendorMessageTemplatesSnapshot(loadedVendorTemplates));
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
    const currentHref = `/admin/setup?${searchParams.toString()}`;
    if (currentHref !== canonicalHref) {
      router.replace(canonicalHref, { scroll: false });
    }
  }, [rawTab, searchParams, canonicalHref, router]);

  const templatesDirty = useMemo(
    () => templatesSnapshot(templates) !== savedTemplatesSnapshot,
    [templates, savedTemplatesSnapshot],
  );

  const messagesDirty = useMemo(
    () =>
      messageTemplatesSnapshot(messageTemplates) !== savedMessageTemplatesSnapshot ||
      walkthroughShareTemplatesSnapshot(walkthroughTemplates) !== savedWalkthroughTemplatesSnapshot ||
      vendorMessageTemplatesSnapshot(vendorTemplates) !== savedVendorTemplatesSnapshot,
    [
      messageTemplates,
      savedMessageTemplatesSnapshot,
      walkthroughTemplates,
      savedWalkthroughTemplatesSnapshot,
      vendorTemplates,
      savedVendorTemplatesSnapshot,
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

  function setLocation(next: SetupLocation) {
    router.push(setupLocationHref(next), { scroll: false });
  }

  function setTopTab(tab: SetupTopTabId) {
    setLocation(resolveSetupLocation(tab, null));
  }

  function setSalesSection(section: SetupSalesSectionId) {
    setLocation({ tab: "sales", section });
  }

  function setOperationsSection(section: SetupOperationsSectionId) {
    setLocation({ tab: "operations", section });
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
      saveVendorMessageTemplates(vendorTemplates);
      setSavedVendorTemplatesSnapshot(vendorMessageTemplatesSnapshot(vendorTemplates));
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
    const loadedVendorTemplates = loadVendorMessageTemplates();
    setVendorTemplates(loadedVendorTemplates);
    setSavedVendorTemplatesSnapshot(vendorMessageTemplatesSnapshot(loadedVendorTemplates));
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

  const salesSection = salesSectionFromLocation(location);
  const operationsSection = operationsSectionFromLocation(location);

  return (
    <div className="space-y-6 pb-20">
      <ModulePage title={meta.title} description={meta.description} />

      <TabBar tabs={SETUP_TOP_TABS} activeTab={location.tab} onChange={setTopTab} />

      {location.tab === "sales" ? (
        <SalesSetupTab
          section={salesSection}
          onSectionChange={setSalesSection}
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
          templates={templates}
          onTemplatesChange={setTemplates}
        />
      ) : null}
      {location.tab === "operations" ? (
        <OperationsSetupTab section={operationsSection} onSectionChange={setOperationsSection} />
      ) : null}
      {location.tab === "messages" ? (
        <MessageTemplatesTab
          templates={messageTemplates}
          onChange={setMessageTemplates}
          walkthroughTemplates={walkthroughTemplates}
          onWalkthroughChange={setWalkthroughTemplates}
          vendorTemplates={vendorTemplates}
          onVendorTemplatesChange={setVendorTemplates}
        />
      ) : null}
      {location.tab === "automations" ? <AutomationsTab /> : null}
      {location.tab === "terminology" ? <TerminologyTab /> : null}
      {location.tab === "mobile-app" ? <CrewAppTab /> : null}
      {location.tab === "import" ? <DataImportWorkspace /> : null}

      {location.tab !== "import" ? (
        <AdminSaveBar dirty={dirty} onSave={saveAll} onDiscard={discardAll} />
      ) : null}
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
