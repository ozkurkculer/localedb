import type { Airport } from "@localedb/core/browser";
import { buildRecords } from "@/lib/data/build";

/**
 * Load the airport index.
 * Contains all major airports with IATA codes.
 */
export async function getAirportIndex(): Promise<Airport[]> {
  return buildRecords.getAirportIndex();
}

/**
 * Search airports by name, IATA, or ICAO.
 * @param query - Search term
 */
export async function searchAirports(query: string): Promise<Airport[]> {
  const index = await getAirportIndex();
  const lowerQuery = query.toLowerCase();

  return index.filter(
    (airport) =>
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.iata.toLowerCase().includes(lowerQuery) ||
      airport.icao.toLowerCase().includes(lowerQuery) ||
      airport.region.toLowerCase().includes(lowerQuery) ||
      airport.countryCode.toLowerCase().includes(lowerQuery)
  );
}
