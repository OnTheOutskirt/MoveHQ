"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

type DetailSidebarProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Rendered beside the title (e.g. header controls). */
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  /** Pinned below scrollable body (e.g. save / cancel). */
  footer?: React.ReactNode;
  /** Width class — default max-w-md */
  widthClassName?: string;
  /** Override scroll body layout (e.g. flex column for chat-style panels). */
  bodyClassName?: string;
};

export function DetailSidebar({
  open,
  onClose,
  title,
  description,
  headerExtra,
  children,
  footer,
  widthClassName = "max-w-md",
  bodyClassName,
}: DetailSidebarProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 transition-opacity"
        onClick={onClose}
        aria-label="Close panel"
      />
      <aside
        className={cn(
          "relative flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-xl",
          widthClassName,
        )}
      >
        <header className="shrink-0 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <h2 className="shrink-0 text-lg font-semibold text-slate-900">{title}</h2>
              {headerExtra}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        </header>
        <div
          className={cn(
            "flex-1 overflow-y-auto px-5 py-5",
            footer && "min-h-0",
            bodyClassName,
          )}
        >
          {children}
        </div>
        {footer ? (
          <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4">{footer}</footer>
        ) : null}
      </aside>
    </div>
  );
}
