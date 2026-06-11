import { formatCsvTable } from "./csv";
import { IMPORT_FIELD_SCHEMAS, templateFilename } from "./schemas";
import type { ImportDatasetKind } from "./types";
import { downloadTextFile } from "./csv";

function exampleRow(kind: ImportDatasetKind): string[] {
  const fields = IMPORT_FIELD_SCHEMAS[kind];
  return fields.map((f) => f.example ?? "");
}

export function templateCsvContent(kind: ImportDatasetKind): string {
  const fields = IMPORT_FIELD_SCHEMAS[kind];
  const headers = fields.map((f) => f.key);
  return formatCsvTable(headers, [exampleRow(kind)]);
}

export function downloadImportTemplate(kind: ImportDatasetKind): void {
  downloadTextFile(templateFilename(kind), templateCsvContent(kind));
}

export function downloadAllImportTemplates(): void {
  const kinds: ImportDatasetKind[] = [
    "organizations",
    "people",
    "moves",
    "job_days",
    "claims",
    "inventory",
  ];
  for (const kind of kinds) {
    downloadImportTemplate(kind);
  }
}
