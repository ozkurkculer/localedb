/**
 * LocaleDB Language Data Schema
 * Defines the structure for language localization data
 */

export interface Language {
  /** ISO 639-1 two-letter code, e.g. "tr" */
  code: string;
  /** ISO 639-2 three-letter bibliographic code, e.g. "tur" */
  iso639_2: string;
  /** ISO 639-3 three-letter terminologic code, e.g. "tur" */
  iso639_3: string;
  /** English name, e.g. "Turkish" */
  name: string;
  /** Native name, e.g. "Türkçe" */
  nativeName: string;
  /** Script direction, e.g. "ltr" or "rtl" */
  direction: "ltr" | "rtl";
  /** Language family, e.g. "Turkic" (if available) */
  family?: string;
  /** List of countries where this is an official language (ISO 3166-1 alpha-2) */
  countries: string[];
}

/**
 * Complete language data for a single language.
 * Each language's JSON file in data/languages/{code}.json
 * conforms to this interface.
 */
export interface LanguageLocaleData {
   /** Schema version */
   $schema: string;
   /** Last updated ISO date */
   lastUpdated: string;
   
   /** Language Metadata */
   data: Language;
}

/**
 * Lightweight language entry for index/search
 */
export interface LanguageIndexEntry {
  code: string;
  name: string;
  nativeName: string;
  countriesCount: number;
}
