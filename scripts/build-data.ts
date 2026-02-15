
// ... (Previous imports remain, ensuring we rely on the same structure)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Types
import { CountryLocaleData, CountryBasics, CodeSystems, CurrencyInfo, DateTimeInfo, NumberFormatInfo, PhoneInfo, AddressFormatInfo, LocaleMiscInfo, CountryIndexEntry } from '../src/types/country';
import { Language, LanguageLocaleData } from '../src/types/language';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_COUNTRIES_DIR = path.join(DATA_DIR, 'countries');
const OUT_LANGUAGES_DIR = path.join(DATA_DIR, 'languages');
const OVERRIDES_DIR = path.join(DATA_DIR, 'overrides');

// Ensure output directories exist
if (!fs.existsSync(OUT_COUNTRIES_DIR)) fs.mkdirSync(OUT_COUNTRIES_DIR, { recursive: true });
if (!fs.existsSync(OUT_LANGUAGES_DIR)) fs.mkdirSync(OUT_LANGUAGES_DIR, { recursive: true });

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
  const fullPath = path.join(DATA_DIR, 'cldr', cldrPath);
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

// Deep merge helper
function deepMerge(target: any, source: any) {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return source;
  
  for (const key in source) {
    if (source[key] instanceof Array) {
        // Arrays are overwritten, not merged, to avoid duplicates unless specific logic needed
        // target[key] = source[key]; 
        // Actually, for languages list it might be better to merge unique, but for simplicity overwrite is safer for "overrides".
        target[key] = source[key];
    } else if (typeof source[key] === 'object') {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// --- Main Build Process ---

async function build() {
  console.log('🚀 Starting Data Build Process (Multi-Source)...');
  const startTime = Date.now();

  // 1. Load Data Sources
  console.log('📦 Loading SimpleLocalize...');
  const slCountries = await readJsonFile(path.join(DATA_DIR, 'simplelocalize/countries.json')) || [];
  const slLanguages = await readJsonFile(path.join(DATA_DIR, 'simplelocalize/languages.json')) || [];

  console.log('📦 Loading mledoze/countries...');
  const mledozeList = await readJsonFile(path.join(DATA_DIR, 'mledoze.json')) || [];
  // Create quick lookup map for mledoze
  const mledozeMap = new Map();
  mledozeList.forEach((c: any) => mledozeMap.set(c.cca2, c));

  const countryIndex: CountryIndexEntry[] = [];
  const languageUsageMap: Record<string, string[]> = {};

  // 2. Process Countries
  console.log(`🌍 Processing ${slCountries.length} countries...`);
  
  const BATCH_SIZE = 10;
  for (let i = 0; i < slCountries.length; i += BATCH_SIZE) {
    const batch = slCountries.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (slCountry: any) => {
        const isoCode = slCountry.code;
        const mledozeCountry = mledozeMap.get(isoCode);
        const overrideData = await readJsonFile(path.join(OVERRIDES_DIR, `${isoCode}.json`));
        
        await processCountry(isoCode, slCountry, mledozeCountry, overrideData, countryIndex, languageUsageMap);
    }));

    if (global.gc) global.gc(); 
    process.stdout.write(`\r✅ Processed ${Math.min(i + BATCH_SIZE, slCountries.length)}/${slCountries.length} countries`);
  }
  console.log('\n✨ Countries processed.');

  // 3. Process Languages
  console.log(`🗣️ Processing languages...`);
  for (let i = 0; i < slLanguages.length; i += BATCH_SIZE) {
      const batch = slLanguages.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((lang: any) => processLanguage(lang, languageUsageMap)));
      process.stdout.write(`\r✅ Processed ${Math.min(i + BATCH_SIZE, slLanguages.length)}/${slLanguages.length} languages`);
  }
  console.log('\n✨ Languages processed.');

  // 4. Write Indices
  console.log('📝 Writing indices...');
  await fs.promises.writeFile(path.join(DATA_DIR, '_index_countries.json'), JSON.stringify(countryIndex, null, 2));

  const endTime = Date.now();
  console.log(`🎉 Build complete in ${((endTime - startTime) / 1000).toFixed(2)}s`);
}

