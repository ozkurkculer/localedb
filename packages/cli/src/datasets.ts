import {
  DATASET_SCHEMAS,
  collectAllPaths,
  collectDefaultPaths,
  type DatasetKey,
  type FieldNode,
  type LocaleDB,
} from "@localedb/core";

export type { DatasetKey };

export const DATASETS: readonly DatasetKey[] = ["countries", "currencies", "languages", "airports"];

const ALIASES: Record<string, DatasetKey> = {
  country: "countries",
  countries: "countries",
  currency: "currencies",
  currencies: "currencies",
  language: "languages",
  languages: "languages",
  airport: "airports",
  airports: "airports",
};

export class UsageError extends Error {}

export function resolveDataset(name: string | undefined): DatasetKey {
  const dataset = name && ALIASES[name.toLowerCase()];
  if (!dataset) {
    throw new UsageError(`Unknown dataset "${name ?? ""}". Use one of: ${DATASETS.join(", ")}.`);
  }
  return dataset;
}

export type DataRecord = Record<string, unknown>;

/** Looks up one record; returns the canonical code it is filed under (e.g. "tur" -> "TR"). */
export function getRecord(db: LocaleDB, dataset: DatasetKey, code: string): { code: string; record: DataRecord } | undefined {
  const record = (() => {
    switch (dataset) {
      case "countries":
        return db.getCountry(code);
      case "currencies":
        return db.getCurrency(code);
      case "languages":
        return db.getLanguage(code);
      case "airports":
        return db.getAirport(code);
    }
  })();
  if (!record) return undefined;
  return { code: recordCode(dataset, record as unknown as DataRecord), record: record as unknown as DataRecord };
}

function recordCode(dataset: DatasetKey, record: DataRecord): string {
  switch (dataset) {
    case "countries":
      return (record.codes as { iso3166Alpha2: string }).iso3166Alpha2;
    case "airports":
      return (record.iata as string) || (record.icao as string);
    default:
      return record.code as string;
  }
}

/** Every code in a dataset, in index order. */
export function listCodes(db: LocaleDB, dataset: DatasetKey): string[] {
  switch (dataset) {
    case "countries":
      return db.listCountries().map((c) => c.code);
    case "currencies":
      return db.listCurrencies().map((c) => c.code);
    case "languages":
      return db.listLanguages().map((l) => l.code);
    case "airports":
      return db.listAirports().map((a) => a.iata || a.icao);
  }
}

/**
 * Turns a --fields value into dot paths: "default" (the web export's defaults),
 * "all", or a comma-separated list validated against the dataset schema.
 */
export function resolveFields(dataset: DatasetKey, spec: string | undefined): string[] {
  const roots = DATASET_SCHEMAS[dataset].rootPaths;
  if (!spec || spec === "default") return collectDefaultPaths(roots);
  if (spec === "all") return collectAllPaths(roots);

  const fields = spec.split(",").map((f) => f.trim()).filter(Boolean);
  const known = schemaPaths(roots);
  const unknown = fields.filter(
    (field) => !known.some((path) => field === path || field.startsWith(`${path}.`) || path.startsWith(`${field}.`))
  );
  if (unknown.length) {
    const tops = roots.map((node) => node.path).join(", ");
    throw new UsageError(`Unknown field${unknown.length > 1 ? "s" : ""} for ${dataset}: ${unknown.join(", ")}.\nTop-level fields: ${tops}.`);
  }
  return fields;
}

function schemaPaths(nodes: FieldNode[]): string[] {
  return nodes.flatMap((node) => [node.path, ...(node.children ? schemaPaths(node.children) : [])]);
}
