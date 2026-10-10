import type {
  Airport,
  CountryLocaleData,
  CurrencyLocaleData,
  LanguageLocaleData,
} from "@localedb/core/browser";
import type { DataSource } from "./source";

/**
 * Typed access to single records. The build-time reader (`./build`) and the runtime reader
 * (`./runtime`) both expose this interface over sources with the same file layout:
 * `countries/{CODE}.json`, `currencies/{CODE}.json`, `languages/{code}.json`,
 * `_index_airports.json`.
 */
export interface RecordReader {
  getCountry(code: string): Promise<CountryLocaleData | null>;
  getCurrency(code: string): Promise<CurrencyLocaleData | null>;
  getLanguage(code: string): Promise<LanguageLocaleData | null>;
  getAirportIndex(): Promise<Airport[]>;
}

/** Record ids are file names; anything else (e.g. `../`) cannot name a record. */
const RECORD_ID = /^[A-Za-z0-9_-]+$/;

export function createRecordReader(source: DataSource): RecordReader {
  async function readRecord<T>(kind: string, dir: string, id: string): Promise<T | null> {
    if (!RECORD_ID.test(id)) return null;
    try {
      const raw = await source.readText(`${dir}/${id}.json`);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error) {
      console.error(`Failed to load ${kind} data for ${id}:`, error);
      return null;
    }
  }

  return {
    getCountry: (code) => readRecord("country", "countries", code.toUpperCase()),
    getCurrency: (code) => readRecord("currency", "currencies", code.toUpperCase()),
    getLanguage: (code) => readRecord("language", "languages", code.toLowerCase()),
    getAirportIndex: () => readJsonList<Airport>(source, "_index_airports.json", "airport index"),
  };
}

/** A JSON array file; [] when it is missing (logged only for other failures). */
export async function readJsonList<T>(source: DataSource, file: string, what: string): Promise<T[]> {
  try {
    const raw = await source.readText(file);
    return raw === null ? [] : (JSON.parse(raw) as T[]);
  } catch (error) {
    console.error(`Failed to load ${what}:`, error);
    return [];
  }
}
