import { readFile, readdir } from "fs/promises";
import path from "path";
import type { LanguageLocaleData, LanguageIndexEntry } from "@/types/language";

const DATA_DIR = path.join(process.cwd(), "data", "languages");
const INDEX_PATH = path.join(process.cwd(), "data", "_index_languages.json");

/**
 * Load a single language's full data by ISO 639-1 code.
 * @param code - ISO 639-1 code (e.g., "en", "tr")
 */
export async function getLanguage(code: string): Promise<LanguageLocaleData | null> {
  try {
    const filePath = path.join(DATA_DIR, `${code.toLowerCase()}.json`);
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as LanguageLocaleData;
  } catch (error) {
    console.error(`Failed to load language data for ${code}:`, error);
    return null;
  }
}

/**
 * Load all language codes (for generateStaticParams).
 */
export async function getAllLanguageCodes(): Promise<string[]> {
  try {
    const files = await readdir(DATA_DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch (error) {
    console.error("Failed to load language codes:", error);
    return [];
  }
}

/**
 * Load the lightweight index for the languages grid page.
 */
export async function getLanguageIndex(): Promise<LanguageIndexEntry[]> {
  try {
    const raw = await readFile(INDEX_PATH, "utf-8");
    return JSON.parse(raw) as LanguageIndexEntry[];
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error("Failed to load language index:", error);
    }
    return [];
  }
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
