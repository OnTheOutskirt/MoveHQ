"use client";

import { CalendarColorsTab } from "@/components/calendar/settings/CalendarColorsTab";
import { CalendarMetricsTab } from "@/components/calendar/settings/CalendarMetricsTab";
import { DayShareTab } from "@/components/calendar/settings/DayShareTab";
import { DaysOffTab } from "@/components/calendar/settings/DaysOffTab";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { TabBar } from "@/components/shared/TabBar";
import type { CalendarSettingsTab } from "@/lib/calendar/settings/types";
import { useState } from "react";

const SETTINGS_TABS = [
  { id: "metrics" as const, label: "Day card metrics" },
  { id: "day-share" as const, label: "Open slots" },
  { id: "days-off" as const, label: "Days off" },
  { id: "colors" as const, label: "Colors" },
];

type CalendarSettingsSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function CalendarSettingsSidebar({ open, onClose }: CalendarSettingsSidebarProps) {
  const [activeTab, setActiveTab] = useState<CalendarSettingsTab>("metrics");
  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Move Calendar Settings"
      description="Day card metrics, closures, and colors — per location or company-wide"
      widthClassName="max-w-xl"
    >
      <TabBar tabs={SETTINGS_TABS} activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-4">
        {activeTab === "metrics" && <CalendarMetricsTab />}
        {activeTab === "day-share" && <DayShareTab />}
        {activeTab === "days-off" && <DaysOffTab />}
        {activeTab === "colors" && <CalendarColorsTab />}
      </div>
    </DetailSidebar>
  );
}
