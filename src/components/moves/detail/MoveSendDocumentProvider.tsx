"use client";

import { SendDocumentDialog } from "@/components/moves/detail/SendDocumentDialog";
import type { DocumentSendKind } from "@/lib/moves/document-template-render";
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
};

const MoveSendDocumentContext = createContext<MoveSendDocumentContextValue | null>(null);

export function MoveSendDocumentProvider({
  move,
  children,
}: {
  move: MoveRecord;
  children: ReactNode;
}) {
  const [kind, setKind] = useState<DocumentSendKind | null>(null);

  const openSendQuote = useCallback(() => setKind("quote"), []);
  const openSendContract = useCallback(() => setKind("contract"), []);

  const value = useMemo(
    () => ({ openSendQuote, openSendContract }),
    [openSendQuote, openSendContract],
  );

  return (
    <MoveSendDocumentContext.Provider value={value}>
      {children}
      <SendDocumentDialog
        move={move}
        kind={kind}
        open={kind !== null}
        onClose={() => setKind(null)}
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
