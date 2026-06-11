"use client";

import { DocumentPortalPreview } from "@/components/admin/setup/document-templates/DocumentPortalPreview";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  buildDocumentTemplateVars,
  getTemplateForKind,
  type DocumentSendKind,
} from "@/lib/moves/document-template-render";
import { computeMoveDeposit } from "@/lib/moves/move-deposit";
import { resolveDocumentAccentColor } from "@/lib/settings/document-accent";
import { loadDocumentTemplates } from "@/lib/settings/storage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

export default function PortalViewPage() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const {
    getMoveById,
    recordQuoteBookingRequested,
    recordMoveDocumentViewed,
    recordContractSignedWithDeposit,
  } = useMoves();

  const moveId = searchParams.get("move");
  const kind: DocumentSendKind = searchParams.get("kind") === "contract" ? "contract" : "quote";
  const viewedRef = useRef<string | null>(null);

  const move = useMemo(
    () => (moveId ? getMoveById(moveId) : undefined),
    [moveId, getMoveById],
  );

  const template = useMemo(() => {
    const templates = loadDocumentTemplates();
    return getTemplateForKind(templates, kind);
  }, [kind]);

  const deposit = useMemo(
    () =>
      move
        ? computeMoveDeposit(move, settings.defaults, settings.fieldCatalog.discountReasons)
        : null,
    [move, settings.defaults, settings.fieldCatalog.discountReasons],
  );

  const templateVars = useMemo(() => {
    if (!move || !deposit) return null;
    return buildDocumentTemplateVars(move, settings, deposit);
  }, [move, settings, deposit]);

  const accent = useMemo(
    () => resolveDocumentAccentColor(template, settings.branding.accentColor),
    [template, settings.branding.accentColor],
  );

  useEffect(() => {
    if (!moveId || viewedRef.current === `${moveId}-${kind}`) return;
    viewedRef.current = `${moveId}-${kind}`;
    recordMoveDocumentViewed(moveId, kind);
  }, [moveId, kind, recordMoveDocumentViewed]);

  if (!moveId || !move || !templateVars) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Link unavailable</p>
        <p className="mt-2 text-sm text-slate-500">
          This customer portal link is invalid or the move is no longer available.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg bg-white shadow-sm">
      <DocumentPortalPreview
        portal={template.portal}
        vars={templateVars}
        kind={kind}
        logoDataUrl={settings.branding.logoDataUrl}
        accentColor={accent}
        companyName={settings.branding.companyName}
        interactive
        viewport="mobile"
        moveId={moveId}
        onQuoteBookRequested={() => recordQuoteBookingRequested(moveId)}
        onContractCompleted={() =>
          recordContractSignedWithDeposit(moveId, deposit?.depositDue ?? 0)
        }
      />
      <p className="border-t border-slate-100 px-4 py-3 text-center text-[11px] text-slate-400">
        {settings.branding.companyName} ·{" "}
        <Link href={`tel:${settings.company.phone}`} className="text-brand-600 hover:underline">
          {settings.company.phone || "Contact us"}
        </Link>
      </p>
    </div>
  );
}
