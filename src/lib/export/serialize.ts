import AdmZip from "adm-zip";

export { pickFields } from "./pick";
export { toCsv } from "./csv";

export type ExportFormat = "json" | "json-min" | "csv" | "zip";

export interface SerializedFile {
  filename: string;
  mimeType: string;
  body: Buffer | string;
}

export function toJson(records: Record<string, unknown>[], pretty = true): string {
  return pretty ? JSON.stringify(records, null, 2) : JSON.stringify(records);
}

export function toZip(
  files: { name: string; content: string }[]
): Buffer {
  const zip = new AdmZip();
  for (const f of files) {
    zip.addFile(f.name, Buffer.from(f.content, "utf-8"));
  }
  return zip.toBuffer();
}

export function getFilename(dataset: string, format: ExportFormat): string {
  const stamp = new Date().toISOString().slice(0, 10);
  switch (format) {
    case "json":
    case "json-min":
      return `localedb-${dataset}-${stamp}.json`;
    case "csv":
      return `localedb-${dataset}-${stamp}.csv`;
    case "zip":
      return `localedb-${dataset}-${stamp}.zip`;
  }
}

export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case "json":
    case "json-min":
      return "application/json";
    case "csv":
      return "text/csv";
    case "zip":
      return "application/zip";
  }
}
