import pc from "picocolors";

const b = pc.bold;
const d = pc.dim;

export const HELP: Record<string, string> = {
  main: `${b("localedb")} ${d("— localization data for every country, in your project")}

${b("Usage")}
  localedb <command> [options]

${b("Commands")}
  get <dataset> <code>        Print one record as JSON
  export <dataset> [codes…]   Export records as JSON, CSV or TypeScript
  list <dataset>              List every record in a dataset
  search <query>              Find countries by code or name
  init                        Create ${pc.cyan("localedb.config.json")} step by step
  sync                        Regenerate the files described in the config

${b("Datasets")}
  countries, currencies, languages, airports ${d("(singular works too)")}

${b("Examples")}
  localedb get country TR --fields currency,dateTime.datePatterns
  localedb export countries TR DE FR --format ts --out src/locales/countries.ts
  localedb export currencies --all --format csv > currencies.csv
  localedb sync --check

Run ${pc.cyan("localedb <command> --help")} for command options.
Data licenses: https://github.com/ozkurkculer/localedb/blob/main/packages/core/NOTICE`,

  get: `${b("localedb get")} <dataset> <code> [--fields <list>]

Prints one record as JSON. Countries accept alpha-2 or alpha-3 codes,
airports IATA or ICAO.

  --fields <list>   Comma-separated dot paths, "default" or "all"`,

  export: `${b("localedb export")} <dataset> [codes…] [options]

Codes can be space- or comma-separated. Without --out, prints to stdout.

  --all             Export every record in the dataset
  --fields <list>   Comma-separated dot paths, "default" (recommended) or "all"
  --format <fmt>    json (default), json-min, csv, ts
  --out <path>      Output file, or directory with --split
  --split           One file per record, named <CODE>.<ext>`,

  list: `${b("localedb list")} <dataset> [--json]

  --json            Print JSON instead of a table`,

  search: `${b("localedb search")} <query> [--json]

Matches country codes (alpha-2, alpha-3), English and native names.

  --json            Print JSON instead of a table`,

  init: `${b("localedb init")} [--config <path>]

Asks which data you need, writes it to localedb.config.json and generates
the files. Running it again adds another export to the config.`,

  sync: `${b("localedb sync")} [--config <path>] [--check]

Regenerates every export in localedb.config.json. Paths in the config are
relative to the config file.

  --config <path>   Config file (default: ./localedb.config.json)
  --check           Exit with 1 if any generated file is out of date (for CI)`,
};
