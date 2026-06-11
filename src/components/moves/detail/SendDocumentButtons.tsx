"use client";

import { useMoveSendDocument } from "@/components/moves/detail/MoveSendDocumentProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FileSignature, FileText } from "lucide-react";

type SendDocumentButtonsProps = {
  variant?: "inline" | "stacked";
  showQuote?: boolean;
  showContract?: boolean;
};

export function SendDocumentButtons({
  variant = "inline",
  showQuote = true,
  showContract = true,
}: SendDocumentButtonsProps) {
  const {
    openSendQuote,
    openSendContract,
    canSendDocuments,
    sentQuote,
    sentContract,
  } = useMoveSendDocument();

  if (!showQuote && !showContract) return null;

  return (
    <div
      className={
        variant === "stacked"
          ? "flex flex-col gap-2"
          : "flex flex-wrap items-center gap-2"
      }
    >
      {showQuote ? (
        <Button
          type="button"
          size="sm"
          className={cn("gap-1.5", sentQuote && canSendDocuments && "opacity-60")}
          disabled={!canSendDocuments}
          title={!canSendDocuments ? "Create a flat rate or hourly quote first" : undefined}
          onClick={openSendQuote}
        >
          <FileText className="h-3.5 w-3.5" />
          Send quote
        </Button>
      ) : null}
      {showContract ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className={cn("gap-1.5", sentContract && canSendDocuments && "opacity-60")}
          disabled={!canSendDocuments}
          title={!canSendDocuments ? "Create a flat rate or hourly quote first" : undefined}
          onClick={openSendContract}
        >
          <FileSignature className="h-3.5 w-3.5" />
          Send contract
        </Button>
      ) : null}
    </div>
  );
}
