import { rowToRecord } from "./csv";
import { REFERRAL_PARTNER_TYPES } from "@/lib/people/types";
import { IMPORT_FIELD_SCHEMAS } from "./schemas";
import type {
  ImportDatasetKind,
  ImportRowIssue,
  ImportRowPreview,
  ImportValidationResult,
} from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function issue(
  row: number,
  message: string,
  field?: string,
  severity: ImportRowIssue["severity"] = "error",
): ImportRowIssue {
  return { row, field, message, severity };
}

function parseEnum<T extends string>(value: string, allowed: readonly T[], field: string, row: number): ImportRowIssue[] {
  if (!value.trim()) return [];
  const v = value.trim().toLowerCase().replace(/\s+/g, "_") as T;
  if (!allowed.includes(v)) {
    return [issue(row, `Invalid ${field}: "${value}". Allowed: ${allowed.join(", ")}`, field)];
  }
  return [];
}

function parseDate(value: string, field: string, row: number, required = false): ImportRowIssue[] {
  if (!value.trim()) {
    return required ? [issue(row, `${field} is required (YYYY-MM-DD)`, field)] : [];
  }
  if (!DATE_RE.test(value.trim())) {
    return [issue(row, `${field} must be YYYY-MM-DD`, field)];
  }
  return [];
}

function parseNumber(value: string, field: string, row: number, required = false): ImportRowIssue[] {
  if (!value.trim()) {
    return required ? [issue(row, `${field} is required`, field)] : [];
  }
  const n = Number(value.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(n)) {
    return [issue(row, `${field} must be a number`, field)];
  }
  return [];
}

export function validateMappedRows(
  kind: ImportDatasetKind,
  headers: string[],
  rows: string[][],
  mapping: Record<string, string | null>,
): ImportValidationResult {
  const schema = IMPORT_FIELD_SCHEMAS[kind];
  const validRows: ImportRowPreview[] = [];
  const invalidRows: ImportRowPreview[] = [];
  const warningRows: ImportRowPreview[] = [];

  const seenKeys = new Map<string, number>();

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const data = rowToRecord(headers, row, mapping) as Record<string, string>;
    const issues: ImportRowIssue[] = [];

    for (const field of schema) {
      if (field.required && !data[field.key]?.trim()) {
        issues.push(issue(rowNum, `${field.label} is required`, field.key));
      }
    }

    const externalKey = externalKeyForRow(kind, data);
    if (externalKey) {
      const prev = seenKeys.get(externalKey);
      if (prev != null) {
        issues.push(
          issue(rowNum, `Duplicate ${externalKeyLabel(kind)} "${externalKey}" (also on row ${prev})`, externalKeyField(kind)),
        );
      } else {
        seenKeys.set(externalKey, rowNum);
      }
    }

    switch (kind) {
      case "organizations":
        issues.push(
          ...parseEnum(data.org_type, [
            "realtor",
            "storage_facility",
            "developer",
            "restoration_company",
            "senior_living",
            "commercial",
            "vendor",
            "other",
          ] as const, "org_type", rowNum),
        );
        break;
      case "people":
        issues.push(
          ...parseEnum(data.kind, ["customer", "lead", "referral", "vendor", "other"] as const, "kind", rowNum),
        );
        if (data.kind === "referral" && data.referral_type.trim()) {
          issues.push(
            ...parseEnum(
              data.referral_type,
              REFERRAL_PARTNER_TYPES,
              "referral_type",
              rowNum,
            ),
          );
        }
        break;
      case "moves":
        issues.push(...parseDate(data.preferred_date, "preferred_date", rowNum));
        issues.push(...parseDate(data.lost_at, "lost_at", rowNum));
        if (data.quote_amount.trim()) issues.push(...parseNumber(data.quote_amount, "quote_amount", rowNum));
        if (data.pipeline_stage.trim()) {
          issues.push(
            ...parseEnum(
              data.pipeline_stage,
              ["new_lead", "waiting", "quote_sent", "needs_contract", "booked", "completed"] as const,
              "pipeline_stage",
              rowNum,
            ),
          );
        }
        break;
      case "job_days":
        issues.push(...parseDate(data.date, "date", rowNum, true));
        if (data.status.trim()) {
          issues.push(
            ...parseEnum(
              data.status,
              ["proposed", "scheduled", "in_progress", "completed", "cancelled"] as const,
              "status",
              rowNum,
            ),
          );
        }
        break;
      case "claims":
        issues.push(...parseDate(data.reported_date, "reported_date", rowNum, true));
        issues.push(...parseDate(data.resolved_at, "resolved_at", rowNum));
        issues.push(
          ...parseEnum(data.category, ["damage", "lost_item", "other"] as const, "category", rowNum),
        );
        if (data.amount_claimed.trim()) issues.push(...parseNumber(data.amount_claimed, "amount_claimed", rowNum));
        break;
      case "inventory":
        issues.push(...parseNumber(data.quantity_on_hand, "quantity_on_hand", rowNum, true));
        if (data.reorder_point.trim()) issues.push(...parseNumber(data.reorder_point, "reorder_point", rowNum));
        break;
      default:
        break;
    }

    const preview: ImportRowPreview = { row: rowNum, data, issues };
    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warning");

    if (errors.length > 0) {
      invalidRows.push(preview);
    } else if (warnings.length > 0) {
      warningRows.push(preview);
      validRows.push(preview);
    } else {
      validRows.push(preview);
    }
  });

  return { validRows, invalidRows, warningRows };
}

function externalKeyField(kind: ImportDatasetKind): string {
  switch (kind) {
    case "organizations":
    case "people":
      return "external_id";
    case "moves":
      return "move_reference";
    case "job_days":
      return "move_reference+date";
    case "claims":
      return "claim_reference";
    case "inventory":
      return "catalog_id";
    default:
      return "id";
  }
}

function externalKeyLabel(kind: ImportDatasetKind): string {
  return externalKeyField(kind);
}

function externalKeyForRow(kind: ImportDatasetKind, data: Record<string, string>): string {
  switch (kind) {
    case "organizations":
    case "people":
      return data.external_id?.trim() ?? "";
    case "moves":
      return data.move_reference?.trim() ?? "";
    case "job_days":
      return `${data.move_reference?.trim() ?? ""}|${data.date?.trim() ?? ""}|${data.day_label?.trim() ?? ""}`;
    case "claims":
      return (
        data.claim_reference?.trim() ||
        `${data.move_reference?.trim()}-${data.title?.trim()}`
      );
    case "inventory":
      return data.catalog_id?.trim() ?? "";
    default:
      return "";
  }
}
