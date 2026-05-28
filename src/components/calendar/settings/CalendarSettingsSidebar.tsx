"use client";

import { CalendarColorsTab } from "@/components/calendar/settings/CalendarColorsTab";
import { DaysOffTab } from "@/components/calendar/settings/DaysOffTab";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { TabBar } from "@/components/shared/TabBar";
import type { CalendarSettingsTab } from "@/lib/calendar/settings/types";
import { useState } from "react";

const SETTINGS_TABS = [
  { id: "days-off" as const, label: "Days off" },
  { id: "colors" as const, label: "Calendar colors" },
];

type CalendarSettingsSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function CalendarSettingsSidebar({ open, onClose }: CalendarSettingsSidebarProps) {
  const [activeTab, setActiveTab] = useState<CalendarSettingsTab>("days-off");

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Move Calendar Settings"
      description="Holidays, closures, and calendar preferences"
      widthClassName="max-w-lg"
    >
      <TabBar tabs={SETTINGS_TABS} activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-4">
        {activeTab === "days-off" && <DaysOffTab />}
        {activeTab === "colors" && <CalendarColorsTab />}
      </div>
    </DetailSidebar>
  );
}
