import { readFile, readdir } from 'fs/promises';
import path from 'path';
import type { CountryLocaleData, CountryIndexEntry } from '@/types/country';

const DATA_DIR = path.join(process.cwd(), 'data', 'countries');
const INDEX_PATH = path.join(process.cwd(), 'data', '_index_countries.json');

/**
 * Load a single country's full data by alpha-2 code.
 * This is called at build time during SSG.
 * @param code - ISO 3166-1 alpha-2 code (e.g., "TR", "US")
 */
export async function getCountry(code: string): Promise<CountryLocaleData | null> {
    try {
        const filePath = path.join(DATA_DIR, `${code.toUpperCase()}.json`);
        const raw = await readFile(filePath, 'utf-8');
        return JSON.parse(raw) as CountryLocaleData;
    } catch (error) {
        console.error(`Failed to load country data for ${code}:`, error);
        return null;
    }
}

/**
 * Load all country codes (for generateStaticParams).
 * Returns an array of ISO 3166-1 alpha-2 codes.
 */
export async function getAllCountryCodes(): Promise<string[]> {
    try {
        const files = await readdir(DATA_DIR);
        return files.filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
    } catch (error) {
        console.error('Failed to load country codes:', error);
        return [];
    }
}

/**
 * Load the lightweight index for the grid page.
 * Contains minimal data for all countries.
 */
export async function getCountryIndex(): Promise<CountryIndexEntry[]> {
    try {
        const raw = await readFile(INDEX_PATH, 'utf-8');
        return JSON.parse(raw) as CountryIndexEntry[];
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            console.error('Failed to load country index:', error);
        }
        return [];
    }
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
 * Get detailed countries by region (continent).
 * Useful for the region detail page.
 */
export async function getCountriesByRegion(region: string): Promise<CountryIndexEntry[]> {
    const index = await getCountryIndex();
    // Case-insensitive comparison
    return index.filter((c) => c.continent.toLowerCase() === region.toLowerCase());
}
