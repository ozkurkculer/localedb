import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pickFields } from "@localedb/core";
import type { Context } from "./context";
import { UsageError, getRecord, listCodes, resolveFields, type DatasetKey } from "./datasets";
import { EXTENSIONS, serialize, type Entry, type Format } from "./formats";

export interface ExportJob {
  dataset: DatasetKey;
  /** Codes to export, or "all". */
  codes: string[] | "all";
  /** "default", "all", or a list of dot paths. */
  fields?: "default" | "all" | string[];
  format: Format;
  /** Output file, or directory when `split` is set. Omit to print to stdout. */
  out?: string;
  /** Write one file per record into `out`. */
  split?: boolean;
}

export interface PlannedFile {
  path: string;
  content: string;
}

export type ExportPlan = { kind: "stdout"; content: string } | { kind: "files"; files: PlannedFile[] };

/** Resolves records and renders the output without touching the file system. */
export function planExport(ctx: Context, job: ExportJob, baseDir = ctx.cwd): ExportPlan {
  const fieldSpec = Array.isArray(job.fields) ? job.fields.join(",") : job.fields;
  const fields = resolveFields(job.dataset, fieldSpec);
  const codes = job.codes === "all" ? listCodes(ctx.db, job.dataset) : job.codes;
  if (!codes.length) throw new UsageError(`No ${job.dataset} codes given. Pass codes or --all.`);

  const entries: Entry[] = [];
  const missing: string[] = [];
  const seen = new Set<string>();
  for (const code of codes) {
    const found = getRecord(ctx.db, job.dataset, code);
    if (!found) {
      missing.push(code);
      continue;
    }
    if (seen.has(found.code)) continue;
    seen.add(found.code);
    entries.push({ code: found.code, record: pickFields(found.record, fields) });
  }
  if (missing.length) throw new UsageError(`Not found in ${job.dataset}: ${missing.join(", ")}.`);

  const options = { dataset: job.dataset, dataVersion: ctx.db.getMeta().version };

  if (job.split) {
    if (!job.out) throw new UsageError("--split needs --out <directory>.");
    const dir = resolve(baseDir, job.out);
    return {
      kind: "files",
      files: entries.map((entry) => ({
        path: join(dir, `${entry.code}.${EXTENSIONS[job.format]}`),
        content: serialize([entry], job.format, options),
      })),
    };
  }

  const content = serialize(entries, job.format, options);
  if (!job.out) return { kind: "stdout", content };
  return { kind: "files", files: [{ path: resolve(baseDir, job.out), content }] };
}

export function writeFiles(ctx: Context, files: PlannedFile[]): void {
  for (const file of files) {
    mkdirSync(dirname(file.path), { recursive: true });
    writeFileSync(file.path, file.content);
    ctx.stderr.write(`  wrote ${relative(ctx.cwd, file.path) || file.path}\n`);
  }
}

/** Files whose content on disk differs from the plan (missing files count as stale). */
export function staleFiles(files: PlannedFile[]): PlannedFile[] {
  return files.filter((file) => {
    try {
      return readFileSync(file.path, "utf-8") !== file.content;
    } catch {
      return true;
    }
  });
}
