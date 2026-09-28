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

/**
 * FIFA codes live on national football federations and teams, not on the
 * country. Federations (Q1478443) are the authoritative holders; team items fill
 * in where a federation lacks the code (Germany) and cover territories filed
 * under their sovereign state (Hong Kong -> China). See `fifaCode()`.
 */
export const WIKIDATA_FIFA_FEDERATION_QUERY = `
SELECT ?iso (GROUP_CONCAT(DISTINCT ?fifa; separator="|") AS ?fifas)
WHERE {
  hint:Query hint:optimizer "None" .
  ?federation wdt:P3441 ?fifa .
  ?federation wdt:P31 wd:Q1478443 .
  ?federation wdt:P17 ?country .
  ?country wdt:P297 ?iso .
}
GROUP BY ?iso
`;

/** All items with a FIFA code (~1,800), in that order for the query planner. */
export const WIKIDATA_FIFA_QUERY = `
SELECT ?iso (GROUP_CONCAT(DISTINCT ?fifa; separator="|") AS ?fifas)
WHERE {
  hint:Query hint:optimizer "None" .
  ?item wdt:P3441 ?fifa .
  ?item wdt:P17 ?country .
  ?country wdt:P297 ?iso .
}
GROUP BY ?iso
`;

/** English names of currency subdivisions, by ISO 4217 code (P498 -> P9059). */
export const WIKIDATA_CURRENCY_QUERY = `
SELECT ?code (GROUP_CONCAT(DISTINCT ?subunitLabel; separator="|") AS ?subunits)
WHERE {
  ?currency wdt:P498 ?code ; wdt:P9059 ?subunit .
  ?subunit rdfs:label ?subunitLabel . FILTER(LANG(?subunitLabel) = "en")
}
GROUP BY ?code
`;

type WikidataJson = { results?: { bindings?: Record<string, { value: string }>[] } };

export interface WikidataCountry {
    /** FIFA codes of the country's football federations (authoritative); see `fifaCode()`. */
    fifaFederationCodes: string[];
    /** FIFA codes of any federation or team attached to the country. */
    fifaCodes: string[];
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
            fifaFederationCodes: [],
            fifaCodes: [],
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

/** Adds FIFA codes (federations and all items) to the parsed countries. */
export function mergeFifaCodes(countries: Map<string, WikidataCountry>, federations: WikidataJson, items: WikidataJson): void {
    for (const [json, key] of [[federations, 'fifaFederationCodes'], [items, 'fifaCodes']] as const) {
        for (const binding of json.results?.bindings ?? []) {
            const country = countries.get(binding.iso?.value?.toUpperCase() ?? '');
            if (country) country[key] = values(binding, 'fifas');
        }
    }
}

export function parseWikidataCurrencies(json: { results?: { bindings?: Record<string, { value: string }>[] } }): Map<string, string[]> {
    const byCode = new Map<string, string[]>();
    for (const binding of json.results?.bindings ?? []) {
        const code = binding.code?.value?.toUpperCase();
        if (code && /^[A-Z]{3}$/.test(code)) byCode.set(code, values(binding, 'subunits'));
    }
    return byCode;
}

const readJson = (path: string) => (fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf-8')) : {});

export class Wikidata {
    private readonly countries: Map<string, WikidataCountry>;
    private readonly currencies: Map<string, string[]>;

    constructor(dir: string) {
        this.countries = parseWikidataCountries(readJson(`${dir}/countries.json`));
        mergeFifaCodes(this.countries, readJson(`${dir}/fifa-federations.json`), readJson(`${dir}/fifa.json`));
        this.currencies = parseWikidataCurrencies(readJson(`${dir}/currencies.json`));
    }

    /** Subunit names of a currency; several when Wikidata lists more than one. */
    currencySubunits(code: string): string[] {
        return this.currencies.get(code) ?? [];
    }

    get size(): number {
        return this.countries.size;
    }

    get(region: string): WikidataCountry | undefined {
        return this.countries.get(region);
    }

    /**
     * The country's FIFA code. Federations are authoritative: one federation
     * code wins; several (the UK has four) resolve only through the IOC or ISO
     * alpha-3 code, else none. Without a federation, fall back to team items,
     * which also covers territories filed under their sovereign state (Hong
     * Kong's HKG sits under China).
     *
     * `ownCodes` are this country's IOC/alpha-3 codes; `otherCodes` those of all
     * other countries. A code belonging to another country is never taken, which
     * guards against mis-attributed items (a federation filed under the wrong
     * country).
     */
    fifaCode(region: string, ownCodes: string[], otherCodes: Set<string>): string | undefined {
        const country = this.countries.get(region);
        const valid = (codes: string[] = []) => codes.filter((code) => ownCodes.includes(code) || !otherCodes.has(code));
        const preferred = (codes: string[]) => codes.find((code) => ownCodes.includes(code));

        const federations = valid(country?.fifaFederationCodes);
        if (federations.length === 1) return federations[0];
        if (federations.length > 1) return preferred(federations);

        const own = valid(country?.fifaCodes);
        if (preferred(own)) return preferred(own);
        if (own.length === 1) return own[0];
        return preferred([...this.countries.values()].flatMap((c) => c.fifaCodes));
    }

    /** Coordinates of the capital named `capital`, or of the only capital listed. */
    capitalCoordinates(region: string, capital: string): [number, number] | undefined {
        const capitals = this.countries.get(region)?.capitals ?? [];
        const match = capitals.find((c) => c.name.toLowerCase() === capital.toLowerCase()) ?? (capitals.length === 1 ? capitals[0] : undefined);
        return match ? [match.latitude, match.longitude] : undefined;
    }
}
