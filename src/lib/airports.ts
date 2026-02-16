import { readFile } from "fs/promises";
import path from "path";
import type { Airport } from "@/types/airport";

const AIRPORTS_INDEX_PATH = path.join(process.cwd(), "data", "_index_airports.json");

/**
 * Load the airport index.
 * Contains all major airports with IATA codes.
 */
export async function getAirportIndex(): Promise<Airport[]> {
  try {
    const raw = await readFile(AIRPORTS_INDEX_PATH, "utf-8");
    return JSON.parse(raw) as Airport[];
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error("Failed to load airport index:", error);
    }
    return [];
  }
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
