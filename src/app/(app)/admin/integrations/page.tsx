"use client";

import { IntegrationsWorkspace } from "@/components/admin/integrations/IntegrationsWorkspace";
import { ModulePage } from "@/components/shared/ModulePage";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/admin/integrations"];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <ModulePage title={meta.title} description={meta.description} />
      <IntegrationsWorkspace />
    </div>
  );
}
