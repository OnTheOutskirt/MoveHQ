"use client";

import {
  DirectoryContactActionSidebar,
  directoryActionAvailable,
  type DirectoryContactTarget,
} from "@/components/people/DirectoryContactActionSidebar";
import type { DirectoryContactChannel } from "@/lib/people/contact-communication-history";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";

export type DirectoryContactActionsProps = {
  name: string;
  phone?: string | null;
  email?: string | null;
  moveIds?: string[];
  size?: "sm" | "md";
  className?: string;
  /** Stop row click when used inside a clickable table row */
  stopPropagation?: boolean;
};

const CHANNELS: {
  id: DirectoryContactChannel;
  icon: typeof Phone;
  label: string;
}[] = [
  { id: "call", icon: Phone, label: "Call" },
  { id: "sms", icon: MessageSquare, label: "Text" },
  { id: "email", icon: Mail, label: "Email" },
];

export function DirectoryContactActions({
  name,
  phone,
  email,
  moveIds = [],
  size = "sm",
  className,
  stopPropagation = false,
}: DirectoryContactActionsProps) {
  const [openAction, setOpenAction] = useState<DirectoryContactChannel | null>(null);

  const target: DirectoryContactTarget = { name, phone, email, moveIds };
  const hasAny = Boolean(phone?.trim() || email?.trim());

  if (!hasAny) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const pad = size === "md" ? "h-9 w-9" : "h-8 w-8";

  function wrapClick(e: MouseEvent) {
    if (stopPropagation) e.stopPropagation();
  }

  return (
    <>
      <div className={cn("flex items-center gap-1", className)} onClick={wrapClick}>
        {CHANNELS.map(({ id, icon: Icon, label }) => {
          const available = directoryActionAvailable(id, target);
          return (
            <button
              key={id}
              type="button"
              disabled={!available}
              title={available ? label : `No ${label.toLowerCase()} on file`}
              aria-label={label}
              onClick={() => available && setOpenAction(id)}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border transition-colors",
                pad,
                available
                  ? "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
              )}
            >
              <Icon className={icon} />
            </button>
          );
        })}
      </div>

      <DirectoryContactActionSidebar
        target={target}
        action={openAction}
        onClose={() => setOpenAction(null)}
      />
    </>
  );
}
