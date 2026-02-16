
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

// Types
import { CountryLocaleData, CountryBasics, CodeSystems, DateTimeInfo, NumberFormatInfo, PhoneInfo, PhoneNumberFormat, PhoneNumberType, AddressFormatInfo, LocaleMiscInfo, CountryIndexEntry } from '../src/types/country';
import { CurrencyInfo, CurrencyLocaleData, CurrencyIndexEntry } from '../src/types/currency';
import { Language, LanguageLocaleData, LanguageIndexEntry } from '../src/types/language';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_COUNTRIES_DIR = path.join(DATA_DIR, 'countries');
const OUT_LANGUAGES_DIR = path.join(DATA_DIR, 'languages');
const OUT_CURRENCIES_DIR = path.join(DATA_DIR, 'currencies');
const OVERRIDES_DIR = path.join(DATA_DIR, 'overrides');

// Ensure output directories exist
if (!fs.existsSync(OUT_COUNTRIES_DIR)) fs.mkdirSync(OUT_COUNTRIES_DIR, { recursive: true });
if (!fs.existsSync(OUT_LANGUAGES_DIR)) fs.mkdirSync(OUT_LANGUAGES_DIR, { recursive: true });
if (!fs.existsSync(OUT_CURRENCIES_DIR)) fs.mkdirSync(OUT_CURRENCIES_DIR, { recursive: true });

// --- Helper Functions ---

async function readJsonFile(filePath: string): Promise<any> {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        return undefined;
    }
}

// Helper to safely read CLDR data
async function readCldrData(cldrPath: string, ...keys: string[]): Promise<any> {
    const fullPath = path.join(DATA_DIR, 'cldr', 'cldr-json', cldrPath);
    try {
        if (!fs.existsSync(fullPath)) return undefined;
        const data = await readJsonFile(fullPath);
        let current = data;
        for (const key of keys) {
            if (current === undefined || current === null) return undefined;
            current = current[key];
        }
        return current;
    } catch (error) {
        return undefined;
    }
}

function deepMerge(target: any, source: any) {
    if (typeof target !== 'object' || target === null) return source;
    if (typeof source !== 'object' || source === null) return source;

    for (const key in source) {
        if (source[key] instanceof Array) {
            target[key] = source[key];
        } else if (typeof source[key] === 'object') {
            target[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

function safeFormatCurrency(locale: string, currency: string, value: number, options: Intl.NumberFormatOptions = {}): string {
    if (!currency) return "";
    try {
        return new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(value);
    } catch (e) {
        return "";
    }
}

// CSV Parser for World Bank / Airports
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let currentChange = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(currentChange);
            currentChange = '';
        } else {
            currentChange += char;
        }
    }
    result.push(currentChange);
    return result.map(val => {
        val = val.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/""/g, '"');
        }
        return val;
    });
}

// --- Specific Data Loaders ---

interface WorldBankData {
    population?: number;
    region?: string;
    incomeGroup?: string;
}

async function loadWorldBankData(): Promise<Map<string, WorldBankData>> {
    const wbDataMap = new Map<string, WorldBankData>();
    const wbDir = path.join(DATA_DIR, 'worldbankgroup');
    if (!fs.existsSync(wbDir)) return wbDataMap;

    const files = await fs.promises.readdir(wbDir);
    const popFile = files.find(f => f.startsWith('API_SP.POP.TOTL') && f.endsWith('.csv'));
    const metaFile = files.find(f => f.startsWith('Metadata_Country') && f.endsWith('.csv'));

    if (popFile) {
        console.log('  Matching World Bank Population:', popFile);
        const content = await fs.promises.readFile(path.join(wbDir, popFile), 'utf-8');
        const lines = content.split('\n');
        // WB CSV usually starts at line 5 (0-indexed 4)
        if (lines.length > 5) {
            const header = parseCsvLine(lines[4]);
            const codeIdx = header.indexOf('Country Code');
            // Find 2023, 2022, etc.
            let yearIdx = header.lastIndexOf('2023');
            if (yearIdx === -1) yearIdx = header.lastIndexOf('2022');
            if (yearIdx === -1) yearIdx = header.lastIndexOf('2021');

            if (codeIdx !== -1 && yearIdx !== -1) {
                for (let i = 5; i < lines.length; i++) {
                    const cols = parseCsvLine(lines[i]);
                    const code = cols[codeIdx];
                    const pop = parseInt(cols[yearIdx]);
                    if (code && !isNaN(pop)) {
                        if (!wbDataMap.has(code)) wbDataMap.set(code, {});
                        wbDataMap.get(code)!.population = pop;
                    }
                }
            }
        }
    }

    if (metaFile) {
        console.log('  Matching World Bank Metadata:', metaFile);
        const content = await fs.promises.readFile(path.join(wbDir, metaFile), 'utf-8');
        const lines = content.split('\n');
        if (lines.length > 0) {
            const header = parseCsvLine(lines[0]);
            const codeIdx = header.indexOf('Country Code');
            const regionIdx = header.indexOf('Region');
            const incomeIdx = header.indexOf('IncomeGroup');

            if (codeIdx !== -1) {
                for (let i = 1; i < lines.length; i++) {
                    const cols = parseCsvLine(lines[i]);
                    const code = cols[codeIdx];
                    if (code) {
                        if (!wbDataMap.has(code)) wbDataMap.set(code, {});
                        const entry = wbDataMap.get(code)!;
                        if (regionIdx !== -1 && cols[regionIdx]) entry.region = cols[regionIdx];
                        if (incomeIdx !== -1 && cols[incomeIdx]) entry.incomeGroup = cols[incomeIdx];
                    }
                }
            }
        }
    }

    return wbDataMap;
}

