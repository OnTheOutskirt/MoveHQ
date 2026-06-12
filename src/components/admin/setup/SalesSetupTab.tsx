"use client";

import { LeadsTab } from "@/components/admin/setup/LeadsTab";
import { MoveTypesTab } from "@/components/admin/setup/MoveTypesTab";
import { PipelineTab } from "@/components/admin/setup/PipelineTab";
import { RatesCatalogTab } from "@/components/admin/setup/RatesCatalogTab";
import { SetupSectionNav } from "@/components/admin/setup/SetupSectionNav";
import { TemplatesTab } from "@/components/admin/setup/TemplatesTab";
import type { SetupSalesSectionId } from "@/lib/navigation/setup-tabs";
import { SETUP_SALES_SECTIONS } from "@/lib/navigation/setup-tabs";
import type { EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import type { FlatRateQuoteSettings, HourlyQuoteSettings } from "@/lib/moves/hourly-quote-settings";
import type { PricingRateSchedule } from "@/lib/pricing/rate-history-types";
import type { DocumentTemplate } from "@/lib/settings/types";

type SalesSetupTabProps = {
  section: SetupSalesSectionId;
  onSectionChange: (section: SetupSalesSectionId) => void;
  hourlySettings: HourlyQuoteSettings;
  onHourlySettingsChange: (patch: Partial<HourlyQuoteSettings>) => void;
  flatRateSettings: FlatRateQuoteSettings;
  onFlatRateSettingsChange: (patch: Partial<FlatRateQuoteSettings>) => void;
  catalog: EquipmentCatalogItem[];
  onCatalogChange: (catalog: EquipmentCatalogItem[]) => void;
  schedule: PricingRateSchedule;
  templates: DocumentTemplate[];
  onTemplatesChange: (templates: DocumentTemplate[]) => void;
};

export function SalesSetupTab({
  section,
  onSectionChange,
  hourlySettings,
  onHourlySettingsChange,
  flatRateSettings,
  onFlatRateSettingsChange,
  catalog,
  onCatalogChange,
  schedule,
  templates,
  onTemplatesChange,
}: SalesSetupTabProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <SetupSectionNav
        title="Sales"
        items={SETUP_SALES_SECTIONS}
        activeId={section}
        onChange={(id) => onSectionChange(id as SetupSalesSectionId)}
      />
      <div className="min-w-0 flex-1">
        {section === "rates" ? (
          <RatesCatalogTab
            hourlySettings={hourlySettings}
            onHourlySettingsChange={onHourlySettingsChange}
            flatRateSettings={flatRateSettings}
            onFlatRateSettingsChange={onFlatRateSettingsChange}
            catalog={catalog}
            onCatalogChange={onCatalogChange}
            schedule={schedule}
          />
        ) : null}
        {section === "pipeline" ? <PipelineTab /> : null}
        {section === "leads" ? <LeadsTab /> : null}
        {section === "move-types" ? <MoveTypesTab /> : null}
        {section === "documents" ? (
          <TemplatesTab templates={templates} onChange={onTemplatesChange} />
        ) : null}
      </div>
    </div>
  );
}
