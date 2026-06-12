"use client";

import {
  fillVendorEmailTemplate,
  fillVendorSmsTemplate,
  getVendorTypeTemplate,
  VENDOR_MESSAGE_TEMPLATES_UPDATED_EVENT,
  type VendorMessageTemplateContext,
} from "@/lib/communications/vendor-message-templates";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type VendorMessageTemplateBarProps = {
  vendorTypeId: string;
  channel: "sms" | "email";
  context: VendorMessageTemplateContext;
  onApply: (text: string) => void;
  onApplyEmail?: (payload: { subject: string; body: string }) => void;
  className?: string;
};

export function VendorMessageTemplateBar({
  vendorTypeId,
  channel,
  context,
  onApply,
  onApplyEmail,
  className,
}: VendorMessageTemplateBarProps) {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    function refresh() {
      setRevision((n) => n + 1);
    }
    window.addEventListener(VENDOR_MESSAGE_TEMPLATES_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(VENDOR_MESSAGE_TEMPLATES_UPDATED_EVENT, refresh);
  }, []);

  function applyTemplate() {
    const template = getVendorTypeTemplate(vendorTypeId);
    if (channel === "email" && onApplyEmail) {
      const filled = fillVendorEmailTemplate(template, context);
      onApplyEmail(filled);
      onApply(filled.body);
      return;
    }
    onApply(fillVendorSmsTemplate(template, context));
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={applyTemplate}
        className="inline-flex min-w-0 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:border-brand-200 hover:bg-brand-50"
      >
        Use {context.vendorType ?? "vendor"} template
      </button>
      <span className="sr-only" aria-live="polite">
        {revision > 0 ? "Templates refreshed" : ""}
      </span>
    </div>
  );
}
