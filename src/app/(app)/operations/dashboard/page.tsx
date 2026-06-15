"use client";

import { OpsDashboardPanel } from "@/components/dashboard/OpsDashboardPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/operations/dashboard"];

export default function OperationsDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title={meta.title} description={meta.description} />
      <OpsDashboardPanel />
    </div>
  );
}
