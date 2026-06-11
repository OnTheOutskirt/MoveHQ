export const IMPORT_DATASET_KINDS = [
  "organizations",
  "people",
  "moves",
  "job_days",
  "claims",
  "inventory",
] as const;

export type ImportDatasetKind = (typeof IMPORT_DATASET_KINDS)[number];

export type ImportFieldDef = {
  key: string;
  label: string;
  required?: boolean;
  description?: string;
  aliases?: string[];
  example?: string;
};

export type ImportRowIssue = {
  row: number;
  field?: string;
  message: string;
  severity: "error" | "warning";
};

export type ImportRowPreview<T extends Record<string, string> = Record<string, string>> = {
  row: number;
  data: T;
  issues: ImportRowIssue[];
};

export type ImportValidationResult<T extends Record<string, string> = Record<string, string>> = {
  validRows: ImportRowPreview<T>[];
  invalidRows: ImportRowPreview<T>[];
  warningRows: ImportRowPreview<T>[];
};

export type ImportCommitRowResult = {
  row: number;
  externalKey: string;
  status: "created" | "updated" | "skipped" | "failed";
  message?: string;
  entityId?: string;
};

export type ImportCommitResult = {
  dataset: ImportDatasetKind;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  rows: ImportCommitRowResult[];
};

export type MigrationBundle = {
  organizations?: ImportCommitResult;
  people?: ImportCommitResult;
  moves?: ImportCommitResult;
  job_days?: ImportCommitResult;
  claims?: ImportCommitResult;
  inventory?: ImportCommitResult;
};
