"use client";

import { useMoveSendDocument } from "@/components/moves/detail/MoveSendDocumentProvider";
import { Button } from "@/components/ui/Button";
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
  const { openSendQuote, openSendContract } = useMoveSendDocument();

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
          className="gap-1.5"
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
          className="gap-1.5"
          onClick={openSendContract}
        >
          <FileSignature className="h-3.5 w-3.5" />
          Send contract
        </Button>
      ) : null}
    </div>
  );
}
