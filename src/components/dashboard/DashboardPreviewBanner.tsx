import { Info } from "lucide-react";

export function DashboardPreviewBanner() {
  return (
    <div className="flex gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
      <p>
        <span className="font-medium">Preview mode.</span> Tabs let you compare dashboard
        layouts while we build. In production, each person lands on one view based on their
        permission — no role switcher on this page.
      </p>
    </div>
  );
}
