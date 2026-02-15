#!/usr/bin/env tsx
/**
 * Seed script to generate country locale data
 *
 * Data sources:
 * - RestCountries API (based on mledoze/countries)
 * - Manual CLDR-like data for locale formatting
 *
 * Usage:
 *   pnpm seed           # Generate all countries
 *   pnpm seed US TR GB  # Generate specific countries
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface RestCountry {
  cca2: string;
  cca3: string;
  ccn3: string;
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { official: string; common: string }>;
  };
  capital?: string[];
  latlng: [number, number];
  capitalInfo?: { latlng?: [number, number] };
  region: string;
  subregion?: string;
  continents: string[];
  population: number;
  area: number;
  flag: string;
  tld?: string[];
  landlocked: boolean;
  borders?: string[];
  languages?: Record<string, string>;
  demonyms?: { eng?: { m: string } };
  currencies?: Record<string, { name: string; symbol: string }>;
  idd?: { root: string; suffixes?: string[] };
  car?: { side: string };
  timezones: string[];
  postalCode?: { format?: string; regex?: string };
  fifa?: string;
  cioc?: string;
}

// ISO 639-2/3 language code mappings
const languageCodes: Record<string, { iso639_2: string; iso639_3: string }> = {
  en: { iso639_2: 'eng', iso639_3: 'eng' },
  tr: { iso639_2: 'tur', iso639_3: 'tur' },
  de: { iso639_2: 'deu', iso639_3: 'deu' },
  ja: { iso639_2: 'jpn', iso639_3: 'jpn' },
  fr: { iso639_2: 'fra', iso639_3: 'fra' },
  es: { iso639_2: 'spa', iso639_3: 'spa' },
  it: { iso639_2: 'ita', iso639_3: 'ita' },
  pt: { iso639_2: 'por', iso639_3: 'por' },
  ru: { iso639_2: 'rus', iso639_3: 'rus' },
  zh: { iso639_2: 'zho', iso639_3: 'zho' },
  ar: { iso639_2: 'ara', iso639_3: 'ara' },
  hi: { iso639_2: 'hin', iso639_3: 'hin' },
  bn: { iso639_2: 'ben', iso639_3: 'ben' },
  nl: { iso639_2: 'nld', iso639_3: 'nld' },
  sv: { iso639_2: 'swe', iso639_3: 'swe' },
  no: { iso639_2: 'nor', iso639_3: 'nor' },
  da: { iso639_2: 'dan', iso639_3: 'dan' },
  fi: { iso639_2: 'fin', iso639_3: 'fin' },
  pl: { iso639_2: 'pol', iso639_3: 'pol' },
  uk: { iso639_2: 'ukr', iso639_3: 'ukr' },
  ko: { iso639_2: 'kor', iso639_3: 'kor' },
  vi: { iso639_2: 'vie', iso639_3: 'vie' },
  th: { iso639_2: 'tha', iso639_3: 'tha' },
  id: { iso639_2: 'ind', iso639_3: 'ind' },
};

// Currency ISO 4217 numeric codes
const currencyNumericCodes: Record<string, number> = {
  USD: 840, EUR: 978, GBP: 826, JPY: 392, TRY: 949,
  CNY: 156, INR: 356, RUB: 643, BRL: 986, CAD: 124,
  AUD: 36, CHF: 756, SEK: 752, NOK: 578, DKK: 208,
  MXN: 484, SGD: 702, HKD: 344, KRW: 410, ZAR: 710,
};

// Currency subunit information
const currencySubunits: Record<string, { value: number; name: string }> = {
  USD: { value: 100, name: 'Cent' },
  EUR: { value: 100, name: 'Cent' },
  GBP: { value: 100, name: 'Penny' },
  JPY: { value: 1, name: '' },
  TRY: { value: 100, name: 'Kuruş' },
  CNY: { value: 100, name: 'Fen' },
  INR: { value: 100, name: 'Paisa' },
  RUB: { value: 100, name: 'Kopek' },
  BRL: { value: 100, name: 'Centavo' },
  CAD: { value: 100, name: 'Cent' },
};

// Additional code systems (vehicle, FIPS, etc.)
const additionalCodes: Record<string, any> = {
  US: { vehicleCode: 'USA', fips10: 'US', unLocode: 'US', stanag1059: 'USA', itu: 'USA', uic: '72 US', maritime: 338, mmc: 310 },
  TR: { vehicleCode: 'TR', fips10: 'TU', unLocode: 'TR', stanag1059: 'TUR', itu: 'TUR', uic: '52 TR', maritime: 271, mmc: 286 },
  DE: { vehicleCode: 'D', fips10: 'GM', unLocode: 'DE', stanag1059: 'DEU', itu: 'D', uic: '80 D', maritime: 211, mmc: 262 },
  GB: { vehicleCode: 'GB', fips10: 'UK', unLocode: 'GB', stanag1059: 'GBR', itu: 'G', uic: '70 GB', maritime: 232, mmc: 234 },
  JP: { vehicleCode: 'J', fips10: 'JA', unLocode: 'JP', stanag1059: 'JPN', itu: 'J', uic: '06 J', maritime: 431, mmc: 440 },
  FR: { vehicleCode: 'F', fips10: 'FR', unLocode: 'FR', stanag1059: 'FRA', itu: 'F', uic: '87 F', maritime: 226, mmc: 208 },
  CA: { vehicleCode: 'CDN', fips10: 'CA', unLocode: 'CA', stanag1059: 'CAN', itu: 'CAN', uic: '40 CA', maritime: 316, mmc: 302 },
  // Add more as needed - generic fallback will be used if not specified
};

async function fetchCountries(specificCodes?: string[]): Promise<RestCountry[]> {
  console.log('📡 Fetching country data from RestCountries API...');

  const url = specificCodes && specificCodes.length > 0
    ? `https://restcountries.com/v3.1/alpha?codes=${specificCodes.join(',')}`
    : 'https://restcountries.com/v3.1/all';

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`✅ Fetched ${data.length} countries`);
  return data;
}

function getLanguageCodesOrDefault(code: string) {
  return languageCodes[code] || { iso639_2: code.toUpperCase(), iso639_3: code.toUpperCase() };
}

function generateLocaleData(country: RestCountry) {
  const code = country.cca2;
  const primaryLang = country.languages ? Object.keys(country.languages)[0] : 'en';
  const isMetric = country.cca2 !== 'US' && country.cca2 !== 'LR' && country.cca2 !== 'MM';

  // Get primary currency
  const currencyCode = country.currencies ? Object.keys(country.currencies)[0] : 'USD';
  const currencyInfo = country.currencies?.[currencyCode];

  // Get native name
  const nativeNames = country.name.nativeName;
  const nativeName = nativeNames
    ? nativeNames[primaryLang]?.common || country.name.common
    : country.name.common;
  const officialNativeName = nativeNames
    ? nativeNames[primaryLang]?.official || country.name.official
    : country.name.official;

  // Build language array
  const languages = country.languages ? Object.entries(country.languages).map(([code, name]) => {
    const codes = getLanguageCodesOrDefault(code);
    return {
      code,
      iso639_2: codes.iso639_2,
      iso639_3: codes.iso639_3,
      name: name,
      nativeName: name,
      official: true
    };
  }) : [];

  // Get calling code
  const callingCode = country.idd?.root
    ? country.idd.root + (country.idd.suffixes?.[0] || '')
    : '+1';

  // Get additional codes or use generic fallback
  const extraCodes = additionalCodes[code] || {
    vehicleCode: code,
    fips10: code,
    unLocode: code,
    stanag1059: country.cca3,
    itu: country.cca3,
    uic: `00 ${code}`,
    maritime: 0,
    mmc: 0
  };

  // Get currency subunit info
  const subunit = currencySubunits[currencyCode] || { value: 100, name: 'Cent' };

  return {
    $schema: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    sources: ['RestCountries API', 'Manual CLDR-like data'],
    basics: {
      name: country.name.common,
      officialName: country.name.official,
      nativeName,
      officialNativeName,
      capital: country.capital?.[0] || '',
      capitalCoordinates: country.capitalInfo?.latlng || country.latlng,
      coordinates: country.latlng,
      continent: country.continents[0] || country.region,
      region: country.subregion || country.region,
      subregion: country.subregion || country.region,
      population: country.population,
      area: country.area,
      flagEmoji: country.flag,
      tld: country.tld?.[0] || `.${code.toLowerCase()}`,
      landlocked: country.landlocked,
      borders: country.borders || [],
      languages,
      demonym: country.demonyms?.eng?.m || country.name.common
    },
    codes: {
      iso3166Alpha2: code,
      iso3166Alpha3: country.cca3,
      iso3166Numeric: country.ccn3 || '000',
      bcp47: languages.map(l => `${l.code}-${code}`),
      internetTld: country.tld?.[0] || `.${code.toLowerCase()}`,
      ioc: country.cioc || country.cca3,
      fifa: country.fifa || country.cca3,
      ...extraCodes
    },
    currency: {
      code: currencyCode,
      numericCode: currencyNumericCodes[currencyCode] || 0,
      name: currencyInfo?.name || currencyCode,
      nativeName: currencyInfo?.name || currencyCode,
      symbol: currencyInfo?.symbol || currencyCode,
      narrowSymbol: currencyInfo?.symbol || currencyCode,
      symbolPosition: 'before' as const,
      decimalSeparator: '.',
      thousandsSeparator: ',',
      decimalDigits: currencyCode === 'JPY' ? 0 : 2,
      subunitValue: subunit.value,
      subunitName: subunit.name,
      pattern: currencyCode === 'JPY' ? '¤#,##0' : '¤#,##0.00',
      example: `${currencyInfo?.symbol || '$'}1,250${currencyCode === 'JPY' ? '' : '.00'}`,
      accountingExample: `(${currencyInfo?.symbol || '$'}1,250${currencyCode === 'JPY' ? '' : '.00'})`
    },
    dateTime: {
      firstDayOfWeek: code === 'US' ? 7 : 1,
      clockFormat: code === 'US' ? '12h' : '24h' as const,
      dateFormats: {
        full: 'Full date format',
        long: 'Long date format',
        medium: 'Medium date format',
        short: 'Short date format'
      },
      timeFormats: {
        full: 'Full time format',
        long: 'Long time format',
        medium: 'Medium time format',
        short: 'Short time format'
      },
      datePatterns: {
        full: 'EEEE, MMMM d, y',
        long: 'MMMM d, y',
        medium: 'MMM d, y',
        short: 'M/d/yy'
      },
      timePatterns: {
        full: 'h:mm:ss a zzzz',
        long: 'h:mm:ss a z',
        medium: 'h:mm:ss a',
        short: 'h:mm a'
      },
      monthNames: {
        wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
      },
      dayNames: {
        wide: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        abbreviated: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        narrow: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      },
      amPmMarkers: ['AM', 'PM'],
      timezones: country.timezones,
      primaryTimezone: country.timezones[0],
      utcOffset: country.timezones[0]
    },
    numberFormat: {
      decimalSeparator: '.',
      thousandsSeparator: ',',
      digitGrouping: '3',
      pattern: '#,##0.###',
      percentExample: '25.5%',
      example: '1,234,567.89',
      numberingSystem: 'latn'
    },
    phone: {
      callingCode,
      trunkPrefix: '0',
      internationalPrefix: '00',
      exampleFormat: `${callingCode} 123 456 7890`,
      subscriberNumberLengths: [10]
    },
    addressFormat: {
      format: '%N%n%O%n%A%n%C, %S %Z',
      lineOrder: ['Name', 'Organization', 'Street Address', 'City, State ZIP'],
      postalCodeFormat: country.postalCode?.format || 'NNNNN',
      postalCodeRegex: country.postalCode?.regex || '^\\d{5}$',
      postalCodeExample: '12345',
      administrativeDivisionName: 'State',
      administrativeDivisionType: 'State'
    },
    locale: {
      writingDirection: 'ltr' as const,
      measurementSystem: isMetric ? 'metric' : 'imperial' as const,
      temperatureScale: isMetric ? 'celsius' : 'fahrenheit' as const,
      paperSize: code === 'US' || code === 'CA' ? 'Letter' : 'A4' as const,
      drivingSide: country.car?.side === 'left' ? 'left' : 'right' as const,
      weekNumbering: code === 'US' ? 'US' : 'ISO' as const
    }
  };
}

async function main() {
  const args = process.argv.slice(2);
  const specificCodes = args.length > 0 ? args.map(c => c.toUpperCase()) : undefined;

  try {
    // Fetch countries
    const countries = await fetchCountries(specificCodes);

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data', 'countries');
    await fs.mkdir(dataDir, { recursive: true });

    // Generate and write data for each country
    console.log('\n📝 Generating country data files...');
    let successCount = 0;

    for (const country of countries) {
      try {
        const data = generateLocaleData(country);
        const filePath = path.join(dataDir, `${country.cca2}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
        console.log(`  ✅ ${country.cca2} - ${country.name.common}`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ ${country.cca2} - ${country.name.common}: ${error}`);
      }
    }

    console.log(`\n✨ Successfully generated ${successCount}/${countries.length} country files`);
    console.log('\n💡 Note: Some locale data (date/time formats, month names) uses generic English defaults.');
    console.log('   For production, you should integrate full CLDR data for each locale.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
