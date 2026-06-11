/** Minimal RFC-style CSV parse/format — no external deps. */

export type CsvTable = {
  headers: string[];
  rows: string[][];
};

export function parseCsv(text: string): CsvTable {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    if (row.length > 0 || field.length > 0) {
      pushField();
      rows.push(row);
      row = [];
    }
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      pushField();
      continue;
    }
    if (ch === "\r" && next === "\n") {
      pushRow();
      i += 1;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      pushRow();
      continue;
    }
    field += ch;
  }
  pushRow();

  const nonEmpty = rows.filter((r) => r.some((c) => c.trim().length > 0));
  if (nonEmpty.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = nonEmpty[0].map((h) => h.trim());
  const dataRows = nonEmpty.slice(1);
  return { headers, rows: dataRows };
}

export function formatCsvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function formatCsvTable(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [
    headers.map(formatCsvCell).join(","),
    ...rows.map((row) => row.map(formatCsvCell).join(",")),
  ];
  return lines.join("\n");
}

export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function autoMapHeaders(
  csvHeaders: string[],
  schemaFields: { key: string; aliases?: string[] }[],
): Record<string, string | null> {
  const normalizedCsv = new Map(
    csvHeaders.map((h) => [normalizeHeader(h), h] as const),
  );

  const mapping: Record<string, string | null> = {};
  for (const field of schemaFields) {
    const candidates = [field.key, ...(field.aliases ?? [])].map(normalizeHeader);
    const match = candidates.find((c) => normalizedCsv.has(c));
    mapping[field.key] = match ? (normalizedCsv.get(match) ?? null) : null;
  }
  return mapping;
}

export function rowToRecord(
  headers: string[],
  row: string[],
  mapping: Record<string, string | null>,
): Record<string, string> {
  const byHeader = new Map<string, string>();
  headers.forEach((h, i) => {
    byHeader.set(h, row[i] ?? "");
  });

  const record: Record<string, string> = {};
  for (const [fieldKey, csvHeader] of Object.entries(mapping)) {
    if (!csvHeader) {
      record[fieldKey] = "";
      continue;
    }
    record[fieldKey] = (byHeader.get(csvHeader) ?? "").trim();
  }
  return record;
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
