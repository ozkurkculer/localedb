# @localedb/cli

Pull localization data for any country straight into your project: currencies, languages, date and number formats, phone numbers, address formats and airports. Powered by [@localedb/core](https://www.npmjs.com/package/@localedb/core), works offline.

```bash
npx @localedb/cli init
```

`init` asks which data you need, saves the answers to `localedb.config.json` and generates the files. Later, `localedb sync` regenerates them, and `localedb sync --check` fails CI when they drift from the installed data.

Requires Node.js 20.12 or newer.

## Commands

```bash
# One record as JSON; countries accept alpha-2 or alpha-3, airports IATA or ICAO
localedb get country TR --fields currency,dateTime.datePatterns

# Export several records
localedb export countries TR DE FR --format ts --out src/locales/countries.ts
localedb export currencies --all --fields code,symbol,decimalDigits --format csv > currencies.csv
localedb export languages tr de --split --out data/languages   # one file per record

# Browse
localedb list currencies
localedb search deutsch
```

| Option | Applies to | |
| --- | --- | --- |
| `--fields <list>` | get, export | Comma-separated dot paths, `default` (the localedb.org defaults) or `all` |
| `--format <fmt>` | export | `json` (default), `json-min`, `csv`, `ts` |
| `--out <path>` | export | Output file, or directory with `--split`; prints to stdout when omitted |
| `--split` | export | One file per record, named `<CODE>.<ext>` |
| `--all` | export | Every record in the dataset |
| `--json` | list, search | JSON instead of a table |
| `--config <path>` | init, sync | Config file (default `./localedb.config.json`) |
| `--check` | sync | Exit with 1 if a generated file is out of date |

Datasets: `countries`, `currencies`, `languages`, `airports` (singular works too).

### TypeScript output

`--format ts` writes a module keyed by code, typed `as const`:

```ts
import { countries, type CountriesCode } from "./locales/countries";

countries.TR.currency.symbol; // type "₺"
```

## Config

```json
{
  "exports": [
    { "dataset": "countries", "codes": ["TR", "DE"], "fields": "default", "format": "ts", "out": "src/locales/countries.ts" },
    { "dataset": "currencies", "codes": "all", "fields": ["code", "symbol"], "format": "json", "out": "public/currencies.json" }
  ]
}
```

Paths are relative to the config file. `fields` is optional and defaults to `"default"`.

## License

MIT for the code. The data comes from third-party sources with their own licenses, some of them share-alike; see the [NOTICE](https://github.com/ozkurkculer/localedb/blob/main/packages/core/NOTICE).
