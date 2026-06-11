"use client";

import { WalkthroughsWorkspace } from "@/components/sales/WalkthroughsWorkspace";
import { ModulePage } from "@/components/shared/ModulePage";
import { pageMeta } from "@/lib/navigation/page-meta";

export default function WalkthroughsPage() {
  const meta = pageMeta["/sales/walkthroughs"] ?? {
    title: "Walkthroughs",
    description: "Schedule and track on-site and virtual walkthroughs before quoting.",
  };
  return (
    <div className="space-y-6">
      <ModulePage title={meta.title} description={meta.description} />
      <WalkthroughsWorkspace />
    </div>
  );
}
