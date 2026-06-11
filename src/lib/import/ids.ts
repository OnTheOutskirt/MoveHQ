/** Stable IDs for imported records — prefix keeps them distinct from mock seeds. */

export function importOrgId(externalId: string): string {
  return `imp-org-${slugify(externalId)}`;
}

export function importPersonId(externalId: string): string {
  return `imp-person-${slugify(externalId)}`;
}

export function importMoveId(reference: string): string {
  return `imp-mv-${slugify(reference)}`;
}

export function importJobDayId(moveReference: string, index: number): string {
  return `imp-jd-${slugify(moveReference)}-${index}`;
}

export function importClaimId(reference: string): string {
  return `imp-clm-${slugify(reference)}`;
}

export function normalizeImportKey(value: string): string {
  return slugify(value);
}

function slugify(value: string): string {
  const s = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || `row-${Date.now()}`;
}
