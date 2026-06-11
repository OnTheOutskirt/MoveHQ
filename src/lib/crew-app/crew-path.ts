const PRESERVED_PARAMS = [
  "demoCrewId",
  "demoJobRole",
  "demoAppRoles",
  "demoRole",
  "embed",
  "phoneFrame",
] as const;

/** Keep admin preview / full-screen demo params on in-app navigation. */
export function crewAppPath(pathname: string, searchParams: URLSearchParams | null): string {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const key of PRESERVED_PARAMS) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
