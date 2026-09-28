/**
 * Copies the dataset produced by the root `pnpm build:data` into this package.
 *
 *   <repo>/data/countries/TR.json      -> data/countries/TR.json
 *   <repo>/data/currencies/EUR.json    -> data/currencies/EUR.json
 *   <repo>/data/languages/tr.json      -> data/languages/tr.json
 *   <repo>/data/_index_airports.json   -> data/airports.json
 *   <repo>/data/_index_<name>.json     -> data/index/<name>.json
 *   <repo>/data/_meta.json             -> data/meta.json (version set to this package's)
 *
 * JSON is re-serialised without whitespace to keep the tarball small.
 *
 * Usage: tsx scripts/pack-data.ts [sourceDir]
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED = ["_meta.json", "_index_countries.json", "_index_currencies.json", "_index_languages.json", "_index_airports.json"];
const DATASETS = ["countries", "currencies", "languages"] as const;

export interface PackResult {
  counts: Record<(typeof DATASETS)[number], number>;
  bytes: number;
}

function copyJson(from: string, to: string, transform: (value: Record<string, unknown>) => unknown = (v) => v) {
  const value = JSON.parse(readFileSync(from, "utf-8"));
  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, JSON.stringify(transform(value)));
  return statSync(to).size;
}

export function packData(sourceDir: string, outDir: string, version: string): PackResult {
  const missing = REQUIRED.filter((file) => {
    try {
      statSync(join(sourceDir, file));
      return false;
    } catch {
      return true;
    }
  });
  if (missing.length) {
    throw new Error(
      `Missing ${missing.join(", ")} in ${sourceDir}. Run \`pnpm update:data && pnpm build:data\` in the repository root first.`
    );
  }

  rmSync(outDir, { recursive: true, force: true });

  let bytes = copyJson(join(sourceDir, "_meta.json"), join(outDir, "meta.json"), (meta) => ({ ...meta, version }));
  bytes += copyJson(join(sourceDir, "_index_airports.json"), join(outDir, "airports.json"));

  const counts = {} as PackResult["counts"];
  for (const dataset of DATASETS) {
    bytes += copyJson(join(sourceDir, `_index_${dataset}.json`), join(outDir, "index", `${dataset}.json`));
    const files = readdirSync(join(sourceDir, dataset)).filter((f) => f.endsWith(".json"));
    for (const file of files) bytes += copyJson(join(sourceDir, dataset, file), join(outDir, dataset, file));
    counts[dataset] = files.length;
  }

  return { counts, bytes };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sourceDir = resolve(process.argv[2] ?? join(packageDir, "../../data"));
  const outDir = join(packageDir, "data");
  const { version } = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf-8"));
  try {
    const { counts, bytes } = packData(sourceDir, outDir, version);
    const mb = (bytes / 1024 / 1024).toFixed(1);
    console.log(
      `Packed ${counts.countries} countries, ${counts.currencies} currencies, ${counts.languages} languages (${mb} MB) into ${outDir}`
    );
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