// --- Libphonenumber Loader ---

interface PhoneTerritory {
    countryCode: string;
    nationalPrefix: string;
    internationalPrefix: string;
    generalPattern: string;
    formats: PhoneNumberFormat[];
    types: {
        fixedLine?: PhoneNumberType;
        mobile?: PhoneNumberType;
        tollFree?: PhoneNumberType;
        premiumRate?: PhoneNumberType;
        sharedCost?: PhoneNumberType;
        voip?: PhoneNumberType;
        uan?: PhoneNumberType;
    };
}

function parsePossibleLengths(el: any): number[] {
    if (!el) return [];
    const nat = el['@_national'] || '';
    return nat.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
}

function parsePhoneType(el: any): PhoneNumberType | undefined {
    if (!el) return undefined;
    const pattern = typeof el.nationalNumberPattern === 'string'
        ? el.nationalNumberPattern.replace(/\s+/g, '') : '';
    const exampleNumber = el.exampleNumber || '';
    const possibleLengths = parsePossibleLengths(el.possibleLengths);
    return { pattern, exampleNumber: String(exampleNumber), possibleLengths };
}

async function loadLibphonenumber(): Promise<Map<string, PhoneTerritory>> {
    const xmlPath = path.join(DATA_DIR, 'libphonenumber', 'PhoneNumberMetadata.xml');
    const map = new Map<string, PhoneTerritory>();

    if (!fs.existsSync(xmlPath)) {
        console.warn('⚠️  Libphonenumber XML not found, skipping phone metadata');
        return map;
    }

    const xmlContent = await fs.promises.readFile(xmlPath, 'utf-8');
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        isArray: (name: string) => ['territory', 'numberFormat', 'leadingDigits', 'intlFormat'].includes(name),
        trimValues: true,
    });

    const parsed = parser.parse(xmlContent);
    const territories = parsed?.phoneNumberMetadata?.territories?.territory || [];

    for (const t of territories) {
        const id = t['@_id'];
        if (!id || id === '001') continue; // Skip non-geo entities

        // Parse formats
        const rawFormats = t.availableFormats?.numberFormat || [];
        const formats: PhoneNumberFormat[] = rawFormats.map((nf: any) => {
            const leadingDigits = nf.leadingDigits
                ? (Array.isArray(nf.leadingDigits) ? nf.leadingDigits : [nf.leadingDigits])
                    .map((ld: any) => String(ld).replace(/\s+/g, ''))
                : undefined;
            const intlFormatRaw = nf.intlFormat;
            let intlFormat: string | undefined;
            if (intlFormatRaw) {
                const intlVal = Array.isArray(intlFormatRaw) ? intlFormatRaw[0] : intlFormatRaw;
                if (intlVal !== 'NA') intlFormat = String(intlVal);
            }
            return {
                pattern: nf['@_pattern'] || '',
                format: String(nf.format || ''),
                leadingDigits,
                intlFormat,
                nationalPrefixRule: nf['@_nationalPrefixFormattingRule'] || undefined,
            };
        });

        // Parse general pattern
        const generalPattern = t.generalDesc?.nationalNumberPattern
            ? String(t.generalDesc.nationalNumberPattern).replace(/\s+/g, '')
            : '';

        const territory: PhoneTerritory = {
            countryCode: t['@_countryCode'] || '',
            nationalPrefix: t['@_nationalPrefix'] || '',
            internationalPrefix: t['@_internationalPrefix'] || '',
            generalPattern,
            formats,
            types: {
                fixedLine: parsePhoneType(t.fixedLine),
                mobile: parsePhoneType(t.mobile),
                tollFree: parsePhoneType(t.tollFree),
                premiumRate: parsePhoneType(t.premiumRate),
                sharedCost: parsePhoneType(t.sharedCost),
                voip: parsePhoneType(t.voip),
                uan: parsePhoneType(t.uan),
            },
        };

        map.set(id, territory);
    }

    return map;
}

