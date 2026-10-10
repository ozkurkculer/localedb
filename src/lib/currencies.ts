import type { CurrencyLocaleData, CurrencyIndexEntry } from "@localedb/core/browser";
import { buildRecords, listRecordIds, readIndex } from "@/lib/data/build";

/**
 * Load a single currency's full data by ISO 4217 code.
 * @param code - ISO 4217 code (e.g., "USD", "TRY")
 */
export async function getCurrency(code: string): Promise<CurrencyLocaleData | null> {
  return buildRecords.getCurrency(code);
}

/**
 * Load all currency codes (for generateStaticParams).
 */
export async function getAllCurrencyCodes(): Promise<string[]> {
  return listRecordIds("currencies");
}

/**
 * Load the lightweight index for the currencies grid page.
 */
export async function getCurrencyIndex(): Promise<CurrencyIndexEntry[]> {
  return readIndex<CurrencyIndexEntry>("currencies");
}
