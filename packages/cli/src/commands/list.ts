import type { Context } from "../context";
import { resolveDataset, type DatasetKey } from "../datasets";
import { printTable } from "../table";

type Cell = string | number | undefined;

const TABLES: Record<DatasetKey, (ctx: Context) => { rows: unknown[]; headers: string[]; cells: Cell[][] }> = {
  countries: ({ db }) => {
    const rows = db.listCountries();
    return {
      rows,
      headers: ["CODE", "ALPHA3", "NAME", "NATIVE", "CURRENCY", "PHONE"],
      cells: rows.map((c) => [c.code, c.alpha3, c.name, c.nativeName, c.currencyCode, c.callingCode]),
    };
  },
  currencies: ({ db }) => {
    const rows = db.listCurrencies();
    return { rows, headers: ["CODE", "SYMBOL", "NAME", "COUNTRIES"], cells: rows.map((c) => [c.code, c.symbol, c.name, c.countriesCount]) };
  },
  languages: ({ db }) => {
    const rows = db.listLanguages();
    return { rows, headers: ["CODE", "NAME", "NATIVE", "COUNTRIES"], cells: rows.map((l) => [l.code, l.name, l.nativeName, l.countriesCount]) };
  },
  airports: ({ db }) => {
    const rows = db.listAirports();
    return { rows, headers: ["IATA", "ICAO", "COUNTRY", "NAME"], cells: rows.map((a) => [a.iata, a.icao, a.countryCode, a.name]) };
  },
};

export function list(ctx: Context, [datasetName]: string[], options: { json?: boolean }): number {
  const { rows, headers, cells } = TABLES[resolveDataset(datasetName)](ctx);
  if (options.json) ctx.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
  else printTable(ctx.stdout, headers, cells);
  return 0;
}
