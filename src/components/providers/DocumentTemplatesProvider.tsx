"use client";

import { defaultDocumentTemplates } from "@/lib/settings/document-template-normalize";
import { loadDocumentTemplates, saveDocumentTemplates } from "@/lib/settings/storage";
import type { DocumentTemplate, DocumentTemplateType } from "@/lib/settings/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type DocumentTemplatesContextValue = {
  templates: DocumentTemplate[];
  getTemplate: (id: DocumentTemplateType) => DocumentTemplate;
  updateTemplate: (id: DocumentTemplateType, patch: Partial<DocumentTemplate>) => void;
  resetTemplate: (id: DocumentTemplateType) => void;
  resetAllTemplates: () => void;
  isReady: boolean;
};

const DocumentTemplatesContext = createContext<DocumentTemplatesContextValue | null>(null);

export function DocumentTemplatesProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(defaultDocumentTemplates());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTemplates(loadDocumentTemplates());
    setIsReady(true);
  }, []);

  const persist = useCallback((next: DocumentTemplate[]) => {
    setTemplates(next);
    saveDocumentTemplates(next);
  }, []);

  const getTemplate = useCallback(
    (id: DocumentTemplateType) => {
      const found = templates.find((t) => t.id === id);
      return found ?? defaultDocumentTemplates().find((t) => t.id === id)!;
    },
    [templates],
  );

  const updateTemplate = useCallback((id: DocumentTemplateType, patch: Partial<DocumentTemplate>) => {
    setTemplates((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
      );
      saveDocumentTemplates(next);
      return next;
    });
  }, []);

  const resetTemplate = useCallback((id: DocumentTemplateType) => {
    const fresh = defaultDocumentTemplates().find((t) => t.id === id)!;
    setTemplates((prev) => {
      const next = prev.map((t) => (t.id === id ? fresh : t));
      saveDocumentTemplates(next);
      return next;
    });
  }, []);

  const resetAllTemplates = useCallback(() => {
    persist(defaultDocumentTemplates());
  }, [persist]);

  const value = useMemo(
    () => ({
      templates,
      getTemplate,
      updateTemplate,
      resetTemplate,
      resetAllTemplates,
      isReady,
    }),
    [templates, getTemplate, updateTemplate, resetTemplate, resetAllTemplates, isReady],
  );

  return (
    <DocumentTemplatesContext.Provider value={value}>{children}</DocumentTemplatesContext.Provider>
  );
}

export function useDocumentTemplates() {
  const ctx = useContext(DocumentTemplatesContext);
  if (!ctx) throw new Error("useDocumentTemplates must be used within DocumentTemplatesProvider");
  return ctx;
}
