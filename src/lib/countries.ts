import type { CountryLocaleData, CountryIndexEntry } from '@localedb/core/browser';
import { buildRecords, listRecordIds, readIndex } from '@/lib/data/build';

/**
 * Load a single country's full data by alpha-2 code.
 * This is called at build time during SSG.
 * @param code - ISO 3166-1 alpha-2 code (e.g., "TR", "US")
 */
export async function getCountry(code: string): Promise<CountryLocaleData | null> {
    return buildRecords.getCountry(code);
}

/**
 * Load all country codes (for generateStaticParams).
 * Returns an array of ISO 3166-1 alpha-2 codes.
 */
export async function getAllCountryCodes(): Promise<string[]> {
    return listRecordIds('countries');
}

/**
 * Load the lightweight index for the grid page.
 * Contains minimal data for all countries.
 */
export async function getCountryIndex(): Promise<CountryIndexEntry[]> {
    return readIndex<CountryIndexEntry>('countries');
}

/**
 * Search countries by name or code (case-insensitive).
 * Used for client-side filtering.
 * @param query - Search term
 */
export async function searchCountries(query: string): Promise<CountryIndexEntry[]> {
    const index = await getCountryIndex();
    const lowerQuery = query.toLowerCase();

    return index.filter(
        (country) =>
            country.name.toLowerCase().includes(lowerQuery) ||
            country.code.toLowerCase().includes(lowerQuery) ||
            country.primaryLocale.toLowerCase().includes(lowerQuery) ||
            country.currencyCode.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get countries by continent.
 * @param continent - Continent name (e.g., "Asia", "Europe")
 */
export async function getCountriesByContinent(continent: string): Promise<CountryIndexEntry[]> {
    const index = await getCountryIndex();
    return index.filter((country) => country.continent === continent);
}

/**
 * Get all unique regions (continents) for static path generation.
 */
export async function getAllRegions(): Promise<string[]> {
    const index = await getCountryIndex();
    const regions = new Set(index.map((c) => c.continent).filter(Boolean));
    return Array.from(regions);
}

/**
 * URL slug of a region, e.g. "North America" → "north-america".
 * A slug with a space was requested as `north%20america` and never matched its prerendered page.
 */
export function regionSlug(region: string): string {
    return region.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Resolve a region slug back to its name (e.g. "north-america" → "North America").
 */
export async function getRegionBySlug(slug: string): Promise<string | undefined> {
    const regions = await getAllRegions();
    return regions.find((region) => regionSlug(region) === slug);
}

/**
 * Get detailed countries by region (continent).
 * Useful for the region detail page.
 */
export async function getCountriesByRegion(region: string): Promise<CountryIndexEntry[]> {
    const index = await getCountryIndex();
    // Case-insensitive comparison
    return index.filter((c) => c.continent.toLowerCase() === region.toLowerCase());
}
