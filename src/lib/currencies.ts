import { readFile, readdir } from "fs/promises";
import path from "path";
import type { CurrencyLocaleData, CurrencyIndexEntry } from "@/types/currency";

const DATA_DIR = path.join(process.cwd(), "data", "currencies");
const INDEX_PATH = path.join(process.cwd(), "data", "_index_currencies.json");

/**
 * Load a single currency's full data by ISO 4217 code.
 * @param code - ISO 4217 code (e.g., "USD", "TRY")
 */
export async function getCurrency(code: string): Promise<CurrencyLocaleData | null> {
  try {
    const filePath = path.join(DATA_DIR, `${code.toUpperCase()}.json`);
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as CurrencyLocaleData;
  } catch (error) {
    console.error(`Failed to load currency data for ${code}:`, error);
    return null;
  }
}

/**
 * Load all currency codes (for generateStaticParams).
 */
export async function getAllCurrencyCodes(): Promise<string[]> {
  try {
    const files = await readdir(DATA_DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch (error) {
    console.error("Failed to load currency codes:", error);
    return [];
  }
}

/**
 * Load the lightweight index for the currencies grid page.
 */
export async function getCurrencyIndex(): Promise<CurrencyIndexEntry[]> {
  try {
    const raw = await readFile(INDEX_PATH, "utf-8");
    return JSON.parse(raw) as CurrencyIndexEntry[];
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error("Failed to load currency index:", error);
    }
    return [];
  }
}
