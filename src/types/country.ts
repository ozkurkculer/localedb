/**
 * LocaleDB Country Data Schema
 * Defines the complete structure for country localization data
 */

// ─── Type Definitions ────────────────────────────────────────────

export type WritingDirection = "ltr" | "rtl";
export type MeasurementSystem = "metric" | "imperial" | "mixed";
export type TemperatureScale = "celsius" | "fahrenheit";
export type CurrencySymbolPosition = "before" | "after";
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7; // ISO 8601: 1=Monday, 7=Sunday
export type ClockFormat = "12h" | "24h";

// ─── Language Information ────────────────────────────────────────

import { Language } from "./language";

// ─── Country Basics ──────────────────────────────────────────────

export interface CountryBasics {
  /** Common English name, e.g. "Turkey" */
  name: string;
  /** Official English name, e.g. "Republic of Türkiye" */
  officialName: string;
  /** Name in the country's own primary language, e.g. "Türkiye" */
  nativeName: string;
  /** Official native name, e.g. "Türkiye Cumhuriyeti" */
  officialNativeName: string;
  /** Capital city name in English */
  capital: string;
  /** Capital city coordinates [latitude, longitude] */
  capitalCoordinates: [number, number];
  /** Country center coordinates [latitude, longitude] */
  coordinates: [number, number];
  /** Continent, e.g. "Europe", "Asia" */
  continent: string;
  /** UN geoscheme region, e.g. "Western Asia" */
  region: string;
  /** UN geoscheme subregion */
  subregion: string;
  /** Estimated population */
  population: number;
  /** Land area in square kilometers */
  area: number;
  /** Flag emoji character, e.g. "🇹🇷" */
  flagEmoji: string;
  /** Country-code top-level domain, e.g. ".tr" */
  tld: string;
  /** Whether the country is landlocked */
  landlocked: boolean;
  /** ISO 3166-1 alpha-2 codes of bordering countries */
  borders: string[];
  /** Official and widely-spoken languages */
  languages: Language[];
  /** Demonym in English, e.g. "Turkish" */
  demonym: string;
}

// ─── Code Systems ────────────────────────────────────────────────

export interface CodeSystems {
  /** ISO 3166-1 alpha-2, e.g. "TR" */
  iso3166Alpha2: string;
  /** ISO 3166-1 alpha-3, e.g. "TUR" */
  iso3166Alpha3: string;
  /** ISO 3166-1 numeric, e.g. "792" */
  iso3166Numeric: string;
  /**
   * BCP 47 / IETF locale tags applicable to this country.
   * Primary tag first, e.g. ["tr-TR", "ku-TR", "ar-TR"]
   */
  bcp47: string[];
  /** Internet ccTLD, e.g. ".tr" */
  internetTld: string;
  /** IOC (International Olympic Committee) code, e.g. "TUR" */
  ioc: string;
  /** FIFA code, e.g. "TUR" */
  fifa: string;
  /** International vehicle registration code, e.g. "TR" */
  vehicleCode: string;
  /** FIPS 10-4 code (US federal standard), e.g. "TU" */
  fips10: string;
  /** UN/LOCODE (United Nations Code for Trade and Transport Locations), e.g. "TR" */
  unLocode: string;
  /** NATO STANAG 1059 code, e.g. "TUR" */
  stanag1059: string;
  /** ITU (International Telecommunication Union) code, e.g. "TUR" */
  itu: string;
  /** UIC (International Union of Railways) country code, e.g. "52 TR" */
  uic: string;
  /** Maritime identification digits (MID), e.g. 271 */
  maritime: number;
  /** Mobile country code (MCC) for GSM networks, e.g. 286 */
  mmc: number;
}

// ─── Currency ────────────────────────────────────────────────────

