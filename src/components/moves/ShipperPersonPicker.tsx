"use client";

import {
  getStoredPersonById,
  searchShipperPeople,
  type NewPersonInput,
} from "@/lib/people/people-storage";
import type { PersonRecord } from "@/lib/people/types";
import { cn } from "@/lib/utils";
import { User, UserPlus } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

export type ShipperPersonValue =
  | { mode: "existing"; personId: string }
  | { mode: "new"; draft: NewPersonInput }
  | null;

type ShipperPersonPickerProps = {
  value: ShipperPersonValue;
  onChange: (value: ShipperPersonValue) => void;
  /** Fired when the user begins entering shipper details (search, selection, or new person). */
  onActivity?: () => void;
};

type PickerMode = "search" | "new";

export function ShipperPersonPicker({ value, onChange, onActivity }: ShipperPersonPickerProps) {
  const [mode, setMode] = useState<PickerMode>("search");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const listId = useId();

  const selectedPerson = useMemo(() => {
    if (value?.mode !== "existing") return undefined;
    return getStoredPersonById(value.personId);
  }, [value]);

  const matches = useMemo(() => searchShipperPeople(query), [query]);

  useEffect(() => {
    if (value?.mode === "existing") {
      setMode("search");
      setQuery(selectedPerson?.name ?? "");
      setNewName("");
      setNewPhone("");
      setNewEmail("");
    } else if (value?.mode === "new") {
      setMode("new");
      setNewName(value.draft.name);
      setNewPhone(value.draft.phone ?? "");
      setNewEmail(value.draft.email ?? "");
      setQuery("");
    } else {
      setMode("search");
      setQuery("");
      setNewName("");
      setNewPhone("");
      setNewEmail("");
    }
  }, [value, selectedPerson?.name]);

  function selectPerson(person: PersonRecord) {
    onActivity?.();
    setQuery(person.name);
    onChange({ mode: "existing", personId: person.id });
    setOpen(false);
  }

  function clearSelection() {
    setQuery("");
    onChange(null);
  }

  function switchToNew() {
    onActivity?.();
    setMode("new");
    setOpen(false);
    const name = query.trim() || newName.trim();
    setNewName(name);
    onChange({
      mode: "new",
      draft: {
        name,
        phone: newPhone,
        email: newEmail,
      },
    });
  }

  function switchToSearch() {
    setMode("search");
    onChange(null);
  }

  function updateNewDraft(patch: Partial<NewPersonInput>) {
    onActivity?.();
    const draft: NewPersonInput = {
      name: patch.name ?? newName,
      phone: patch.phone ?? newPhone,
      email: patch.email ?? newEmail,
    };
    onChange({ mode: "new", draft });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={switchToSearch}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition",
            mode === "search"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          <User className="h-3.5 w-3.5" />
          Search
        </button>
        <button
          type="button"
          onClick={switchToNew}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition",
            mode === "new"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add new
        </button>
      </div>

      {mode === "search" ? (
        <>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                if (e.target.value.trim()) onActivity?.();
                setQuery(e.target.value);
                onChange(null);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setOpen(false), 150);
              }}
              placeholder="Search by name, phone, or email…"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />

            {open ? (
              <div
                id={listId}
                role="listbox"
                className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
              >
                {matches.length === 0 ? (
                  <div className="px-3 py-2">
                    <p className="text-xs text-slate-500">
                      {query.trim()
                        ? "No one matches that search."
                        : "Start typing to search your directory."}
                    </p>
                    {query.trim() ? (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setNewName(query.trim());
                          switchToNew();
                        }}
                        className="mt-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
                      >
                        Add “{query.trim()}” as new person
                      </button>
                    ) : null}
                  </div>
                ) : (
                  matches.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      role="option"
                      aria-selected={value?.mode === "existing" && value.personId === person.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPerson(person)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-slate-50",
                        value?.mode === "existing" &&
                          value.personId === person.id &&
                          "bg-brand-50",
                      )}
                    >
                      <span className="text-sm font-medium text-slate-900">{person.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {[person.phone, person.email].filter(Boolean).join(" · ") || "No contact info"}
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>

          {selectedPerson ? (
            <div className="flex items-start justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{selectedPerson.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  {[selectedPerson.phone, selectedPerson.email].filter(Boolean).join(" · ") ||
                    "No contact info"}
                </p>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="shrink-0 text-[10px] font-semibold text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
            </div>
          ) : query.trim() ? (
            <button
              type="button"
              onClick={switchToNew}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Can&apos;t find them? Add new person
            </button>
          ) : null}
        </>
      ) : (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Name</span>
            <input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                updateNewDraft({ name: e.target.value });
              }}
              placeholder="Shipper name"
              className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Phone</span>
              <input
                value={newPhone}
                onChange={(e) => {
                  setNewPhone(e.target.value);
                  updateNewDraft({ phone: e.target.value });
                }}
                placeholder="Optional"
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Email</span>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  updateNewDraft({ email: e.target.value });
                }}
                placeholder="Optional"
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
              />
            </label>
          </div>
          <p className="text-[11px] text-slate-500">
            Saved to your people directory as a new lead when you create the move.
          </p>
        </div>
      )}
    </div>
  );
}

export function isShipperSelectionValid(value: ShipperPersonValue): boolean {
  if (!value) return false;
  if (value.mode === "existing") return Boolean(value.personId);
  return Boolean(value.draft.name.trim());
}
