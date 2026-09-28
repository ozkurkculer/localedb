# @localedb/core

Structured localization data for every country, as a typed, offline npm package. The same dataset that powers [localedb.org](https://localedb.org): currencies, languages, date and number formats, phone numbers, address formats and airports.

```bash
npm install @localedb/core
```

## Usage (Node.js)

```ts
import { getCountry, getCurrency, searchCountries } from "@localedb/core";

const tr = getCountry("TR"); // or "TUR", case-insensitive
tr?.currency.symbol; // "₺"
tr?.numberFormat.decimalSeparator; // ","
tr?.dateTime.datePatterns.short; // "dd.MM.yyyy"

getCurrency("EUR")?.countries; // ["AT", "BE", "DE", ...]
searchCountries("deutsch"); // [{ code: "DE", name: "Germany", ... }]
```

Everything is synchronous and read from the bundled `data/` directory on first use, then cached.

| Function | Returns |
| --- | --- |
| `getCountry(code)` | Full country record by ISO 3166-1 alpha-2 or alpha-3 code |
| `getCurrency(code)` | Currency by ISO 4217 code, with the countries that use it |
| `getLanguage(code)` | Language by ISO 639-1 code |
| `getAirport(code)` | Airport by IATA or ICAO code |
| `listCountries()` / `listCurrencies()` / `listLanguages()` / `listAirports()` | Lightweight index entries |
| `searchCountries(query)` | Countries matching a code, English or native name |
| `getMeta()` | Dataset build date, counts and sources |
| `createLocaleDB(dir)` | The same API over a data directory of your choice |

## Usage (browsers and bundlers)

The main entry point reads files from disk. In the browser, import only the records you need as JSON, and use the environment-agnostic helpers from `@localedb/core/browser`:

```ts
import tr from "@localedb/core/data/countries/TR.json";
import { pickFields, type CountryLocaleData } from "@localedb/core/browser";

const slim = pickFields(tr, ["currency.symbol", "dateTime.datePatterns"]);
```

Data files: `data/countries/<ALPHA2>.json`, `data/currencies/<ISO4217>.json`, `data/languages/<iso639-1>.json`, `data/airports.json`, `data/index/{countries,currencies,languages}.json`.

## Types

All record types are exported: `CountryLocaleData`, `Currency`, `Language`, `Airport`, `CountryIndexEntry` and their parts (`DateTimeInfo`, `NumberFormatInfo`, `PhoneInfo`, …).

## License

The code is MIT licensed. The bundled data comes from third-party sources (Unicode CLDR, mledoze/countries, the World Bank, the IANA tz database, libphonenumber, libaddressinput, Wikidata, ourworldincode/currency, mwgg/Airports, IP2Location), each under its own license, some of them share-alike. See [NOTICE](./NOTICE) before redistributing the data.
