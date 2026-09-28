import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { UsageError, resolveDataset } from "./datasets";
import type { ExportJob } from "./export";
import { resolveFormat } from "./formats";

export const CONFIG_FILE = "localedb.config.json";

export interface Config {
  exports: ExportJob[];
}

export function readConfig(path: string): Config {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf-8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new UsageError(`No ${CONFIG_FILE} found at ${path}. Run \`localedb init\` to create one.`);
    }
    throw new UsageError(`Could not read ${path}: ${(error as Error).message}`);
  }
  return parseConfig(raw, path);
}

export function parseConfig(raw: unknown, source = CONFIG_FILE): Config {
  const fail = (message: string): never => {
    throw new UsageError(`${source}: ${message}`);
  };
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as Config).exports)) {
    fail(`expected an object with an "exports" array.`);
  }
  const exports = (raw as { exports: unknown[] }).exports.map((item, i): ExportJob => {
    const at = `exports[${i}]`;
    if (!item || typeof item !== "object") return fail(`${at} must be an object.`);
    const job = item as Record<string, unknown>;
    const codes = job.codes;
    if (codes !== "all" && !(Array.isArray(codes) && codes.every((c) => typeof c === "string"))) {
      fail(`${at}.codes must be "all" or an array of codes.`);
    }
    const fields = job.fields;
    if (
      fields !== undefined &&
      fields !== "default" &&
      fields !== "all" &&
      !(Array.isArray(fields) && fields.every((f) => typeof f === "string"))
    ) {
      fail(`${at}.fields must be "default", "all" or an array of field paths.`);
    }
    if (typeof job.out !== "string" || !job.out) fail(`${at}.out must be a file or directory path.`);
    return {
      dataset: resolveDataset(job.dataset as string),
      codes: codes as ExportJob["codes"],
      fields: fields as ExportJob["fields"],
      format: resolveFormat(job.format as string | undefined),
      out: job.out as string,
      split: job.split === true,
    };
  });
  return { exports };
}

export function writeConfig(path: string, config: Config): void {
  writeFileSync(resolve(path), `${JSON.stringify(config, null, 2)}\n`);
}
