import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  Airport,
  CountryIndexEntry,
  CountryLocaleData,
  CurrencyIndexEntry,
  CurrencyLocaleData,
  Language,
  LanguageIndexEntry,
  LanguageLocaleData,
} from "./types";

/** A currency record: ISO 4217 formatting data plus the countries that use it. */
export type Currency = CurrencyLocaleData["data"];

export interface DatasetMeta {
  /** Version of the package the data was bundled with. */
  version: string;
  /** ISO timestamp of the data build. */
  buildDate: string;
  stats: { countries: number; languages: number; currencies: number; airports: number };
  sources: { name: string; version?: string; year?: string }[];
}

export interface LocaleDB {
  /** Full locale data for a country by ISO 3166-1 alpha-2 or alpha-3 code (case-insensitive). */
  getCountry(code: string): CountryLocaleData | undefined;
  /** Currency by ISO 4217 code (case-insensitive). */
  getCurrency(code: string): Currency | undefined;
  /** Language by ISO 639-1 code (case-insensitive). */
  getLanguage(code: string): Language | undefined;
  /** Airport by IATA or ICAO code (case-insensitive). */
  getAirport(code: string): Airport | undefined;
  listCountries(): CountryIndexEntry[];
  listCurrencies(): CurrencyIndexEntry[];
  listLanguages(): LanguageIndexEntry[];
  listAirports(): Airport[];
  /** Countries whose code, alpha-3, English or native name contains `query` (case-insensitive). */
  searchCountries(query: string): CountryIndexEntry[];
  /** Build metadata of the bundled dataset. */
  getMeta(): DatasetMeta;
}

/** Codes end up in file paths; anything but letters and digits is rejected outright. */
const SAFE_CODE = /^[A-Za-z0-9]{2,4}$/;

/**
 * Creates a reader over a LocaleDB data directory (the layout produced by
 * `scripts/pack-data.ts`). Files are read lazily and cached for the lifetime
 * of the returned object.
 */
export function createLocaleDB(dataDir: string): LocaleDB {
  const cache = new Map<string, unknown>();

  function read<T>(relativePath: string): T | undefined {
    if (cache.has(relativePath)) return cache.get(relativePath) as T | undefined;
    let value: T | undefined;
    try {
      value = JSON.parse(readFileSync(join(dataDir, relativePath), "utf-8")) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      value = undefined;
    }
    cache.set(relativePath, value);
    return value;
  }

  function readRequired<T>(relativePath: string): T {
    const value = read<T>(relativePath);
    if (value === undefined) {
      throw new Error(`LocaleDB data file is missing: ${join(dataDir, relativePath)}`);
    }
    return value;
  }

  const listCountries = () => readRequired<CountryIndexEntry[]>("index/countries.json");
  const listCurrencies = () => readRequired<CurrencyIndexEntry[]>("index/currencies.json");
  const listLanguages = () => readRequired<LanguageIndexEntry[]>("index/languages.json");
  const listAirports = () => readRequired<Airport[]>("airports.json");

  let airportsByCode: Map<string, Airport> | undefined;

  return {
    getCountry(code) {
      if (!SAFE_CODE.test(code)) return undefined;
      let alpha2 = code.toUpperCase();
      if (alpha2.length === 3) {
        alpha2 = listCountries().find((c) => c.alpha3.toUpperCase() === alpha2)?.code ?? "";
        if (!alpha2) return undefined;
      }
      return read<CountryLocaleData>(`countries/${alpha2}.json`);
    },

    getCurrency(code) {
      if (!SAFE_CODE.test(code)) return undefined;
      return read<CurrencyLocaleData>(`currencies/${code.toUpperCase()}.json`)?.data;
    },

    getLanguage(code) {
      if (!SAFE_CODE.test(code)) return undefined;
      return read<LanguageLocaleData>(`languages/${code.toLowerCase()}.json`)?.data;
    },

    getAirport(code) {
      if (!airportsByCode) {
        airportsByCode = new Map();
        for (const airport of listAirports()) {
          if (airport.icao) airportsByCode.set(airport.icao.toUpperCase(), airport);
          if (airport.iata) airportsByCode.set(airport.iata.toUpperCase(), airport);
        }
      }
      return airportsByCode.get(code.toUpperCase());
    },

    listCountries,
    listCurrencies,
    listLanguages,
    listAirports,

    searchCountries(query) {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return listCountries().filter(
        (c) =>
          c.code.toLowerCase() === q ||
          c.alpha3.toLowerCase() === q ||
          c.name.toLowerCase().includes(q) ||
          c.nativeName.toLowerCase().includes(q)
      );
    },

    getMeta: () => readRequired<DatasetMeta>("meta.json"),
  };
}
