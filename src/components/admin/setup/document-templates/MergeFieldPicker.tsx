"use client";

import {
  DOCUMENT_MERGE_FIELDS,
  mergeFieldToken,
  type DocumentMergeField,
  type MergeFieldGroup,
} from "@/lib/settings/document-template-defaults";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useMemo } from "react";

type MergeFieldPickerProps = {
  onInsert: (token: string) => void;
  className?: string;
  /** Hide link fields in email-only contexts if needed */
  groups?: MergeFieldGroup[];
};

const GROUP_ORDER: MergeFieldGroup[] = ["Company", "Customer", "Move", "Pricing", "Links"];

export function MergeFieldPicker({ onInsert, className, groups }: MergeFieldPickerProps) {
  const fields = useMemo(() => {
    if (!groups) return DOCUMENT_MERGE_FIELDS;
    return DOCUMENT_MERGE_FIELDS.filter((f) => groups.includes(f.group));
  }, [groups]);

  const grouped = useMemo(() => {
    const map = new Map<MergeFieldGroup, DocumentMergeField[]>();
    for (const field of fields) {
      const list = map.get(field.group) ?? [];
      list.push(field);
      map.set(field.group, list);
    }
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
      group: g,
      fields: map.get(g)!,
    }));
  }, [fields]);

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-slate-50/80 p-3", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Merge fields
      </p>
      <p className="mt-0.5 text-xs text-slate-500">Click to insert at cursor</p>
      <div className="mt-3 max-h-[min(24rem,50vh)] space-y-3 overflow-y-auto pr-1">
        {grouped.map(({ group, fields: groupFields }) => (
          <div key={group}>
            <p className="text-[10px] font-semibold text-slate-400">{group}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {groupFields.map((field) => (
                <button
                  key={field.key}
                  type="button"
                  title={field.description ?? field.key}
                  onClick={() => onInsert(mergeFieldToken(field.key))}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
                >
                  <Plus className="h-3 w-3 opacity-50" />
                  {field.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function insertAtCursor(
  value: string,
  token: string,
  selectionStart: number,
  selectionEnd: number,
): { next: string; cursor: number } {
  const next = value.slice(0, selectionStart) + token + value.slice(selectionEnd);
  const cursor = selectionStart + token.length;
  return { next, cursor };
}
