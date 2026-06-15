"use client";

import { SalesDashboardPanel } from "@/components/dashboard/SalesDashboardPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/sales/dashboard"];

export default function SalesDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title={meta.title} description={meta.description} />
      <SalesDashboardPanel />
    </div>
  );
}
