"use client";

import { PipelineCopyTab } from "@/components/admin/setup/PipelineCopyTab";
import { StatusesFieldsSection } from "@/components/admin/setup/StatusesFieldsSection";

export function PipelineTab() {
  return (
    <div className="space-y-4">
      <StatusesFieldsSection />
      <PipelineCopyTab />
    </div>
  );
}