async function processCountry(
    isoCode: string, 
    slData: any, 
    mledozeData: any, 
    overrideData: any,
    index: CountryIndexEntry[], 
    langMap: Record<string, string[]>
) {
    const primaryLang = slData.languages?.[0]?.iso_639_1 || 'en';
    const cldrLocale = `${primaryLang}-${isoCode}`;
    let cldrPath = primaryLang; 

    // --- FETCH CLDR ---
    const territories = await readCldrData(`cldr-localenames-full/main/${cldrPath}/territories.json`, "main", cldrPath, "localeDisplayNames", "territories", isoCode);
    const caGregorian = await readCldrData(`cldr-dates-full/main/${cldrPath}/ca-gregorian.json`, "main", cldrPath, "dates", "calendars", "gregorian");
    const numbers = await readCldrData(`cldr-numbers-full/main/${cldrPath}/numbers.json`, "main", cldrPath, "numbers");

    // --- BASE DATA (SimpleLocalize) ---
    const data: CountryLocaleData = {
        $schema: "1.0.0",
        lastUpdated: new Date().toISOString().split('T')[0],
        sources: ["SimpleLocalize", "CLDR", "mledoze/countries", "Manual Overrides"],
        basics: {
            name: slData.name,
            officialName: mledozeData?.name?.official || slData.name,
            nativeName: territories || slData.name_local,
            officialNativeName: mledozeData?.name?.native?.[Object.keys(mledozeData?.name?.native || {})[0]]?.official || "",
            capital: slData.capital_name,
            capitalCoordinates: [slData.capital_latitude, slData.capital_longitude],
            coordinates: mledozeData?.latlng || [0, 0],
            continent: slData.continent,
            region: slData.region,
            subregion: mledozeData?.subregion || slData.region,
            population: mledozeData?.population || 0,
            area: slData.area_sq_km,
            flagEmoji: slData.flag,
            tld: slData.tld,
            landlocked: slData.is_landlocked,
            borders: slData.borders || [],
            languages: slData.languages.map((l: any) => ({
                code: l.iso_639_1,
                iso639_2: l.iso_639_2,
                iso639_3: l.iso_639_3,
                name: l.name,
                nativeName: l.name_local,
                official: true,
                direction: "ltr",
                countries: []
            })),
            demonym: mledozeData?.demonyms?.eng?.m || ""
        },
        codes: {
            iso3166Alpha2: slData.iso_3166_1_alpha2,
            iso3166Alpha3: slData.iso_3166_1_alpha3,
            iso3166Numeric: String(slData.iso_3166_1_numeric),
            bcp47: [cldrLocale],
            internetTld: slData.tld,
            ioc: slData.ioc,
            fifa: slData.fifa,
            vehicleCode: slData.vehicle_code,
            fips10: slData.fips10,
            unLocode: slData.un_locode,
            stanag1059: slData.stanag_1059,
            itu: slData.itu,
            uic: slData.uic,
            maritime: slData.maritime,
            mmc: slData.mmc
        },
        currency: {
            code: slData.currency_code,
            numericCode: slData.currency_numeric,
            name: slData.currency,
            nativeName: slData.currency_local,
            symbol: slData.currency_symbol,
            narrowSymbol: slData.currency_symbol,
            symbolPosition: "before",
            decimalSeparator: numbers?.["symbols-numberSystem-latn"]?.decimal || ".",
            thousandsSeparator: numbers?.["symbols-numberSystem-latn"]?.group || ",",
            decimalDigits: 2,
            subunitValue: slData.currency_subunit_value,
            subunitName: slData.currency_subunit_name,
            pattern: numbers?.["currencyFormats-numberSystem-latn"]?.standard || "¤#,##0.00",
            example: "",
            accountingExample: ""
        },
        dateTime: {
            firstDayOfWeek: 1,
            clockFormat: "24h",
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
            amPmMarkers: ["AM", "PM"],
            timezones: mledozeData?.timezones || slData.timezones || [],
            primaryTimezone: slData.timezones?.[0] || "UTC",
            utcOffset: "+00:00"
        },
        numberFormat: {
            decimalSeparator: numbers?.["symbols-numberSystem-latn"]?.decimal || ".",
            thousandsSeparator: numbers?.["symbols-numberSystem-latn"]?.group || ",",
            digitGrouping: "3",
            pattern: numbers?.["decimalFormats-numberSystem-latn"]?.standard || "#,##0.###",
            percentExample: "",
            example: "",
            numberingSystem: numbers?.defaultNumberingSystem || "latn"
        },
        phone: {
            callingCode: mledozeData?.idd?.root ? mledozeData.idd.root + (mledozeData.idd.suffixes?.[0] || "") : "",
            trunkPrefix: "0",
            internationalPrefix: "00",
            exampleFormat: "",
            subscriberNumberLengths: []
        },
        addressFormat: {
            format: "%N%n%A%n%Z %C",
            lineOrder: ["name", "address", "city"],
            postalCodeFormat: slData.postal_code_format,
            postalCodeRegex: slData.postal_code_regex,
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
        }
    };

    // --- APPLY OVERRIDES ---
    if (overrideData) {
        deepMerge(data, overrideData);
    }

    // Update index
    slData.languages.forEach((l: any) => {
        if (!langMap[l.iso_639_1]) langMap[l.iso_639_1] = [];
        langMap[l.iso_639_1].push(isoCode);
    });

    index.push({
        code: isoCode,
        name: slData.name,
        flagEmoji: slData.flag,
        continent: slData.continent,
        region: slData.region,
        primaryLocale: cldrLocale,
        currencyCode: slData.currency_code,
        callingCode: data.phone.callingCode
    });

    // Write file
    const outFile = path.join(OUT_COUNTRIES_DIR, `${isoCode}.json`);
    await fs.promises.writeFile(outFile, JSON.stringify(data, null, 2));
}

// ... (processLanguage and build invocation remain same)
async function processLanguage(metadata: any, langMap: Record<string, string[]>) {
    const code = metadata.iso_639_1;
    if (!code) return; // Skip if no code

    const langData: LanguageLocaleData = {
        $schema: "1.0.0",
        lastUpdated: new Date().toISOString().split('T')[0],
        data: {
          code: code,
          iso639_2: metadata.iso_639_2,
          iso639_3: metadata.iso_639_3,
          name: metadata.name,
          nativeName: metadata.name_local,
          direction: "ltr", // Default
          countries: langMap[code] || []
        }
    };

    const outFile = path.join(OUT_LANGUAGES_DIR, `${code}.json`);
    await fs.promises.writeFile(outFile, JSON.stringify(langData, null, 2));
}

// Run
build().catch(console.error);
