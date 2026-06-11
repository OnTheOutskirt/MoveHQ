"use client";

import {
  DEFAULT_EMPLOYEE_HR_DOCS,
  generateEmployeeHrDocId,
  loadEmployeeHrDocs,
  saveEmployeeHrDocs,
  type NewEmployeeHrDoc,
} from "@/lib/team/employee-hr-docs-storage";
import type { EmployeeHrDoc } from "@/lib/team/employee-hr-docs-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type EmployeeHrDocsContextValue = {
  isReady: boolean;
  docs: EmployeeHrDoc[];
  docsForMember: (memberId: string) => EmployeeHrDoc[];
  addDoc: (input: NewEmployeeHrDoc) => EmployeeHrDoc;
  updateDoc: (id: string, patch: Partial<Omit<EmployeeHrDoc, "id" | "memberId" | "createdAt">>) => void;
  deleteDoc: (id: string) => void;
  resetDocs: () => void;
};

const EmployeeHrDocsContext = createContext<EmployeeHrDocsContextValue | null>(null);

export function EmployeeHrDocsProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<EmployeeHrDoc[]>(DEFAULT_EMPLOYEE_HR_DOCS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setDocs(loadEmployeeHrDocs());
    setIsReady(true);
  }, []);

  const persist = useCallback((next: EmployeeHrDoc[]) => {
    setDocs(next);
    saveEmployeeHrDocs(next);
  }, []);

  const docsForMember = useCallback(
    (memberId: string) =>
      docs
        .filter((d) => d.memberId === memberId)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [docs],
  );

  const addDoc = useCallback(
    (input: NewEmployeeHrDoc) => {
      const doc: EmployeeHrDoc = {
        ...input,
        id: generateEmployeeHrDocId(),
        createdAt: new Date().toISOString(),
      };
      persist([doc, ...docs]);
      return doc;
    },
    [docs, persist],
  );

  const updateDoc = useCallback(
    (id: string, patch: Partial<Omit<EmployeeHrDoc, "id" | "memberId" | "createdAt">>) => {
      persist(docs.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    },
    [docs, persist],
  );

  const deleteDoc = useCallback(
    (id: string) => {
      persist(docs.filter((d) => d.id !== id));
    },
    [docs, persist],
  );

  const resetDocs = useCallback(() => {
    persist([...DEFAULT_EMPLOYEE_HR_DOCS]);
  }, [persist]);

  const value = useMemo(
    () => ({
      isReady,
      docs,
      docsForMember,
      addDoc,
      updateDoc,
      deleteDoc,
      resetDocs,
    }),
    [isReady, docs, docsForMember, addDoc, updateDoc, deleteDoc, resetDocs],
  );

  return (
    <EmployeeHrDocsContext.Provider value={value}>{children}</EmployeeHrDocsContext.Provider>
  );
}

export function useEmployeeHrDocs() {
  const ctx = useContext(EmployeeHrDocsContext);
  if (!ctx) throw new Error("useEmployeeHrDocs must be used within EmployeeHrDocsProvider");
  return ctx;
}
