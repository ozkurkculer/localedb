/**
 * Derivations from the Unicode CLDR JSON data downloaded by `update-data` into
 * data/cldr/cldr-json. Everything here is keyed by ISO 3166-1 alpha-2 region
 * codes or CLDR locale ids.
 */
import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw, untyped CLDR JSON
type Json = Record<string, any>;

const CONTINENT_BY_M49: Record<string, string> = {
    '002': 'Africa',
    '142': 'Asia',
    '150': 'Europe',
    '009': 'Oceania',
    '005': 'South America',
    '013': 'North America', // Central America
    '021': 'North America', // Northern America
    '029': 'North America', // Caribbean
};

const OFFICIAL_STATUSES = new Set(['official', 'de_facto_official']);

export interface CldrLanguageCodes {
    iso639_2: string;
    iso639_3: string;
}

export class Cldr {
    private readonly root: string;
    private readonly cache = new Map<string, Json | undefined>();

    private readonly likely: Record<string, string>;
    private readonly territoryInfo: Json;
    private readonly territoryCodes: Json;
    private readonly currencyCodes: Json;
    private readonly currencyRegions: Json;
    private readonly fractions: Json;
    private readonly parents = new Map<string, string[]>();
    private readonly languageCodes = new Map<string, CldrLanguageCodes>();

    constructor(root: string) {
        this.root = root;
        const supplemental = (name: string) => this.read(`cldr-core/supplemental/${name}.json`)?.supplemental ?? {};

        this.likely = supplemental('likelySubtags').likelySubtags ?? {};
        this.territoryInfo = supplemental('territoryInfo').territoryInfo ?? {};
        const mappings = supplemental('codeMappings').codeMappings ?? {};
        this.territoryCodes = mappings;
        this.currencyCodes = mappings;
        const currencyData = supplemental('currencyData').currencyData ?? {};
        this.currencyRegions = currencyData.region ?? {};
        this.fractions = currencyData.fractions ?? {};

        // Region tree (UN M49). Skip political groupings like EU or UN.
        const containment = supplemental('territoryContainment').territoryContainment ?? {};
        for (const [group, value] of Object.entries<Json>(containment)) {
            if (!/^\d{3}$/.test(group) && group !== 'QO') continue;
            for (const child of value._contains ?? []) {
                this.parents.set(child, [...(this.parents.get(child) ?? []), group]);
            }
        }

        // ISO 639-2/3 codes: "tur" -> "tr" is an overlong alias, "ger" -> "de" a bibliographic one.
        const aliases = supplemental('aliases')?.metadata?.alias?.languageAlias ?? {};
        const terminologic = new Map<string, string>();
        const bibliographic = new Map<string, string>();
        for (const [alias, { _reason, _replacement }] of Object.entries<Json>(aliases)) {
            if (alias.length !== 3 || !/^[a-z]{2,3}$/.test(_replacement)) continue;
            if (_reason === 'overlong' && !terminologic.has(_replacement)) terminologic.set(_replacement, alias);
            if (_reason === 'bibliographic') bibliographic.set(_replacement, alias);
        }
        for (const [code, iso639_3] of terminologic) {
            this.languageCodes.set(code, { iso639_3, iso639_2: bibliographic.get(code) ?? iso639_3 });
        }
    }

    private read(relativePath: string): Json | undefined {
        if (this.cache.has(relativePath)) return this.cache.get(relativePath);
        let value: Json | undefined;
        try {
            value = JSON.parse(fs.readFileSync(path.join(this.root, relativePath), 'utf-8'));
        } catch {
            value = undefined;
        }
        this.cache.set(relativePath, value);
        return value;
    }

    /** Whether CLDR ships data for this locale (checked on the dates package). */
    hasLocale(locale: string): boolean {
        return fs.existsSync(path.join(this.root, 'cldr-dates-full', 'main', locale));
    }

    /** Likely language + script for a region, e.g. TR -> { language: "tr", script: "Latn" }. */
    likelyLanguage(region: string): { language: string; script?: string } {
        const tag = this.likely[`und-${region}`];
        if (tag) {
            const [language, script] = tag.split('-');
            return { language, script: /^[A-Z][a-z]{3}$/.test(script) ? script : undefined };
        }
        const [first] = this.officialLanguages(region);
        return { language: first?.code ?? 'en' };
    }

