"use client";

import { useState } from "react";
import { useMoves } from "@/components/moves/MovesProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { linkedPersonRoleConfig, linkedPersonRoleLabel } from "@/lib/moves/linked-people";
import {
  CHANNEL_TO_ROLES,
  directoryPeopleForReferralChannel,
  isReferralLeadChannel,
  leadSourceLabel,
  linkedPersonFromDirectory,
  referralContactForLeadSource,
  referralPartnerLabel,
} from "@/lib/moves/lead-referral";
import type { MoveLinkedPerson, MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Mail, Phone, User, X } from "lucide-react";
import Link from "next/link";

type MoveDetailLeadSourcePanelProps = {
  move: MoveRecord;
};

function ReferralContactCard({
  person,
  onRemove,
}: {
  person: MoveLinkedPerson;
  onRemove: () => void;
}) {
  const roleStyle = linkedPersonRoleConfig[person.role];

  const body = (
    <>
      <div className="flex flex-wrap items-start gap-2 pr-6">
        {person.personId ? (
          <Link
            href={`/people?person=${person.personId}`}
            className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 hover:text-brand-700"
            onClick={(e) => e.stopPropagation()}
          >
            {person.name}
          </Link>
        ) : (
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{person.name}</p>
        )}
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            roleStyle.badge,
          )}
        >
          {linkedPersonRoleLabel(person.role)}
        </span>
      </div>
      {person.organization ? (
        <p className="truncate text-xs text-slate-500">{person.organization}</p>
      ) : null}
      {person.phone ? (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-700">
          <Phone className="h-3 w-3 shrink-0 text-slate-400" />
          <a href={`tel:${person.phone}`} onClick={(e) => e.stopPropagation()} className="text-brand-600 hover:underline">
            {person.phone}
          </a>
        </p>
      ) : null}
      {person.email ? (
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-700">
          <Mail className="h-3 w-3 shrink-0 text-slate-400" />
          <a
            href={`mailto:${person.email}`}
            onClick={(e) => e.stopPropagation()}
            className="truncate text-brand-600 hover:underline"
          >
            {person.email}
          </a>
        </p>
      ) : null}
    </>
  );

  return (
    <div className="relative mt-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 rounded-md p-1 text-slate-400 hover:bg-white hover:text-red-600"
        aria-label="Remove referral contact"
      >
        <X className="h-4 w-4" />
      </button>
      {body}
    </div>
  );
}

export function MoveDetailLeadSourcePanel({ move }: MoveDetailLeadSourcePanelProps) {
  const { setReferralContact, clearReferralContact } = useMoves();
  const isReferral = isReferralLeadChannel(move.leadChannel);
  const referralContact = isReferral ? referralContactForLeadSource(move) : undefined;
  const roles = CHANNEL_TO_ROLES[move.leadChannel] ?? [];
  const primaryRole = roles[0] ?? "referral_partner";
  const directoryOptions = isReferral
    ? directoryPeopleForReferralChannel(move.leadChannel).filter(
        (p) =>
          referralContact?.personId === p.id ||
          !move.linkedPeople.some((r) => roles.includes(r.role) && r.personId === p.id),
      )
    : [];

  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newOrg, setNewOrg] = useState("");

  function closePicker() {
    setPickerOpen(false);
    setCreating(false);
    setSelectedPersonId("");
  }

  function linkDirectoryPerson() {
    if (!selectedPersonId) return;
    const person = directoryOptions.find((p) => p.id === selectedPersonId);
    if (!person) return;
    setReferralContact(move.id, linkedPersonFromDirectory(move.id, person, primaryRole));
    closePicker();
  }

  function saveNewReferralPerson() {
    const name = newName.trim();
    if (!name) return;
    setReferralContact(move.id, {
      id: `${move.id}-ref-${Date.now()}`,
      name,
      role: primaryRole,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      organization: newOrg.trim() || undefined,
    });
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewOrg("");
    closePicker();
  }

  const partner = referralPartnerLabel(move.leadChannel);

  return (
    <div className="min-w-0 shrink-0 border-b border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lead source</p>

      <div
        className="mt-2 inline-flex min-w-0 max-w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-medium leading-tight text-slate-800"
        title={leadSourceLabel(move.leadChannel)}
      >
        {leadSourceLabel(move.leadChannel)}
      </div>

      {isReferral ? (
        <div className="mt-2">
          {referralContact ? (
            <ReferralContactCard
              person={referralContact}
              onRemove={() => setConfirmRemove(true)}
            />
          ) : null}

          {!pickerOpen && !referralContact ? (
            <p className="mt-2 text-xs text-slate-500">
              Link the referring {partner} for this move.
            </p>
          ) : null}

          {!pickerOpen && !referralContact ? (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-[11px] font-medium text-slate-600 hover:border-brand-300 hover:text-brand-800"
            >
              <User className="h-3.5 w-3.5" />
              Link {partner}
            </button>
          ) : null}

          {pickerOpen ? (
            <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-2.5">
              {!creating ? (
                <>
                  {directoryOptions.length > 0 ? (
                    <>
                      <label className="block">
                        <span className="text-[10px] font-semibold uppercase text-slate-500">
                          Select from directory
                        </span>
                        <select
                          value={selectedPersonId}
                          onChange={(e) => setSelectedPersonId(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                        >
                          <option value="">Choose a {partner}…</option>
                          {directoryOptions.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                              {p.title ? ` · ${p.title}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={linkDirectoryPerson}
                        disabled={!selectedPersonId}
                        className="w-full rounded-lg bg-brand-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        Link selected
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500">No matching contacts in the directory yet.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-2 text-[11px] font-medium text-slate-700 hover:border-brand-300"
                  >
                    <User className="h-3.5 w-3.5" />
                    Create new person
                  </button>
                  <button
                    type="button"
                    onClick={closePicker}
                    className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-semibold uppercase text-slate-500">New {partner}</p>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                  <input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                  {move.leadChannel === "referral_realtor" ? (
                    <input
                      value={newOrg}
                      onChange={(e) => setNewOrg(e.target.value)}
                      placeholder="Brokerage"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={saveNewReferralPerson}
                    disabled={!newName.trim()}
                    className="w-full rounded-lg bg-brand-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    Save &amp; link
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700"
                  >
                    Back
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {referralContact ? (
        <ConfirmDialog
          open={confirmRemove}
          onClose={() => setConfirmRemove(false)}
          onConfirm={() => clearReferralContact(move.id)}
          title="Remove referral contact?"
          description={`Are you sure you want to remove ${referralContact.name} as the referring ${partner}? You can link a new contact afterward.`}
          confirmLabel="Remove"
          variant="danger"
        />
      ) : null}
    </div>
  );
}
