"use client";

import { CrewAppRoleMultiSwitcher } from "@/components/crew-app/CrewAppRoleMultiSwitcher";
import { CrewRoleSwitcher } from "@/components/crew-app/CrewRoleSwitcher";
import { crewAppPath } from "@/lib/crew-app/crew-path";
import {
  parseAppRolesFromParams,
  parseJobRoleFromParams,
  PREVIEW_CREW_MEMBER,
} from "@/lib/crew-app/session";
import type { CrewAppRole } from "@/lib/crew-app/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CrewPhoneFrameDemoControlsProps = {
  className?: string;
};

/** Role switchers for full-screen phone preview (demo query params). */
export function CrewPhoneFrameDemoControls({ className }: CrewPhoneFrameDemoControlsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const demoCrewId = searchParams.get("demoCrewId");
  if (!demoCrewId || demoCrewId !== PREVIEW_CREW_MEMBER.id) return null;

  const jobRole = parseJobRoleFromParams(searchParams, "skipper");
  const appRoles = parseAppRolesFromParams(searchParams, "skipper");

  function replaceDemoParams(next: { jobRole?: CrewAppRole; appRoles?: CrewAppRole[] }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("demoCrewId", PREVIEW_CREW_MEMBER.id);
    params.set("demoJobRole", next.jobRole ?? jobRole);
    params.set("demoAppRoles", (next.appRoles ?? appRoles).join(","));
    params.delete("demoRole");
    if (!params.get("phoneFrame")) params.set("phoneFrame", "1");
    router.replace(crewAppPath(pathname, params));
  }

  return (
    <div className={className}>
      <CrewRoleSwitcher
        label="Preview role for job"
        role={jobRole}
        onRoleChange={(next) => replaceDemoParams({ jobRole: next })}
        variant="dark"
      />
      <CrewAppRoleMultiSwitcher
        label="Preview roles for app"
        roles={appRoles}
        onRolesChange={(next) => replaceDemoParams({ appRoles: next })}
        variant="dark"
        className="mt-5"
      />
    </div>
  );
}
