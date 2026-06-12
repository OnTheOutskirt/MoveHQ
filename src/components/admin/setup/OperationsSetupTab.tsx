"use client";

import { OperationsTab } from "@/components/admin/setup/OperationsTab";
import { SetupSectionNav } from "@/components/admin/setup/SetupSectionNav";
import type { SetupOperationsSectionId } from "@/lib/navigation/setup-tabs";
import { SETUP_OPERATIONS_SECTIONS } from "@/lib/navigation/setup-tabs";

type OperationsSetupTabProps = {
  section: SetupOperationsSectionId;
  onSectionChange: (section: SetupOperationsSectionId) => void;
};

export function OperationsSetupTab({ section, onSectionChange }: OperationsSetupTabProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <SetupSectionNav
        title="Operations"
        items={SETUP_OPERATIONS_SECTIONS}
        activeId={section}
        onChange={(id) => onSectionChange(id as SetupOperationsSectionId)}
      />
      <div className="min-w-0 flex-1">
        <OperationsTab section={section} />
      </div>
    </div>
  );
}
