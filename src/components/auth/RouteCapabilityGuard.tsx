"use client";

import { AccessDenied } from "@/components/auth/AccessDenied";
import { useCapabilities } from "@/lib/auth/use-capabilities";
import {
  fallbackPathForCapabilities,
  requiredCapabilityForPath,
} from "@/lib/auth/route-access";
import { ROUTES } from "@/lib/navigation/routes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type RouteCapabilityGuardProps = {
  children: ReactNode;
};

export function RouteCapabilityGuard({ children }: RouteCapabilityGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { can, capabilities } = useCapabilities();

  const hasSoftware = can("app.software");
  const hasCrewOnly = can("app.crew") && !hasSoftware;

  useEffect(() => {
    if (hasCrewOnly && pathname !== "/crew" && !pathname.startsWith("/crew/")) {
      router.replace("/crew");
    }
  }, [hasCrewOnly, pathname, router]);

  if (hasCrewOnly) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center text-sm text-slate-600">
        Crew accounts use the mobile crew app — redirecting…
      </div>
    );
  }

  if (!hasSoftware) {
    return (
      <AccessDenied
        title="Office app access required"
        description="Your account is not set up for the JM software dashboard."
        backHref={ROUTES.signIn}
        backLabel="Sign in"
      />
    );
  }

  const required = requiredCapabilityForPath(pathname);
  if (required && !can(required)) {
    const fallback = fallbackPathForCapabilities(can);
    return (
      <AccessDenied
        description={`Your role (${capabilities.size} capabilities) doesn't include access to this section.`}
        backHref={fallback}
        backLabel="Go to your home area"
      />
    );
  }

  return <>{children}</>;
}
