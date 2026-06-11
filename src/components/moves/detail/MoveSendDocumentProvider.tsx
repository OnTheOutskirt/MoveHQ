"use client";

import { SendDocumentDialog } from "@/components/moves/detail/SendDocumentDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useMoves } from "@/components/moves/MovesProvider";
import type { DocumentSendKind } from "@/lib/moves/document-template-render";
import {
  moveHasCreatedQuote,
  resolveSentContract,
  resolveSentQuote,
} from "@/lib/moves/move-document-send";
import type { MoveRecord } from "@/lib/moves/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MoveSendDocumentContextValue = {
  openSendQuote: () => void;
  openSendContract: () => void;
  canSendDocuments: boolean;
  sentQuote: ReturnType<typeof resolveSentQuote>;
  sentContract: ReturnType<typeof resolveSentContract>;
};

const MoveSendDocumentContext = createContext<MoveSendDocumentContextValue | null>(null);

export function MoveSendDocumentProvider({
  move,
  children,
}: {
  move: MoveRecord;
  children: ReactNode;
}) {
  const { getMoveById, recordMoveDocumentSent } = useMoves();
  const liveMove = getMoveById(move.id) ?? move;

  const [kind, setKind] = useState<DocumentSendKind | null>(null);
  const [resendConfirm, setResendConfirm] = useState<DocumentSendKind | null>(null);

  const canSendDocuments = moveHasCreatedQuote(liveMove);
  const sentQuote = resolveSentQuote(liveMove);
  const sentContract = resolveSentContract(liveMove);

  const openDocument = useCallback(
    (documentKind: DocumentSendKind) => {
      if (!moveHasCreatedQuote(liveMove)) return;

      if (documentKind === "quote" && sentQuote) {
        setResendConfirm("quote");
        return;
      }
      if (documentKind === "contract" && sentContract) {
        setResendConfirm("contract");
        return;
      }
      setKind(documentKind);
    },
    [liveMove, sentQuote, sentContract],
  );

  const openSendQuote = useCallback(() => openDocument("quote"), [openDocument]);
  const openSendContract = useCallback(() => openDocument("contract"), [openDocument]);

  const value = useMemo(
    () => ({
      openSendQuote,
      openSendContract,
      canSendDocuments,
      sentQuote,
      sentContract,
    }),
    [openSendQuote, openSendContract, canSendDocuments, sentQuote, sentContract],
  );

  function handleSent() {
    if (!kind) return;
    recordMoveDocumentSent(liveMove.id, kind);
  }

  return (
    <MoveSendDocumentContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={resendConfirm === "quote"}
        onClose={() => setResendConfirm(null)}
        onConfirm={() => setKind("quote")}
        title="Resend quote?"
        description="A quote has already been sent to the customer. Do you want to resend it?"
        confirmLabel="Resend quote"
      />
      <ConfirmDialog
        open={resendConfirm === "contract"}
        onClose={() => setResendConfirm(null)}
        onConfirm={() => setKind("contract")}
        title="Resend contract?"
        description="A contract has already been sent for signature. Do you want to resend it?"
        confirmLabel="Resend contract"
      />
      <SendDocumentDialog
        move={liveMove}
        kind={kind}
        open={kind !== null}
        onClose={() => setKind(null)}
        onSent={handleSent}
        isResend={
          kind === "quote" ? sentQuote != null : kind === "contract" ? sentContract != null : false
        }
      />
    </MoveSendDocumentContext.Provider>
  );
}

export function useMoveSendDocument() {
  const ctx = useContext(MoveSendDocumentContext);
  if (!ctx) {
    throw new Error("useMoveSendDocument must be used within MoveSendDocumentProvider");
  }
  return ctx;
}
