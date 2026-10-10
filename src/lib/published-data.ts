import type { Airport } from "@localedb/core/browser";

/**
 * URLs of the files `scripts/publish-data.ts` writes to `public/_data`. Safe for client
 * components: no file system access.
 */

/** Airports rendered statically on a country page; the drawer loads the full list on demand. */
export const COUNTRY_PAGE_AIRPORTS = 9;

export type DrawerAirport = Pick<Airport, "name" | "region" | "iata" | "icao">;

/** Every airport of a country with more than COUNTRY_PAGE_AIRPORTS (compact fields). */
export function countryAirportsUrl(countryCode: string): string {
  return `/_data/country-airports/${countryCode.toUpperCase()}.json`;
}

/** A country's full record, as in `data/countries`. */
export function countryRecordUrl(countryCode: string): string {
  return `/_data/countries/${countryCode.toUpperCase()}.json`;
}