export interface CurrencyInfo {
  /** ISO 4217 code, e.g. "TRY" */
  code: string;
  /** ISO 4217 numeric code, e.g. 949 */
  numericCode: number;
  /** English name, e.g. "Turkish Lira" */
  name: string;
  /** Native name, e.g. "Türk Lirası" */
  nativeName: string;
  /** Currency symbol, e.g. "₺" */
  symbol: string;
  /** Narrow symbol (if different from symbol), e.g. "₺" */
  narrowSymbol: string;
  /** Position of symbol relative to amount */
  symbolPosition: CurrencySymbolPosition;
  /** Decimal separator character, e.g. "," */
  decimalSeparator: string;
  /** Thousands/grouping separator character, e.g. "." */
  thousandsSeparator: string;
  /** Number of decimal digits, e.g. 2 */
  decimalDigits: number;
  /** Subunit to unit ratio, e.g. 100 (100 kuruş = 1 lira) */
  subunitValue: number;
  /** Subunit name, e.g. "Kuruş", "Cent", "Puls" */
  subunitName: string;
  /** Formatting pattern (CLDR), e.g. "#.##0,00 ¤" */
  pattern: string;
  /** Concrete example, e.g. "1.250,00 ₺" */
  example: string;
  /** Accounting format example, e.g. "(1.250,00 ₺)" for negatives */
  accountingExample: string;
}

// ─── Date and Time ───────────────────────────────────────────────

export interface DateTimeInfo {
  /** First day of the week (1=Monday, 7=Sunday) */
  firstDayOfWeek: DayOfWeek;
  /** Preferred clock format */
  clockFormat: ClockFormat;
  /** Date format patterns */
  dateFormats: {
    /** e.g. "15 Şubat 2026 Pazar" */
    full: string;
    /** e.g. "15 Şubat 2026" */
    long: string;
    /** e.g. "15 Şub 2026" */
    medium: string;
    /** e.g. "15.02.2026" */
    short: string;
  };
  /** Time format patterns */
  timeFormats: {
    /** e.g. "15:30:00 Türkiye Standart Zamanı" */
    full: string;
    /** e.g. "15:30:00 TSZ" */
    long: string;
    /** e.g. "15:30:00" */
    medium: string;
    /** e.g. "15:30" */
    short: string;
  };
  /** CLDR/ICU date pattern strings for developers */
  datePatterns: {
    /** e.g. "dd MMMM yyyy EEEE" */
    full: string;
    /** e.g. "dd MMMM yyyy" */
    long: string;
    /** e.g. "dd MMM yyyy" */
    medium: string;
    /** e.g. "dd.MM.yyyy" */
    short: string;
  };
  /** CLDR/ICU time pattern strings for developers */
  timePatterns: {
    full: string;
    long: string;
    medium: string;
    short: string;
  };
  /** Month names in the local language */
  monthNames: {
    /** Full names, e.g. ["Ocak", "Şubat", ...] */
    wide: string[];
    /** Abbreviated, e.g. ["Oca", "Şub", ...] */
    abbreviated: string[];
    /** Single letter/narrow, e.g. ["O", "Ş", ...] */
    narrow: string[];
  };
  /** Day names in the local language, starting from Monday */
  dayNames: {
    /** Full names, e.g. ["Pazartesi", "Salı", ...] */
    wide: string[];
    /** Abbreviated, e.g. ["Pzt", "Sal", ...] */
    abbreviated: string[];
    /** Narrow, e.g. ["P", "S", ...] */
    narrow: string[];
  };
  /** AM/PM markers in local language, e.g. ["ÖÖ", "ÖS"] */
  amPmMarkers: [string, string];
  /** Common IANA timezone(s), e.g. ["Europe/Istanbul"] */
  timezones: string[];
  /** Primary IANA timezone */
  primaryTimezone: string;
  /** UTC offset string, e.g. "+03:00" */
  utcOffset: string;
}

// ─── Number Formatting ───────────────────────────────────────────

