"use client";

import { useClaims } from "@/components/providers/ClaimsProvider";
import { useInventory } from "@/components/providers/InventoryProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  autoMapHeaders,
  downloadTextFile,
  formatCsvTable,
  parseCsv,
} from "@/lib/import/csv";
import {
  commitClaims,
  commitInventoryRows,
  commitJobDays,
  commitMoves,
  commitOrganizations,
  commitPeople,
} from "@/lib/import/commit";
import {
  IMPORT_DATASET_HINTS,
  IMPORT_DATASET_LABELS,
  IMPORT_DATASET_ORDER,
  IMPORT_FIELD_SCHEMAS,
  templateFilename,
} from "@/lib/import/schemas";
import { downloadImportTemplate } from "@/lib/import/templates";
import type { ImportCommitResult, ImportDatasetKind, ImportValidationResult } from "@/lib/import/types";
import { validateMappedRows } from "@/lib/import/validate";
import { pageMeta } from "@/lib/navigation/page-meta";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileUp,
  Upload,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const meta = pageMeta["/admin/import"];

type Step = "upload" | "map" | "review" | "done";

export function DataImportWorkspace() {
  const [dataset, setDataset] = useState<ImportDatasetKind>("organizations");
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [commitResult, setCommitResult] = useState<ImportCommitResult | null>(null);

  const { moves, importMoves } = useMoves();
  const { claims, importClaims } = useClaims();
  const { adjust } = useInventory();
  const { config, locationIdForNewRecords } = useWorkspace();

  const schema = IMPORT_FIELD_SCHEMAS[dataset];

  const reset = useCallback(() => {
    setStep("upload");
    setFileName(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setValidation(null);
    setCommitResult(null);
  }, []);

  const onDatasetChange = (next: ImportDatasetKind) => {
    setDataset(next);
    reset();
  };

  const onFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        const table = parseCsv(text);
        const auto = autoMapHeaders(table.headers, schema);
        setFileName(file.name);
        setHeaders(table.headers);
        setRows(table.rows);
        setMapping(auto);
        setValidation(null);
        setCommitResult(null);
        setStep(table.headers.length > 0 ? "map" : "upload");
      };
      reader.readAsText(file);
    },
    [schema],
  );

  const runValidation = useCallback(() => {
    const result = validateMappedRows(dataset, headers, rows, mapping);
    setValidation(result);
    setStep("review");
  }, [dataset, headers, rows, mapping]);

  const runImport = useCallback(() => {
    if (!validation) return;
    const ctx = {
      existingMoves: moves,
      existingClaims: claims,
      companyId: config.company.id,
      defaultLocationId: locationIdForNewRecords(),
    };

    let result: ImportCommitResult;

    switch (dataset) {
      case "organizations":
        result = commitOrganizations(validation.validRows, ctx);
        break;
      case "people":
        result = commitPeople(validation.validRows, ctx);
        break;
      case "moves": {
        const { result: moveResult, moves: merged } = commitMoves(validation.validRows, ctx);
        importMoves(merged);
        result = moveResult;
        break;
      }
      case "job_days": {
        const { result: dayResult, moves: merged } = commitJobDays(validation.validRows, moves);
        importMoves(merged);
        result = dayResult;
        break;
      }
      case "claims": {
        const { result: claimResult, claims: merged } = commitClaims(validation.validRows, ctx);
        importClaims(merged);
        result = claimResult;
        break;
      }
      case "inventory": {
        const { result: invResult, lines } = commitInventoryRows(validation.validRows);
        for (const line of lines) {
          adjust({
            catalogId: line.catalogId,
            kind: "count",
            amount: line.quantityOnHand,
            note: line.note ?? `Opening count from CSV import`,
          });
        }
        result = invResult;
        break;
      }
      default:
        return;
    }

    setCommitResult(result);
    setStep("done");
  }, [
    validation,
    dataset,
    moves,
    claims,
    config.company.id,
    locationIdForNewRecords,
    importMoves,
    importClaims,
    adjust,
  ]);

  const downloadErrors = useCallback(() => {
    if (!validation) return;
    const failed = [...validation.invalidRows, ...validation.warningRows];
    const errorHeaders = ["row", "field", "severity", "message", ...schema.map((f) => f.key)];
    const errorRows = failed.flatMap((preview) => {
      if (preview.issues.length === 0) {
        return [[preview.row, "", "error", "Invalid row", ...schema.map((f) => preview.data[f.key] ?? "")]];
      }
      return preview.issues.map((issue) => [
        preview.row,
        issue.field ?? "",
        issue.severity,
        issue.message,
        ...schema.map((f) => preview.data[f.key] ?? ""),
      ]);
    });
    downloadTextFile(
      `movehq-import-${dataset}-errors.csv`,
      formatCsvTable(errorHeaders, errorRows),
    );
  }, [validation, dataset, schema]);

  const previewRows = useMemo(() => validation?.validRows.slice(0, 5) ?? [], [validation]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={meta.title} description={meta.description} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => downloadImportTemplate(dataset)}>
            <Download className="h-4 w-4" />
            Download template
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-4 text-sm text-slate-700">
        <p className="font-medium text-brand-900">Recommended import order</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs sm:text-sm">
          {IMPORT_DATASET_ORDER.map((kind) => (
            <li key={kind}>
              <span className="font-medium">{IMPORT_DATASET_LABELS[kind]}</span>
              <span className="text-slate-600"> — {IMPORT_DATASET_HINTS[kind]}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-slate-600">
          Re-uploading updates existing rows matched by external ID or move reference. Rows with errors
          are skipped — fix the CSV and import again.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <nav className="space-y-1">
          {IMPORT_DATASET_ORDER.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onDatasetChange(kind)}
              className={cn(
                "flex w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                dataset === kind
                  ? "bg-brand-100 text-brand-900"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {IMPORT_DATASET_LABELS[kind]}
            </button>
          ))}
        </nav>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StepBadge active={step === "upload"} done={step !== "upload"} label="1. Upload" />
            <StepBadge active={step === "map"} done={step === "review" || step === "done"} label="2. Map columns" />
            <StepBadge active={step === "review"} done={step === "done"} label="3. Review" />
            <StepBadge active={step === "done"} done={false} label="4. Results" />
          </div>

          <p className="mt-4 text-sm text-slate-600">{IMPORT_DATASET_HINTS[dataset]}</p>

          {step === "upload" ? (
            <UploadStep
              dataset={dataset}
              onFile={onFile}
              templateName={templateFilename(dataset)}
            />
          ) : null}

          {step === "map" ? (
            <MapStep
              schema={schema}
              headers={headers}
              mapping={mapping}
              fileName={fileName}
              rowCount={rows.length}
              onMappingChange={setMapping}
              onBack={reset}
              onNext={runValidation}
            />
          ) : null}

          {step === "review" && validation ? (
            <ReviewStep
              validation={validation}
              previewRows={previewRows}
              schema={schema}
              onBack={() => setStep("map")}
              onImport={runImport}
              onDownloadErrors={downloadErrors}
            />
          ) : null}

          {step === "done" && commitResult ? (
            <DoneStep result={commitResult} onImportAnother={reset} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StepBadge({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <Badge
      className={cn(
        "text-xs",
        active && "bg-brand-600 text-white",
        !active && done && "bg-emerald-100 text-emerald-900",
        !active && !done && "bg-slate-100 text-slate-500",
      )}
    >
      {label}
    </Badge>
  );
}

function UploadStep({
  dataset,
  onFile,
  templateName,
}: {
  dataset: ImportDatasetKind;
  onFile: (file: File) => void;
  templateName: string;
}) {
  return (
    <div className="mt-6">
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300",
          "bg-slate-50/50 px-6 py-12 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/30",
        )}
      >
        <Upload className="h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-800">Upload {IMPORT_DATASET_LABELS[dataset]} CSV</p>
        <p className="mt-1 text-xs text-slate-500">Use the template: {templateName}</p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function MapStep({
  schema,
  headers,
  mapping,
  fileName,
  rowCount,
  onMappingChange,
  onBack,
  onNext,
}: {
  schema: (typeof IMPORT_FIELD_SCHEMAS)[ImportDatasetKind];
  headers: string[];
  mapping: Record<string, string | null>;
  fileName: string | null;
  rowCount: number;
  onMappingChange: (m: Record<string, string | null>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const missingRequired = schema.filter((f) => f.required && !mapping[f.key]);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <FileUp className="h-4 w-4" />
        <span className="font-medium text-slate-800">{fileName}</span>
        <span>· {rowCount} data rows</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Field</th>
              <th className="px-3 py-2">CSV column</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schema.map((field) => (
              <tr key={field.key}>
                <td className="px-3 py-2 align-top">
                  <p className="font-medium text-slate-900">
                    {field.label}
                    {field.required ? <span className="text-red-600"> *</span> : null}
                  </p>
                  {field.description ? (
                    <p className="mt-0.5 text-xs text-slate-500">{field.description}</p>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  <select
                    value={mapping[field.key] ?? ""}
                    onChange={(e) =>
                      onMappingChange({
                        ...mapping,
                        [field.key]: e.target.value || null,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  >
                    <option value="">— Not mapped —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {missingRequired.length > 0 ? (
        <p className="text-sm text-amber-800">
          Map required fields before continuing: {missingRequired.map((f) => f.label).join(", ")}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={missingRequired.length > 0}>
          Validate & preview
        </Button>
      </div>
    </div>
  );
}

function ReviewStep({
  validation,
  previewRows,
  schema,
  onBack,
  onImport,
  onDownloadErrors,
}: {
  validation: ImportValidationResult;
  previewRows: ImportValidationResult["validRows"];
  schema: (typeof IMPORT_FIELD_SCHEMAS)[ImportDatasetKind];
  onBack: () => void;
  onImport: () => void;
  onDownloadErrors: () => void;
}) {
  const total = validation.validRows.length + validation.invalidRows.length;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Ready to import"
          value={validation.validRows.length}
          tone="success"
          icon={CheckCircle2}
        />
        <StatCard
          label="Errors (skipped)"
          value={validation.invalidRows.length}
          tone={validation.invalidRows.length > 0 ? "danger" : "neutral"}
          icon={XCircle}
        />
        <StatCard label="Total rows" value={total} tone="neutral" icon={FileUp} />
      </div>

      {validation.invalidRows.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-red-900">
              {validation.invalidRows.length} row(s) have errors and will not be imported
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={onDownloadErrors}>
              Download error report
            </Button>
          </div>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-red-800">
            {validation.invalidRows.slice(0, 20).map((row) => (
              <li key={row.row}>
                Row {row.row}: {row.issues.map((i) => i.message).join("; ")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {previewRows.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
          <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  {schema.slice(0, 6).map((f) => (
                    <th key={f.key} className="px-2 py-1.5">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((row) => (
                  <tr key={row.row}>
                    {schema.slice(0, 6).map((f) => (
                      <td key={f.key} className="max-w-[10rem] truncate px-2 py-1.5 text-slate-800">
                        {row.data[f.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onImport} disabled={validation.validRows.length === 0}>
          Import {validation.validRows.length} row{validation.validRows.length === 1 ? "" : "s"}
        </Button>
      </div>
    </div>
  );
}

function DoneStep({
  result,
  onImportAnother,
}: {
  result: ImportCommitResult;
  onImportAnother: () => void;
}) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 text-emerald-800">
        <CheckCircle2 className="h-5 w-5" />
        <p className="font-medium">Import complete</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Created" value={result.created} tone="success" icon={CheckCircle2} />
        <StatCard label="Updated" value={result.updated} tone="neutral" icon={FileUp} />
        <StatCard label="Failed" value={result.failed} tone={result.failed > 0 ? "danger" : "neutral"} icon={XCircle} />
        <StatCard label="Skipped" value={result.skipped} tone="neutral" icon={AlertCircle} />
      </div>
      {result.failed > 0 ? (
        <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          {result.rows
            .filter((r) => r.status === "failed")
            .map((r) => (
              <li key={`${r.row}-${r.externalKey}`}>
                Row {r.row} ({r.externalKey}): {r.message}
              </li>
            ))}
        </ul>
      ) : null}
      <Button type="button" onClick={onImportAnother}>
        Import another file
      </Button>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        tone === "success" && "border-emerald-200 bg-emerald-50/50",
        tone === "danger" && "border-red-200 bg-red-50/50",
        tone === "neutral" && "border-slate-200 bg-slate-50/50",
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-0.5 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
