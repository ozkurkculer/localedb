import type { LanguageLocaleData, LanguageIndexEntry } from "@localedb/core/browser";
import { buildRecords, listRecordIds, readIndex } from "@/lib/data/build";

/**
 * Load a single language's full data by ISO 639-1 code.
 * @param code - ISO 639-1 code (e.g., "en", "tr")
 */
export async function getLanguage(code: string): Promise<LanguageLocaleData | null> {
  return buildRecords.getLanguage(code);
}

/**
 * Load all language codes (for generateStaticParams).
 */
export async function getAllLanguageCodes(): Promise<string[]> {
  return listRecordIds("languages");
}

/**
 * Load the lightweight index for the languages grid page.
 */
export async function getLanguageIndex(): Promise<LanguageIndexEntry[]> {
  return readIndex<LanguageIndexEntry>("languages");
}

/**
 * Search languages by name or code.
 */
export async function searchLanguages(
  query: string
): Promise<LanguageIndexEntry[]> {
  const index = await getLanguageIndex();
  const lowerQuery = query.toLowerCase();

  return index.filter(
    (lang) =>
      lang.name.toLowerCase().includes(lowerQuery) ||
      lang.nativeName.toLowerCase().includes(lowerQuery) ||
      lang.code.toLowerCase().includes(lowerQuery)
  );
}
