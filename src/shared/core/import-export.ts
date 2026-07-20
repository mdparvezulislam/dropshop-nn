import type { ExportOptions, ImportResult } from "./types";

export interface ExportEngineContract {
  export<T>(data: T[], options: ExportOptions): Promise<Blob | string>;
  exportCsv<T>(data: T[], columns?: string[]): Promise<string>;
  exportJson<T>(data: T[]): Promise<string>;
}

export interface ImportEngineContract {
  import<T>(
    file: File | Buffer,
    format: "csv" | "json",
    validateRow: (row: Record<string, unknown>, index: number) => string | null,
  ): Promise<ImportResult>;
  importCsv<T>(
    content: string,
    validateRow: (row: Record<string, unknown>, index: number) => string | null,
  ): Promise<ImportResult>;
  importJson<T>(
    content: string,
    validateRow: (item: Record<string, unknown>, index: number) => string | null,
  ): Promise<ImportResult>;
  validateTemplate(
    file: File | Buffer,
    expectedColumns: string[],
  ): Promise<{ valid: boolean; errors: string[] }>;
}

export function generateCsv<T extends Record<string, unknown>>(
  data: T[],
  columns?: (keyof T)[],
): string {
  const cols = columns ?? ((data.length > 0 ? Object.keys(data[0]) : []) as (keyof T)[]);

  const header = cols.map((col) => escapeCsvField(String(col))).join(",");
  const rows = data.map((row) =>
    cols.map((col) => escapeCsvField(String(row[col] ?? ""))).join(","),
  );

  return [header, ...rows].join("\n");
}

export function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });

  return rows;
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}
