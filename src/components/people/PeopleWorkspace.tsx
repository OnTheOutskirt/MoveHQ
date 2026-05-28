"use client";

import { DirectoryModelNote } from "@/components/people/DirectoryModelNote";
import { OrganizationDetailSidebar } from "@/components/people/OrganizationDetailSidebar";
import { OrganizationsDirectory } from "@/components/people/OrganizationsDirectory";
import { PeopleDirectory } from "@/components/people/PeopleDirectory";
import { PersonDetailSidebar } from "@/components/people/PersonDetailSidebar";
import { TabBar } from "@/components/shared/TabBar";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { directoryCounts, getOrganizationById, getPersonById } from "@/lib/people/mock-data";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { pageMeta } from "@/lib/navigation/page-meta";
import type { OrganizationRecord, PersonRecord } from "@/lib/people/types";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const meta = pageMeta["/sales/directory"];

type DirectoryTab = "people" | "organizations";

const TABS = [
  { id: "people" as const, label: "Contacts" },
  { id: "organizations" as const, label: "Organizations" },
];

export function PeopleWorkspace() {
  const searchParams = useSearchParams();
  const [tab, setTab] = usePersistedState<DirectoryTab>("jm-tab-/sales/directory", "people");
  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationRecord | null>(null);
  const counts = directoryCounts();

  useEffect(() => {
    const personId = searchParams.get("person");
    const orgId = searchParams.get("org");
    if (personId) {
      const person = getPersonById(personId);
      if (person) {
        setTab("people");
        setSelectedPerson(person);
        setSelectedOrg(null);
      }
    } else if (orgId) {
      const org = getOrganizationById(orgId);
      if (org) {
        setTab("organizations");
        setSelectedOrg(org);
        setSelectedPerson(null);
      }
    }
  }, [searchParams]);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={meta.title}
          description={meta.description}
          actions={
            <Button type="button" size="sm" disabled title="Coming soon">
              <Plus className="h-4 w-4" />
              {tab === "people" ? "Add person" : "Add organization"}
            </Button>
          }
        />

        <div className="flex flex-wrap gap-4 text-center">
          <CountCard label="Contacts" value={counts.people} />
          <CountCard label="Organizations" value={counts.organizations} />
          <CountCard label="Customers" value={counts.customers} muted />
          <CountCard label="Leads" value={counts.leads} muted />
          <CountCard label="Referral contacts" value={counts.referrals} muted />
        </div>

        <DirectoryModelNote />

        <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />

        {tab === "people" ? (
          <PeopleDirectory
            onSelectPerson={(p) => {
              setSelectedOrg(null);
              setSelectedPerson(p);
            }}
          />
        ) : (
          <OrganizationsDirectory
            onSelectOrganization={(o) => {
              setSelectedPerson(null);
              setSelectedOrg(o);
            }}
          />
        )}
      </div>

      <PersonDetailSidebar
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />

      <OrganizationDetailSidebar
        organization={selectedOrg}
        onClose={() => setSelectedOrg(null)}
        onSelectPerson={(personId) => {
          const person = getPersonById(personId);
          if (person) {
            setSelectedOrg(null);
            setSelectedPerson(person);
            setTab("people");
          }
        }}
      />
    </>
  );
}

function CountCard({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div
      className={
        muted
          ? "rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-2"
          : "rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm"
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xl font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