export interface NumberFormatInfo {
  /** Decimal separator, e.g. "," */
  decimalSeparator: string;
  /** Thousands/grouping separator, e.g. "." */
  thousandsSeparator: string;
  /**
   * Digit grouping pattern. Most countries use "3" (groups of 3).
   * India uses "3;2" (first group of 3, then groups of 2).
   */
  digitGrouping: string;
  /** CLDR number pattern, e.g. "#.##0,###" */
  pattern: string;
  /** Percentage format, e.g. "%25,5" */
  percentExample: string;
  /** Standard number example, e.g. "1.234.567,89" */
  example: string;
  /** Numbering system used, e.g. "latn", "arab" */
  numberingSystem: string;
}

// ─── Phone ───────────────────────────────────────────────────────

export interface PhoneInfo {
  /** International calling code, e.g. "+90" */
  callingCode: string;
  /** Trunk prefix for domestic calls, e.g. "0" */
  trunkPrefix: string;
  /** International dialing prefix, e.g. "00" */
  internationalPrefix: string;
  /** Example formatted number, e.g. "+90 212 555 1234" */
  exampleFormat: string;
  /** Common phone number lengths (digits after country code) */
  subscriberNumberLengths: number[];
}

// ─── Address Format ──────────────────────────────────────────────

export interface AddressFormatInfo {
  /**
   * CLDR/Google libaddressinput format string.
   * Uses placeholders: %N=name, %O=organization, %A=street address,
   * %C=city, %S=state/province, %Z=postal code, %n=newline
   * e.g. "%N%n%O%n%A%n%Z %C" (for Turkey)
   */
  format: string;
  /** Human-readable description of address line order */
  lineOrder: string[];
  /** Postal code format pattern, e.g. "NNNNN" or "ANA NAN" */
  postalCodeFormat: string;
  /** Regex pattern for postal code validation */
  postalCodeRegex: string;
  /** Example postal code, e.g. "34000" */
  postalCodeExample: string;
  /** Local name for state/province/region, e.g. "il" (Turkish for province) */
  administrativeDivisionName: string;
  /** English name for the admin division type, e.g. "Province" */
  administrativeDivisionType: string;
}

// ─── Miscellaneous Locale Info ───────────────────────────────────

export interface LocaleMiscInfo {
  /** Primary writing/text direction */
  writingDirection: WritingDirection;
  /** Measurement system */
  measurementSystem: MeasurementSystem;
  /** Temperature scale preference */
  temperatureScale: TemperatureScale;
  /** Paper size standard, e.g. "A4" or "Letter" */
  paperSize: "A4" | "Letter";
  /** Driving side, e.g. "right" or "left" */
  drivingSide: "right" | "left";
  /** Week numbering system, e.g. "ISO" or "US" */
  weekNumbering: "ISO" | "US";
}

// ─── Root Interface ──────────────────────────────────────────────

/**
 * Complete locale data for a single country.
 * Each country's JSON file in data/countries/{code}.json
 * conforms to this interface.
 */
export interface CountryLocaleData {
  /** Schema version for forward compatibility, e.g. "1.0.0" */
  $schema: string;
  /** Last updated ISO date, e.g. "2026-02-15" */
  lastUpdated: string;
  /** Data sources used, e.g. ["CLDR 46", "mledoze/countries"] */
  sources: string[];

  basics: CountryBasics;
  codes: CodeSystems;
  currency: CurrencyInfo;
  dateTime: DateTimeInfo;
  numberFormat: NumberFormatInfo;
  phone: PhoneInfo;
  addressFormat: AddressFormatInfo;
  locale: LocaleMiscInfo;
}

// ─── Index Types (for _index.json) ──────────────────────────────

/**
 * Lightweight country entry used for the grid/search page.
 * Kept minimal to avoid loading full data for all 250 countries.
 */
export interface CountryIndexEntry {
  /** ISO 3166-1 alpha-2 code */
  code: string;
  /** Common English name */
  name: string;
  /** Flag emoji */
  flagEmoji: string;
  /** Continent */
  continent: string;
  /** Region */
  region: string;
  /** Primary BCP47 locale tag */
  primaryLocale: string;
  /** Currency code */
  currencyCode: string;
  /** Calling code */
  callingCode: string;
}
