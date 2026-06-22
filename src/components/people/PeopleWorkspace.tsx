"use client";

import { DirectoryModelNote } from "@/components/people/DirectoryModelNote";
import { MovingCompanyReferralsView } from "@/components/people/MovingCompanyReferralsView";
import { OrganizationDetailSidebar } from "@/components/people/OrganizationDetailSidebar";
import { OrganizationsDirectory } from "@/components/people/OrganizationsDirectory";
import { PeopleDirectory } from "@/components/people/PeopleDirectory";
import { PersonDetailSidebar } from "@/components/people/PersonDetailSidebar";
import { ReferralPartnersReport } from "@/components/reports/ReferralPartnersReport";
import { TabBar } from "@/components/shared/TabBar";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { getOrganizationById, getPersonById } from "@/lib/people/mock-data";
import {
  getStoredOrganizationById,
  listAllOrganizations,
} from "@/lib/people/organizations-storage";
import { getStoredPersonById, listAllPeople } from "@/lib/people/people-storage";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { pageMeta } from "@/lib/navigation/page-meta";
import type { OrganizationRecord, PersonRecord } from "@/lib/people/types";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const meta = pageMeta["/sales/directory"];

type DirectoryTab =
  | "people"
  | "organizations"
  | "referral-partners"
  | "moving-companies";

const TABS = [
  { id: "people" as const, label: "Contacts" },
  { id: "organizations" as const, label: "Organizations" },
  { id: "referral-partners" as const, label: "Referral partners" },
  { id: "moving-companies" as const, label: "Moving companies" },
];

const SIMPLE_TABS: DirectoryTab[] = ["people", "organizations"];

function isDirectoryTab(value: string | null): value is DirectoryTab {
  return TABS.some((t) => t.id === value);
}

export function PeopleWorkspace() {
  const searchParams = useSearchParams();
  const [tab, setTab] = usePersistedState<DirectoryTab>("jm-tab-/sales/directory", "people");
  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationRecord | null>(null);
  const counts = useMemo(
    () => ({
      people: listAllPeople().length,
      organizations: listAllOrganizations().length,
      customers: listAllPeople().filter((p) => p.kind === "customer").length,
      leads: listAllPeople().filter((p) => p.kind === "lead").length,
      referrals: listAllPeople().filter((p) => p.kind === "referral").length,
    }),
    [tab],
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (isDirectoryTab(tabParam)) {
      setTab(tabParam);
    }

    const personId = searchParams.get("person");
    const orgId = searchParams.get("org");
    if (personId) {
      const person = getStoredPersonById(personId) ?? getPersonById(personId);
      if (person) {
        setTab("people");
        setSelectedPerson(person);
        setSelectedOrg(null);
      }
    } else if (orgId) {
      const org = getStoredOrganizationById(orgId) ?? getOrganizationById(orgId);
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
            SIMPLE_TABS.includes(tab) ? (
              <Button type="button" size="sm" disabled title="Coming soon">
                <Plus className="h-4 w-4" />
                {tab === "people" ? "Add person" : "Add organization"}
              </Button>
            ) : undefined
          }
        />

        {SIMPLE_TABS.includes(tab) ? (
          <>
            <div className="flex flex-wrap gap-4 text-center">
              <CountCard label="Contacts" value={counts.people} />
              <CountCard label="Organizations" value={counts.organizations} />
              <CountCard label="Customers" value={counts.customers} muted />
              <CountCard label="Leads" value={counts.leads} muted />
              <CountCard label="Referral contacts" value={counts.referrals} muted />
            </div>

            <DirectoryModelNote />
          </>
        ) : null}

        <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />

        {tab === "people" ? (
          <PeopleDirectory
            onSelectPerson={(p) => {
              setSelectedOrg(null);
              setSelectedPerson(p);
            }}
          />
        ) : null}
        {tab === "organizations" ? (
          <OrganizationsDirectory
            onSelectOrganization={(o) => {
              setSelectedPerson(null);
              setSelectedOrg(o);
            }}
          />
        ) : null}
        {tab === "referral-partners" ? <ReferralPartnersReport /> : null}
        {tab === "moving-companies" ? <MovingCompanyReferralsView /> : null}
      </div>

      <PersonDetailSidebar
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />

      <OrganizationDetailSidebar
        organization={selectedOrg}
        onClose={() => setSelectedOrg(null)}
        onSelectPerson={(personId) => {
          const person = getStoredPersonById(personId) ?? getPersonById(personId);
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
