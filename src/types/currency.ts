export type CurrencySymbolPosition = "before" | "after";

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

export interface CurrencyLocaleData {
    $schema: string;
    lastUpdated: string;
    data: CurrencyInfo & {
        countries: string[]; // List of country codes using this currency
    };
}

export interface CurrencyIndexEntry {
    code: string;
    name: string;
    symbol: string;
    countriesCount: number;
}
