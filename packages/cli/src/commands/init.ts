import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as p from "@clack/prompts";
import { DATASET_SCHEMAS, collectDefaultPaths } from "@localedb/core";
import pc from "picocolors";
import { CONFIG_FILE, readConfig, writeConfig, type Config } from "../config";
import type { Context } from "../context";
import { DATASETS, UsageError, listCodes, type DatasetKey } from "../datasets";
import { EXTENSIONS, type Format } from "../formats";
import { sync } from "./sync";

function unwrap<T>(value: T): Exclude<T, symbol> {
  if (p.isCancel(value)) {
    p.cancel("Cancelled, nothing was written.");
    process.exit(130);
  }
  return value as Exclude<T, symbol>;
}

function codeOptions(ctx: Context, dataset: DatasetKey) {
  const { db } = ctx;
  switch (dataset) {
    case "countries":
      return db.listCountries().map((c) => ({ value: c.code, label: `${c.code}  ${c.name}`, hint: c.nativeName }));
    case "currencies":
      return db.listCurrencies().map((c) => ({ value: c.code, label: `${c.code}  ${c.name}`, hint: c.symbol }));
    case "languages":
      return db.listLanguages().map((l) => ({ value: l.code, label: `${l.code}  ${l.name}`, hint: l.nativeName }));
    case "airports":
      return db.listAirports().map((a) => ({ value: a.iata || a.icao, label: `${a.iata || a.icao}  ${a.name}`, hint: a.countryCode }));
  }
}

export async function init(ctx: Context, _positionals: string[], options: { config?: string }): Promise<number> {
  if (!ctx.interactive) {
    throw new UsageError(`init needs an interactive terminal. Write ${CONFIG_FILE} by hand or use \`localedb export\`.`);
  }
  const configPath = resolve(ctx.cwd, options.config ?? CONFIG_FILE);
  const existing: Config | undefined = existsSync(configPath) ? readConfig(configPath) : undefined;

  p.intro(pc.inverse(" localedb init "));

  const dataset = unwrap(
    await p.select<DatasetKey>({
      message: "Which dataset?",
      options: DATASETS.map((value) => ({ value, label: value })),
    })
  );

  const scope = unwrap(
    await p.select({
      message: `Which ${dataset}?`,
      options: [
        { value: "pick", label: "Let me pick" },
        { value: "all", label: `All ${listCodes(ctx.db, dataset).length}` },
      ],
    })
  );
  const codes =
    scope === "all"
      ? "all"
      : unwrap(
          await p.autocompleteMultiselect<string>({
            message: `Search and select ${dataset}`,
            options: codeOptions(ctx, dataset),
            required: true,
          })
        );

  const roots = DATASET_SCHEMAS[dataset].rootPaths;
  const fieldMode = unwrap(
    await p.select({
      message: "Which fields?",
      options: [
        { value: "default", label: "Recommended", hint: "same defaults as localedb.org/export" },
        { value: "all", label: "Everything" },
        { value: "custom", label: "Let me choose" },
      ],
    })
  );
  const defaults = new Set(collectDefaultPaths(roots).map((path) => path.split(".")[0]));
  const fields =
    fieldMode === "custom"
      ? unwrap(
          await p.multiselect<string>({
            message: "Select fields",
            options: roots.map((node) => ({ value: node.path, label: node.key })),
            initialValues: roots.filter((node) => defaults.has(node.path)).map((node) => node.path),
            required: true,
          })
        )
      : (fieldMode as "default" | "all");

  const format = unwrap(
    await p.select<Format>({
      message: "Output format?",
      options: [
        { value: "ts", label: "TypeScript", hint: "typed `as const` module" },
        { value: "json", label: "JSON" },
        { value: "json-min", label: "JSON (minified)" },
        { value: "csv", label: "CSV" },
      ],
    })
  );

  const out = unwrap(
    await p.text({
      message: "Where should it be written?",
      initialValue: `src/locales/${dataset}.${EXTENSIONS[format]}`,
      validate: (value) => (value?.trim() ? undefined : "Enter a file path"),
    })
  ).trim();

  const config: Config = { exports: [...(existing?.exports ?? []), { dataset, codes, fields, format, out }] };
  writeConfig(configPath, config);
  p.log.success(`${existing ? "Updated" : "Created"} ${CONFIG_FILE}`);

  const status = sync(ctx, [], { config: configPath });
  p.outro(`Done. Run ${pc.cyan("localedb sync")} after upgrading @localedb/cli to refresh the data.`);
  return status;
}
