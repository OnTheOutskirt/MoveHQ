"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DocumentPortalPhoneFrameProps = {
  children: ReactNode;
  className?: string;
  /** Fill parent height (send dialog). */
  fillHeight?: boolean;
  /** Side-by-side setup editor — shorter fixed phone. */
  embedded?: boolean;
};

export function DocumentPortalPhoneFrame({
  children,
  className,
  fillHeight = false,
  embedded = false,
}: DocumentPortalPhoneFrameProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[390px] shrink-0 flex-col",
        fillHeight && "h-full min-h-0 max-h-full",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden rounded-[2rem] bg-slate-900 p-2 shadow-xl ring-1 ring-slate-900/10",
          fillHeight && "h-full max-h-full min-h-[20rem]",
          !fillHeight && embedded && "h-[min(72vh,640px)]",
          !fillHeight && !embedded && "h-[min(85vh,820px)]",
        )}
      >
        <div className="mx-auto mb-1 h-4 w-24 shrink-0 rounded-full bg-slate-800" aria-hidden />
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.35rem] bg-white">
          <div className="document-portal-scroll absolute inset-0 overflow-y-auto overscroll-y-contain bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
