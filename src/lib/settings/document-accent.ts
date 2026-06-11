import type { DocumentTemplate } from "./document-template-types";

/** Resolve portal accent — template override or global branding fallback. */
export function resolveDocumentAccentColor(
  template: Pick<DocumentTemplate, "accentColor">,
  globalAccent: string,
): string {
  const custom = template.accentColor?.trim();
  if (custom && /^#[0-9A-Fa-f]{6}$/.test(custom)) return custom;
  return globalAccent;
}

export type DocumentPricingKind = "flat" | "hourly" | "unknown";

export function pricingKindFromVars(vars: Record<string, string>): DocumentPricingKind {
  const key = vars.pricing_type_key?.toLowerCase();
  if (key === "flat" || key === "hourly") return key;
  const label = vars.pricing_type?.toLowerCase() ?? "";
  if (label.includes("flat")) return "flat";
  if (label.includes("hourly")) return "hourly";
  return "unknown";
}