    /** Population estimate from CLDR territory info. */
    population(region: string): number {
        return Number(this.territoryInfo[region]?._population) || 0;
    }

    /** Official (or de facto official) languages of a region, most widely spoken first. */
    officialLanguages(region: string): { code: string; script?: string; populationPercent: number }[] {
        const populations = this.territoryInfo[region]?.languagePopulation ?? {};
        const seen = new Set<string>();
        return Object.entries<Json>(populations)
            .filter(([, info]) => OFFICIAL_STATUSES.has(info._officialStatus))
            .map(([id, info]) => {
                const [code, script] = id.split('_');
                return { code, script, populationPercent: Number(info._populationPercent) || 0 };
            })
            .sort((a, b) => b.populationPercent - a.populationPercent)
            .filter(({ code }) => !seen.has(code) && seen.add(code));
    }

    /**
     * Most specific CLDR locale for a language in a region:
     * zh + Hant + TW -> "zh-Hant-TW"?, "zh-Hant", "zh-TW"?, "zh"; falls back to "en".
     */
    localeFor(language: string, region: string, script?: string): string {
        const candidates = [
            script && `${language}-${script}-${region}`,
            script && `${language}-${script}`,
            `${language}-${region}`,
            language,
        ].filter(Boolean) as string[];
        return candidates.find((locale) => this.hasLocale(locale)) ?? 'en';
    }

    /**
     * Continent name used by the site, derived from the UN M49 region tree.
     * A region can sit in several groups (East Africa is in both Africa and
     * Sub-Saharan Africa), so the tree is searched breadth-first.
     */
    continent(region: string): string {
        if (region === 'AQ') return 'Antarctica';
        const queue = [region];
        const seen = new Set(queue);
        while (queue.length) {
            const node = queue.shift()!;
            if (CONTINENT_BY_M49[node]) return CONTINENT_BY_M49[node];
            for (const parent of this.parents.get(node) ?? []) {
                if (!seen.has(parent)) {
                    seen.add(parent);
                    queue.push(parent);
                }
            }
        }
        return '';
    }

    /**
     * CLDR only lists a FIPS 10-4 code when it differs from the alpha-2 code (GB -> UK).
     * User-assigned codes (X*, e.g. XK Kosovo) have no such equivalence.
     */
    territoryCode(region: string): { numeric?: string; alpha3?: string; fips10: string } {
        const entry = this.territoryCodes[region] ?? {};
        return { numeric: entry._numeric, alpha3: entry._alpha3, fips10: entry._fips10 ?? (region.startsWith('X') ? '' : region) };
    }

    /** Current legal tender of a region, e.g. TR -> "TRY". */
    currency(region: string): string | undefined {
        for (const entry of this.currencyRegions[region] ?? []) {
            const [[code, info]] = Object.entries<Json>(entry);
            if (!info._to && info._tender !== 'false') return code;
        }
        return undefined;
    }

    currencyNumericCode(code: string): number | undefined {
        const numeric = Number(this.currencyCodes[code]?._numeric);
        return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
    }

    /** Minor unit digits, e.g. EUR -> 2, JPY -> 0. */
    currencyDigits(code: string): number {
        return Number((this.fractions[code] ?? this.fractions.DEFAULT)?._digits ?? 2);
    }

    currencyNames(locale: string, code: string): Json | undefined {
        return this.read(`cldr-numbers-full/main/${locale}/currencies.json`)?.main?.[locale]?.numbers?.currencies?.[code];
    }

    territoryName(locale: string, region: string): string | undefined {
        return this.read(`cldr-localenames-full/main/${locale}/territories.json`)?.main?.[locale]?.localeDisplayNames?.territories?.[region];
    }

    languageName(locale: string, language: string): string | undefined {
        return this.read(`cldr-localenames-full/main/${locale}/languages.json`)?.main?.[locale]?.localeDisplayNames?.languages?.[language];
    }

    /** ISO 639-2 (bibliographic where one exists) and 639-3 codes for a CLDR language code. */
    languageCodesFor(code: string): CldrLanguageCodes {
        return this.languageCodes.get(code) ?? { iso639_2: code, iso639_3: code };
    }

    direction(locale: string): 'ltr' | 'rtl' {
        const order = this.read(`cldr-misc-full/main/${locale}/layout.json`)?.main?.[locale]?.layout?.orientation?.characterOrder;
        return order === 'right-to-left' ? 'rtl' : 'ltr';
    }
}
