/**
 * Country identifiers from Wikidata (CC0), fetched by `update-data wikidata`
 * into data/wikidata/countries.json as raw SPARQL JSON results.
 */
import fs from 'fs';

/**
 * One row per ISO 3166-1 alpha-2 code. Multi-valued properties are
 * concatenated with "|" to avoid cross-product rows. Items that no longer
 * exist (P576 "dissolved") are skipped.
 */
export const WIKIDATA_COUNTRY_QUERY = `
SELECT ?iso
  (GROUP_CONCAT(DISTINCT ?fifa; separator="|") AS ?fifas)
  (GROUP_CONCAT(DISTINCT ?vehicle; separator="|") AS ?vehicles)
  (GROUP_CONCAT(DISTINCT ?itu; separator="|") AS ?itus)
  (GROUP_CONCAT(DISTINCT ?uic; separator="|") AS ?uics)
  (GROUP_CONCAT(DISTINCT ?mid; separator="|") AS ?mids)
  (GROUP_CONCAT(DISTINCT ?mcc; separator="|") AS ?mccs)
  (GROUP_CONCAT(DISTINCT ?fips; separator="|") AS ?fipss)
  (GROUP_CONCAT(DISTINCT ?drivingSideLabel; separator="|") AS ?drivingSides)
  (GROUP_CONCAT(DISTINCT CONCAT(?capitalLabel, "@", STR(?capitalCoord)); separator="|") AS ?capitals)
WHERE {
  ?country wdt:P297 ?iso .
  FILTER NOT EXISTS { ?country wdt:P576 ?dissolved }
  OPTIONAL { ?country wdt:P3441 ?fifa }
  OPTIONAL { ?country wdt:P395 ?vehicle }
  OPTIONAL { ?country wdt:P3024 ?itu }
  OPTIONAL { ?country wdt:P2982 ?uic }
  OPTIONAL { ?country wdt:P2979 ?mid }
  OPTIONAL { ?country wdt:P2258 ?mcc }
  OPTIONAL { ?country wdt:P901 ?fips }
  OPTIONAL { ?country wdt:P1622 ?drivingSide . ?drivingSide rdfs:label ?drivingSideLabel . FILTER(LANG(?drivingSideLabel) = "en") }
  OPTIONAL { ?country wdt:P36 ?capital . ?capital wdt:P625 ?capitalCoord ; rdfs:label ?capitalLabel . FILTER(LANG(?capitalLabel) = "en") }
}
GROUP BY ?iso
`;

export interface WikidataCountry {
    fifa?: string;
    vehicleCode?: string;
    itu?: string;
    uic?: string;
    maritime?: number;
    mcc?: number;
    fips10?: string;
    drivingSide?: 'left' | 'right';
    capitals: { name: string; latitude: number; longitude: number }[];
}

const values = (binding: Record<string, { value: string }>, key: string) =>
    (binding[key]?.value ?? '').split('|').map((v) => v.trim()).filter(Boolean);

const smallestNumber = (list: string[]) => {
    const numbers = list.map(Number).filter(Number.isFinite);
    return numbers.length ? Math.min(...numbers) : undefined;
};

/** "Point(32.85 39.93)" (WKT, longitude first) -> [latitude, longitude] */
function parsePoint(wkt: string): [number, number] | undefined {
    const match = wkt.match(/Point\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)/i);
    return match ? [Number(match[2]), Number(match[1])] : undefined;
}

export function parseWikidataCountries(json: { results?: { bindings?: Record<string, { value: string }>[] } }): Map<string, WikidataCountry> {
    const byCode = new Map<string, WikidataCountry>();
    for (const binding of json.results?.bindings ?? []) {
        const iso = binding.iso?.value?.toUpperCase();
        if (!iso || !/^[A-Z]{2}$/.test(iso)) continue;

        const sides = values(binding, 'drivingSides').map((s) => s.toLowerCase());
        const capitals = values(binding, 'capitals').flatMap((entry) => {
            const at = entry.lastIndexOf('@');
            const point = parsePoint(entry.slice(at + 1));
            return point ? [{ name: entry.slice(0, at), latitude: point[0], longitude: point[1] }] : [];
        });

        byCode.set(iso, {
            fifa: values(binding, 'fifas')[0],
            vehicleCode: values(binding, 'vehicles').sort((a, b) => a.length - b.length)[0],
            itu: values(binding, 'itus')[0],
            uic: values(binding, 'uics')[0],
            maritime: smallestNumber(values(binding, 'mids')),
            mcc: smallestNumber(values(binding, 'mccs')),
            fips10: values(binding, 'fipss')[0],
            // Only when unambiguous ("left-hand traffic" / "right-hand traffic").
            drivingSide:
                sides.length && sides.every((s) => s.includes('left')) ? 'left'
                : sides.length && sides.every((s) => s.includes('right')) ? 'right'
                : undefined,
            capitals,
        });
    }
    return byCode;
}

export class Wikidata {
    private readonly countries: Map<string, WikidataCountry>;

    constructor(path: string) {
        this.countries = fs.existsSync(path) ? parseWikidataCountries(JSON.parse(fs.readFileSync(path, 'utf-8'))) : new Map();
    }

    get size(): number {
        return this.countries.size;
    }

    get(region: string): WikidataCountry | undefined {
        return this.countries.get(region);
    }

    /** Coordinates of the capital named `capital`, or of the only capital listed. */
    capitalCoordinates(region: string, capital: string): [number, number] | undefined {
        const capitals = this.countries.get(region)?.capitals ?? [];
        const match = capitals.find((c) => c.name.toLowerCase() === capital.toLowerCase()) ?? (capitals.length === 1 ? capitals[0] : undefined);
        return match ? [match.latitude, match.longitude] : undefined;
    }
}
