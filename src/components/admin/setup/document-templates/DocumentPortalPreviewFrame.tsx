"use client";

import { DocumentPortalPhoneFrame } from "@/components/admin/setup/document-templates/DocumentPortalPhoneFrame";
import { cn } from "@/lib/utils";
import { Monitor, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

export type PortalPreviewViewport = "mobile" | "desktop";

type DocumentPortalPreviewFrameProps = {
  viewport: PortalPreviewViewport;
  onViewportChange?: (viewport: PortalPreviewViewport) => void;
  showViewportToggle?: boolean;
  /** Side-by-side admin editor — phone only, tighter scroll area. */
  embedded?: boolean;
  children: ReactNode;
  className?: string;
};

export function DocumentPortalPreviewFrame({
  viewport,
  onViewportChange,
  showViewportToggle = true,
  embedded = false,
  children,
  className,
}: DocumentPortalPreviewFrameProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {showViewportToggle && onViewportChange ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Preview size
          </p>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px]">
            <ViewportButton
              active={viewport === "mobile"}
              onClick={() => onViewportChange("mobile")}
              icon={Smartphone}
              label="Mobile"
            />
            <ViewportButton
              active={viewport === "desktop"}
              onClick={() => onViewportChange("desktop")}
              icon={Monitor}
              label="Desktop"
            />
          </div>
        </div>
      ) : null}

      {viewport === "mobile" ? (
        <div className="flex justify-center">
          <DocumentPortalPhoneFrame embedded={embedded}>{children}</DocumentPortalPhoneFrame>
        </div>
      ) : (
        <div
          className={cn(
            "overflow-y-auto rounded-xl border border-slate-200/90 bg-slate-200/40 p-4 sm:p-6",
            embedded
              ? "max-h-[min(75vh,680px)]"
              : "max-h-[min(88vh,960px)] min-h-[32rem]",
          )}
        >
          <div className="mx-auto w-full min-w-0">
            <div className="mb-2 flex items-center gap-2 rounded-t-lg border border-b-0 border-slate-200 bg-white px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 truncate text-[10px] text-slate-400">
                portal.jonahsmovers.com — customer view
              </span>
            </div>
            <div className="document-portal-scroll max-h-[min(80vh,800px)] overflow-y-auto rounded-b-lg border border-slate-200 bg-white shadow-sm">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewportButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Smartphone;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition",
        active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
