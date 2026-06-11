"use client";

import { QuoteBookingConfirmation } from "@/components/admin/setup/document-templates/QuoteBookingConfirmation";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { resolveDocumentAccentColor } from "@/lib/settings/document-accent";
import { defaultDocumentTemplate } from "@/lib/settings/document-template-normalize";
import { loadDocumentTemplates } from "@/lib/settings/storage";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function QuoteBookingRequestedPage() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { recordQuoteBookingRequested } = useMoves();

  const moveId = searchParams.get("move");
  const moveDate = searchParams.get("moveDate") ?? undefined;
  const moveReference = searchParams.get("ref") ?? undefined;
  const returnHref = searchParams.get("return") ?? "/portal/preview?kind=quote";

  useEffect(() => {
    if (moveId) recordQuoteBookingRequested(moveId);
  }, [moveId, recordQuoteBookingRequested]);

  const accentColor = useMemo(() => {
    const templates = loadDocumentTemplates();
    const quote = templates.find((t) => t.id === "quote") ?? defaultDocumentTemplate("quote");
    return resolveDocumentAccentColor(quote, settings.branding.accentColor);
  }, [settings.branding.accentColor]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
      <QuoteBookingConfirmation
        accentColor={accentColor}
        companyName={settings.branding.companyName}
        moveDate={moveDate}
        moveReference={moveReference}
        quoteHref={returnHref}
      />
    </div>
  );
}
