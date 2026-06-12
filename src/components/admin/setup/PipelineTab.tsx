"use client";

import { DirectoryTypesSection } from "@/components/admin/setup/DirectoryTypesSection";
import { DiscountReasonsSection } from "@/components/admin/setup/DiscountReasonsSection";
import { PipelineCopyTab } from "@/components/admin/setup/PipelineCopyTab";
import { StatusesFieldsSection } from "@/components/admin/setup/StatusesFieldsSection";

export function PipelineTab() {
  return (
    <div className="space-y-4">
      <StatusesFieldsSection />
      <DirectoryTypesSection />
      <DiscountReasonsSection />
      <PipelineCopyTab />
    </div>
  );
}