// Helper: format a phone example number using the first matching format pattern
function formatExampleNumber(phoneMeta: PhoneTerritory): string {
    const example = phoneMeta.types.mobile?.exampleNumber || phoneMeta.types.fixedLine?.exampleNumber || '';
    if (!example || phoneMeta.formats.length === 0) {
        return `+${phoneMeta.countryCode} ${example}`;
    }

    // Try to match a format pattern
    for (const fmt of phoneMeta.formats) {
        try {
            const regex = new RegExp(`^${fmt.pattern}$`);
            if (regex.test(example)) {
                // If intlFormat exists, use it generally (it usually doesn't have national prefix)
                if (fmt.intlFormat && fmt.intlFormat !== 'NA') {
                    return `+${phoneMeta.countryCode} ` + example.replace(regex, fmt.intlFormat);
                }

                // Otherwise use the standard format, but DO NOT apply national prefix for international numbers
                // Libphonenumber strips national prefix for international formatting
                return `+${phoneMeta.countryCode} ` + example.replace(regex, fmt.format);
            }
        } catch { /* regex might be invalid, skip */ }
    }

    return `+${phoneMeta.countryCode} ${example}`;
}

// --- Main Build Process ---

async function build() {
    console.log('🚀 Starting Data Build Process (Prioritized)...');
    const startTime = Date.now();

    // 1. Loading Base Data
    console.log('📦 Loading SimpleLocalize (Base)...');
    const slCountries = await readJsonFile(path.join(DATA_DIR, 'simplelocalize/countries.json')) || [];
    const slLanguages = await readJsonFile(path.join(DATA_DIR, 'simplelocalize/languages.json')) || [];

    console.log('📦 Loading Mledoze (Layer 1)...');
    const mledozeList = await readJsonFile(path.join(DATA_DIR, 'mledoze.json')) || [];
    const mledozeMap = new Map();
    mledozeList.forEach((c: any) => mledozeMap.set(c.cca2, c));
    mledozeList.forEach((c: any) => mledozeMap.set(c.cca3, c)); // Support iso3 lookup

    console.log('📦 Loading World Bank (Layer 2)...');
    const wbDataMap = await loadWorldBankData();

    console.log('📞 Loading Libphonenumber (Phone Metadata)...');
    const phoneMetaMap = await loadLibphonenumber();
    console.log(`   Loaded phone metadata for ${phoneMetaMap.size} territories`);

    // 2. Process Airports (Priority: mwgg > iata)
    console.log(`✈️  Processing airports...`);
    const airportsMap = new Map<string, any[]>();
    const airportIndex: any[] = [];

    const airportsJsonPath = path.join(DATA_DIR, 'airports.json');
    const airportsCsvPath = path.join(DATA_DIR, 'airports.csv');

    // Index CSV airports by ICAO/IATA for merging
    const csvAirportsByIcao = new Map<string, any>();
    const csvAirportsByIata = new Map<string, any>();

    // 2a. Load CSV (Secondary Keyed)
    if (fs.existsSync(airportsCsvPath)) {
        console.log('  Index Airport CSV (Backup)...');
        const csvContent = await fs.promises.readFile(airportsCsvPath, 'utf-8');
        const lines = csvContent.split('\n').slice(1);
        lines.forEach(line => {
            // "country_code","region_name","iata","icao","airport","latitude","longitude"
            const parts = parseCsvLine(line);
            if (parts.length < 7) return;
            const countryCode = parts[0];
            if (!countryCode) return;

            const airport = {
                countryCode,
                region: parts[1],
                iata: parts[2],
                icao: parts[3],
                name: parts[4],
                latitude: parseFloat(parts[5]),
                longitude: parseFloat(parts[6]),
                source: 'iata_csv'
            };

            if (airport.name) {
                if (airport.icao) csvAirportsByIcao.set(airport.icao, airport);
                if (airport.iata) csvAirportsByIata.set(airport.iata, airport);
            }
        });
    }

    // Haversine formula to calculate distance in km
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // 2b. Process JSON (Primary) and Merge
    if (fs.existsSync(airportsJsonPath)) {
        console.log('  Merging with Airport JSON (Primary)...');
        const mwggData = await readJsonFile(airportsJsonPath);

        // Convert map to array for spatial search on unmatched items
        // This is a bit expensive but necessary for fallback
        // We track matched CSV IDs to avoid double usage
        const matchedCsvIds = new Set<string>();

        Object.values(mwggData).forEach((entry: any) => {
            const jsonAirport = {
                countryCode: entry.country,
                region: entry.state || entry.city,
                iata: entry.iata,
                icao: entry.icao,
                name: entry.name,
                latitude: entry.lat,
                longitude: entry.lon,
                timezone: entry.tz,
                source: 'mwgg_json'
            };

            let csvAirport = null;
            let matchType = 'none';

            // 1. Try Key Match (ICAO/IATA)
            if (jsonAirport.icao && csvAirportsByIcao.has(jsonAirport.icao)) {
                csvAirport = csvAirportsByIcao.get(jsonAirport.icao);
                matchType = 'key';
            } else if (jsonAirport.iata && csvAirportsByIata.has(jsonAirport.iata)) {
                csvAirport = csvAirportsByIata.get(jsonAirport.iata);
                matchType = 'key';
            }

            // 2. Try Spatial Match (Fallback)
            // If no key match, check unmatched CSV airports in same country within 1km
            if (!csvAirport) {
                // Optimization: iterate only relevant subset if we pre-grouped, but here we just iterate
                // We can optimize by simple range check first
                for (const candidate of csvAirportsByIcao.values()) {
                    // Skip if this CSV airport was already matched/used
                    if (matchedCsvIds.has(candidate.icao || candidate.iata)) continue;
                    if (candidate.countryCode !== jsonAirport.countryCode) continue;

                    // Fast bounding box check (approx 0.05 deg ~ 5km)
                    if (Math.abs(candidate.latitude - jsonAirport.latitude) > 0.05) continue;
                    if (Math.abs(candidate.longitude - jsonAirport.longitude) > 0.05) continue;

                    const dist = calculateDistance(
                        jsonAirport.latitude, jsonAirport.longitude,
                        candidate.latitude, candidate.longitude
                    );

                    if (dist < 1.0) { // 1km threshold
                        csvAirport = candidate;
                        matchType = 'spatial';
                        break;
                    }
                }
                // Try candidates that might only have IATA and thus only in byIata map?
                // The csvAirportsByIcao and byIata might share references or contain unique sets if one code missing
                // We need to check unmatched from both maps safely.
                // Actually the values are objects. We can track visited via Set<Object>
                if (!csvAirport) {
                    for (const candidate of csvAirportsByIata.values()) {
                        if (matchedCsvIds.has(candidate.icao || candidate.iata)) continue;
                        if (csvAirportsByIcao.has(candidate.icao)) continue; // already checked in loop above if it has ICAO

                        if (candidate.countryCode !== jsonAirport.countryCode) continue;
                        if (Math.abs(candidate.latitude - jsonAirport.latitude) > 0.05) continue;
                        if (Math.abs(candidate.longitude - jsonAirport.longitude) > 0.05) continue;

                        const dist = calculateDistance(
                            jsonAirport.latitude, jsonAirport.longitude,
                            candidate.latitude, candidate.longitude
                        );
                        if (dist < 1.0) {
                            csvAirport = candidate;
                            matchType = 'spatial';
                            break;
                        }
                    }
                }
            }

            // Cleanup Lists based on match
            if (csvAirport) {
                const id = csvAirport.icao || csvAirport.iata;
                matchedCsvIds.add(id);
                // Also clean maps so we don't add them as "remaining" later
                if (csvAirport.icao) csvAirportsByIcao.delete(csvAirport.icao);
                if (csvAirport.iata) csvAirportsByIata.delete(csvAirport.iata);
            }

            // MERGE
            const finalAirport = { ...jsonAirport };

            if (csvAirport) {
                if (!finalAirport.iata && csvAirport.iata) finalAirport.iata = csvAirport.iata;
                if (!finalAirport.icao && csvAirport.icao) finalAirport.icao = csvAirport.icao;
                finalAirport.source = 'merged';
            }

            if (!airportsMap.has(finalAirport.countryCode)) airportsMap.set(finalAirport.countryCode, []);
            airportsMap.get(finalAirport.countryCode)?.push(finalAirport);
        });
    }

    // 2c. Add remaining unique CSV-only airports
    const remainingAirports = new Set<any>();
    for (const a of csvAirportsByIcao.values()) remainingAirports.add(a);
    for (const a of csvAirportsByIata.values()) remainingAirports.add(a);

    console.log(`  Adding ${remainingAirports.size} unique CSV-only airports...`);
    for (const airport of remainingAirports) {
        if (!airportsMap.has(airport.countryCode)) airportsMap.set(airport.countryCode, []);
        airportsMap.get(airport.countryCode)?.push(airport);
    }

    // Build Index
    for (const [cc, list] of airportsMap.entries()) {
        list.forEach(a => {
            if (a.iata) {
                // simple dedupe check for index? 
                // Map constructed per country shouldn't have dupes if logic is sound.
                airportIndex.push(a);
            }
        });
    }
    airportIndex.sort((a, b) => a.iata.localeCompare(b.iata));
    await fs.promises.writeFile(path.join(DATA_DIR, '_index_airports.json'), JSON.stringify(airportIndex, null, 2));


    // 3. Process Countries
    const countryIndex: CountryIndexEntry[] = [];
    const languageIndex: LanguageIndexEntry[] = [];
    const currencyIndex: CurrencyIndexEntry[] = [];
    const languageUsageMap: Record<string, string[]> = {};
    const currencyUsageMap: Record<string, string[]> = {};
    const currencyInfoMap: Record<string, CurrencyInfo> = {};

    console.log(`🌍 Processing ${slCountries.length} countries...`);
    const BATCH_SIZE = 10;
    for (let i = 0; i < slCountries.length; i += BATCH_SIZE) {
        const batch = slCountries.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (slCountry: any) => {
            const isoCode = slCountry.code;
            const mledozeCountry = mledozeMap.get(isoCode);
            // SimpleLocalize usually has iso3, use that for WB lookup
            const iso3 = slCountry.iso_3166_1_alpha3 || mledozeCountry?.cca3;
            const wbData = iso3 ? wbDataMap.get(iso3) : undefined;
            const countryAirports = airportsMap.get(isoCode) || [];

            const phoneMeta = phoneMetaMap.get(isoCode);

            await processCountry(
                isoCode,
                slCountry,
                mledozeCountry,
                wbData,
                countryIndex,
                languageUsageMap,
                currencyUsageMap,
                currencyInfoMap,
                countryAirports,
                phoneMeta
            );
        }));
        if (global.gc) global.gc();
        process.stdout.write(`\r✅ Processed ${Math.min(i + BATCH_SIZE, slCountries.length)}/${slCountries.length} countries`);
    }
    console.log('\n✨ Countries processed.');

    // 4. Languages & Currencies (Same as before)
    console.log(`🗣️ Processing languages...`);
    for (let i = 0; i < slLanguages.length; i += BATCH_SIZE) {
        const batch = slLanguages.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map((lang: any) => processLanguage(lang, languageUsageMap, languageIndex)));
    }

    console.log(`💰 Processing currencies...`);
    const currencyCodes = Object.keys(currencyInfoMap).sort();
    for (const code of currencyCodes) {
        await processCurrency(code, currencyInfoMap[code], currencyUsageMap, currencyIndex);
    }

    // 5. Write Indices
    console.log('📝 Writing indices...');
    await fs.promises.writeFile(path.join(DATA_DIR, '_index_countries.json'), JSON.stringify(countryIndex, null, 2));
    await fs.promises.writeFile(path.join(DATA_DIR, '_index_languages.json'), JSON.stringify(languageIndex, null, 2));
    await fs.promises.writeFile(path.join(DATA_DIR, '_index_currencies.json'), JSON.stringify(currencyIndex, null, 2));

    // 4. Generate Meta File
    console.log(`📊 Generating metadata...`);
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
    const meta = {
        buildDate: new Date().toISOString(),
        version: packageJson.version,
        stats: {
            countries: countryIndex.length,
            languages: languageIndex.length,
            currencies: currencyIndex.length,
            airports: airportIndex.length
        },
        sources: [
            { name: "CLDR", version: "latest" },
            { name: "ICU", version: "latest" },
            { name: "World Bank", year: "2024" },
            { name: "mledoze", version: "latest" },
            { name: "SimpleLocalize", version: "latest" },
            { name: "MWGG Airports", version: "latest" },
            { name: "ip2location (IATA-ICAO CSV)", version: "latest" }
        ]
    };
    await fs.promises.writeFile(path.join(DATA_DIR, '_meta.json'), JSON.stringify(meta, null, 2));

    console.log(`🎉 Build complete in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
}

build().catch(console.error);
async function processCountry(
    isoCode: string,
    slData: any,
    mledozeData: any,
    wbData: WorldBankData | undefined,
    index: CountryIndexEntry[],
    langMap: Record<string, string[]>,
    currencyMap: Record<string, string[]>,
    currencyInfoMap: Record<string, CurrencyInfo>,
    airports: any[],
    phoneMeta: PhoneTerritory | undefined
) {
    const primaryLang = slData.languages?.[0]?.iso_639_1 || 'en';
    const cldrLocale = `${primaryLang}-${isoCode}`;
    let cldrPath = primaryLang;

    // --- CLDR DATA (Highest Priority, with fallback to 'en') ---
    // Check if the primary CLDR locale directory exists, fall back to 'en'
    const cldrDatesDir = path.join(DATA_DIR, 'cldr', 'cldr-json', 'cldr-dates-full', 'main', cldrPath);
    if (!fs.existsSync(cldrDatesDir)) {
        cldrPath = 'en';
    }

    const territories = await readCldrData(`cldr-localenames-full/main/${cldrPath}/territories.json`, "main", cldrPath, "localeDisplayNames", "territories", isoCode);
    const caGregorian = await readCldrData(`cldr-dates-full/main/${cldrPath}/ca-gregorian.json`, "main", cldrPath, "dates", "calendars", "gregorian");
    const numbers = await readCldrData(`cldr-numbers-full/main/${cldrPath}/numbers.json`, "main", cldrPath, "numbers");

    // CLDR supplemental data (weekData for firstDayOfWeek)
    const weekData = await readCldrData('cldr-core/supplemental/weekData.json', 'supplemental', 'weekData');
    const dayPeriods = caGregorian?.dayPeriods?.format?.abbreviated;

    // Construct Currency
    // Priority: SL > Mledoze > Default
    const slCurrencyCode = slData.currency_code;
    const mledozeCurrencyCode = mledozeData?.currencies ? Object.keys(mledozeData.currencies)[0] : undefined;
    const currencyCode = slCurrencyCode || mledozeCurrencyCode;

    let currencyObj: CurrencyInfo = {
        code: currencyCode || "",
        numericCode: slData.currency_numeric || "", // Mledoze doesn't have numeric easily accessible in this structure
        name: slData.currency || mledozeData?.currencies?.[currencyCode]?.name || "",
        nativeName: slData.currency_local || "",
        symbol: slData.currency_symbol || mledozeData?.currencies?.[currencyCode]?.symbol || "",
        narrowSymbol: slData.currency_symbol || mledozeData?.currencies?.[currencyCode]?.symbol || "",
        symbolPosition: "before",
        decimalSeparator: numbers?.["symbols-numberSystem-latn"]?.decimal || ".",
        thousandsSeparator: numbers?.["symbols-numberSystem-latn"]?.group || ",",
        decimalDigits: 2,
        subunitValue: slData.currency_subunit_value || 100,
        subunitName: slData.currency_subunit_name || "", // default
        pattern: numbers?.["currencyFormats-numberSystem-latn"]?.standard || "¤#,##0.00",
        example: safeFormatCurrency(cldrLocale, currencyCode, 123456.789),
        accountingExample: safeFormatCurrency(cldrLocale, currencyCode, -1234.56, { currencySign: "accounting" })
    };

    // --- PRIORITIZATION LOGIC ---

    // 1. Name: CLDR > ICU (skipped) > WB (rarely useful) > Mledoze > SL
    let name = slData.name;
    if (mledozeData?.name?.common) name = mledozeData.name.common;
    if (territories) name = territories;

    // 2. Population: WB > Mledoze > SL
    let population = mledozeData?.population || slData.population || 0;
    if (wbData?.population) population = wbData.population;

    // 3. Region: WB > Mledoze > SL
    let region = slData.region;
    if (mledozeData?.region) region = mledozeData.region;
    if (wbData?.region) region = wbData.region;

    // 4. Income: WB (Exclusive)
    let incomeGroup = wbData?.incomeGroup || "";

    // 5. Coordinates: Mledoze > SL
    let coordinates = slData.coordinates || [0, 0];
    if (mledozeData?.latlng) coordinates = mledozeData.latlng;

    // 6. Capital: Mledoze > SL
    let capital = slData.capital_name;
    if (mledozeData?.capital?.length > 0) capital = mledozeData.capital[0];

    // 7. Area: SL (usually reliable) but allow Mledoze fallback
    let area = slData.area_sq_km;
    if (!area && mledozeData?.area) area = mledozeData.area;

    // 8. TLD: Mledoze > SL
    let tld = slData.tld ? [slData.tld] : [];
    if (mledozeData?.tld?.length > 0) tld = mledozeData.tld;

    // 9. Borders: Mledoze > SL
    let borders = slData.borders || [];
    if (mledozeData?.borders) borders = mledozeData.borders;

    // Languages: Merge SL and Mledoze? SL has localized names, Mledoze has codes.
    // SL structure is flat array of objects. Mledoze has { "tur": "Turkish" } map.
    // Stick to SL as primary for now because it has localized names, but could augment.
    const languages = slData.languages.map((l: any) => ({
        code: l.iso_639_1,
        iso639_2: l.iso_639_2,
        iso639_3: l.iso_639_3,
        name: l.name,
        nativeName: l.name_local,
        official: true,
        direction: "ltr",
        countries: []
    }));

    // Assemble Data
    const data: CountryLocaleData = {
        $schema: "1.0.0",
        lastUpdated: new Date().toISOString().split('T')[0],
        sources: ["CLDR", "WorldBank", "mledoze", "SimpleLocalize"],
        basics: {
            name: name,
            officialName: mledozeData?.name?.official || name,
            nativeName: territories || slData.name_local,
            officialNativeName: mledozeData?.name?.native?.[Object.keys(mledozeData?.name?.native || {})[0]]?.official || "",
            capital: capital,
            capitalCoordinates: [slData.capital_latitude, slData.capital_longitude],
            coordinates: coordinates,
            continent: slData.continent,
            region: region,
            subregion: mledozeData?.subregion || slData.region,
            population: population,
            area: area,
            flagEmoji: mledozeData?.flag || slData.flag, // Mledoze flag usually good too
            tld: tld,
            landlocked: mledozeData?.landlocked ?? slData.is_landlocked,
            borders: borders,
            languages: languages,
            demonym: mledozeData?.demonyms?.eng?.m || ""
        },
        worldBank: {
            incomeGroup: incomeGroup,
            region: wbData?.region || ""
        },
        codes: {
            iso3166Alpha2: slData.iso_3166_1_alpha2,
            iso3166Alpha3: slData.iso_3166_1_alpha3,
            iso3166Numeric: String(slData.iso_3166_1_numeric),
            bcp47: [cldrLocale],
            internetTld: tld[0] || "",
            ioc: mledozeData?.cioc || slData.ioc,
            fifa: mledozeData?.fifa || slData.fifa,
            vehicleCode: mledozeData?.car?.signs?.[0] || slData.vehicle_code,
            fips10: slData.fips10,
            unLocode: slData.un_locode,
            stanag1059: slData.stanag_1059,
            itu: slData.itu,
            uic: slData.uic,
            maritime: slData.maritime,
            mmc: slData.mmc
        },
        currency: currencyObj,
        dateTime: {
            firstDayOfWeek: (() => {
                // CLDR supplemental weekData > mledoze > default
                const cldrFirstDay = weekData?.firstDay?.[isoCode] || weekData?.firstDay?.['001'];
                if (cldrFirstDay) {
                    const dayMap: Record<string, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 };
                    return (dayMap[cldrFirstDay] || 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
                }
                return (mledozeData?.startOfWeek === "sunday" ? 7 : mledozeData?.startOfWeek === "saturday" ? 6 : 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
            })(),
            clockFormat: (() => {
                // Detect from time format pattern
                const shortTime = caGregorian?.timeFormats?.short || "";
                return shortTime.includes('h') || shortTime.includes('K') ? '12h' : '24h';
            })(),
            dateFormats: {
                full: caGregorian?.dateFormats?.full || "",
                long: caGregorian?.dateFormats?.long || "",
                medium: caGregorian?.dateFormats?.medium || "",
                short: caGregorian?.dateFormats?.short || ""
            },
            timeFormats: {
                full: caGregorian?.timeFormats?.full || "",
                long: caGregorian?.timeFormats?.long || "",
                medium: caGregorian?.timeFormats?.medium || "",
                short: caGregorian?.timeFormats?.short || ""
            },
            datePatterns: {
                full: caGregorian?.dateSkeletons?.full || "",
                long: caGregorian?.dateSkeletons?.long || "",
                medium: caGregorian?.dateSkeletons?.medium || "",
                short: caGregorian?.dateSkeletons?.short || ""
            },
            timePatterns: {
                full: caGregorian?.timeSkeletons?.full || "",
                long: caGregorian?.timeSkeletons?.long || "",
                medium: caGregorian?.timeSkeletons?.medium || "",
                short: caGregorian?.timeSkeletons?.short || ""
            },
            monthNames: {
                wide: Object.values(caGregorian?.months?.format?.wide || {}),
                abbreviated: Object.values(caGregorian?.months?.format?.abbreviated || {}),
                narrow: Object.values(caGregorian?.months?.format?.narrow || {})
            },
            dayNames: {
                wide: Object.values(caGregorian?.days?.format?.wide || {}),
                abbreviated: Object.values(caGregorian?.days?.format?.abbreviated || {}),
                narrow: Object.values(caGregorian?.days?.format?.narrow || {})
            },
            amPmMarkers: [
                dayPeriods?.am || "AM",
                dayPeriods?.pm || "PM"
            ],
            timezones: mledozeData?.timezones || slData.timezones || [],
            primaryTimezone: slData.timezones?.[0] || "UTC",
            utcOffset: "+00:00"
        },
        numberFormat: {
            decimalSeparator: numbers?.["symbols-numberSystem-latn"]?.decimal || ".",
            thousandsSeparator: numbers?.["symbols-numberSystem-latn"]?.group || ",",
            digitGrouping: "3",
            pattern: numbers?.["decimalFormats-numberSystem-latn"]?.standard || "#,##0.###",
            percentExample: new Intl.NumberFormat(cldrLocale, { style: "percent", minimumFractionDigits: 1 }).format(0.255),
            example: new Intl.NumberFormat(cldrLocale).format(1234567.89),
            numberingSystem: numbers?.defaultNumberingSystem || "latn"
        },
        phone: (() => {
            // Priority: libphonenumber > mledoze > SL
            const callingCode = phoneMeta
                ? `+${phoneMeta.countryCode}`
                : (mledozeData?.idd?.root ? mledozeData.idd.root + (mledozeData.idd.suffixes?.[0] || "") : "");
            const trunkPrefix = phoneMeta?.nationalPrefix || "0";
            const internationalPrefix = phoneMeta?.internationalPrefix?.replace(/[^0-9]/g, '') || "00";
            const generalPattern = phoneMeta?.generalPattern || "";
            const formats: PhoneNumberFormat[] = phoneMeta?.formats || [];
            const types = phoneMeta?.types || {};

            // Collect all possible subscriber lengths from types
            const allLengths = new Set<number>();
            for (const t of Object.values(types)) {
                if (t?.possibleLengths) t.possibleLengths.forEach(l => allLengths.add(l));
            }

            const exampleFormat = phoneMeta ? formatExampleNumber(phoneMeta)
                : callingCode + " 555 123 4567";

            return {
                callingCode,
                trunkPrefix,
                internationalPrefix,
                generalPattern,
                formats,
                types,
                exampleFormat,
                subscriberNumberLengths: Array.from(allLengths).sort((a, b) => a - b),
            };
        })(),
        addressFormat: {
            format: "%N%n%A%n%Z %C",
            lineOrder: ["name", "address", "city"],
            postalCodeFormat: mledozeData?.postalCode?.format || slData.postal_code_format,
            postalCodeRegex: mledozeData?.postalCode?.regex || slData.postal_code_regex,
            postalCodeExample: "",
            administrativeDivisionName: "Province",
            administrativeDivisionType: "Province"
        },
        locale: {
            writingDirection: "ltr",
            measurementSystem: "metric",
            temperatureScale: "celsius",
            paperSize: "A4",
            drivingSide: mledozeData?.car?.side || "right",
            weekNumbering: "ISO"
        },
        airports: airports
    };

    // Update index (Language)
    slData.languages.forEach((l: any) => {
        if (!langMap[l.iso_639_1]) langMap[l.iso_639_1] = [];
        langMap[l.iso_639_1].push(isoCode);
    });

    // Update index (Currency)
    if (currencyObj.code) {
        if (!currencyMap[currencyObj.code]) currencyMap[currencyObj.code] = [];
        currencyMap[currencyObj.code].push(isoCode);
        if (!currencyInfoMap[currencyObj.code]) {
            currencyInfoMap[currencyObj.code] = currencyObj;
        }
    }

    index.push({
        code: isoCode,
        name: data.basics.name, // Use prioritized name
        flagEmoji: slData.flag,
        continent: slData.continent,
        region: data.basics.region, // Use prioritized region
        primaryLocale: cldrLocale,
        currencyCode: slData.currency_code,
        callingCode: data.phone.callingCode
    });

    const outFile = path.join(OUT_COUNTRIES_DIR, `${isoCode}.json`);
    await fs.promises.writeFile(outFile, JSON.stringify(data, null, 2));
}

async function processLanguage(metadata: any, langMap: Record<string, string[]>, index: any[]) {
    const code = metadata.iso_639_1;
    if (!code) return;
    const countries = langMap[code] || [];
    const langData: LanguageLocaleData = {
        $schema: "1.0.0",
        lastUpdated: new Date().toISOString().split('T')[0],
        data: {
            code: code,
            iso639_2: metadata.iso_639_2,
            iso639_3: metadata.iso_639_3,
            name: metadata.name,
            nativeName: metadata.name_local,
            direction: "ltr",
            countries: countries
        }
    };
    index.push({
        code: code,
        name: metadata.name,
        nativeName: metadata.name_local,
        countriesCount: countries.length
    });
    const outFile = path.join(OUT_LANGUAGES_DIR, `${code}.json`);
    await fs.promises.writeFile(outFile, JSON.stringify(langData, null, 2));
}

async function processCurrency(code: string, info: CurrencyInfo, currencyMap: Record<string, string[]>, index: CurrencyIndexEntry[]) {
    if (!code) return;
    const countries = currencyMap[code] || [];
    const currencyData: CurrencyLocaleData = {
        $schema: "1.0.0",
        lastUpdated: new Date().toISOString().split('T')[0],
        data: { ...info, countries: countries }
    };
    index.push({
        code: code,
        name: info.name,
        symbol: info.symbol,
        countriesCount: countries.length
    });
    const outFile = path.join(OUT_CURRENCIES_DIR, `${code}.json`);
    await fs.promises.writeFile(outFile, JSON.stringify(currencyData, null, 2));
}

build().catch(console.error);
