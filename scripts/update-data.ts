
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { WIKIDATA_COUNTRY_QUERY, WIKIDATA_CURRENCY_QUERY, WIKIDATA_FIFA_FEDERATION_QUERY, WIKIDATA_FIFA_QUERY } from './sources/wikidata';

// Load .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

// --- Helpers ---

async function downloadFile(url: string, outputPath: string) {
    console.log(`⬇️  Downloading: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const fileStream = fs.createWriteStream(outputPath);
    // @ts-ignore
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
    console.log(`✅ Saved to: ${outputPath}`);
}

async function downloadZipAndExtract(url: string, outputDir: string, filter?: (filename: string) => boolean) {
    console.log(`⬇️  Downloading Zip: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    console.log(`📦 Extracting to: ${outputDir}`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    let extractedCount = 0;
    zipEntries.forEach((entry) => {
        if (entry.isDirectory) return;

        if (filter && !filter(entry.entryName)) return;

        // Flatten logic for CLDR if needed, or preserve structure?
        // For CLDR, the zip is like `cldr-json-44.0.0/cldr-json/cldr-core/...`
        // We probably want to strip the top-level folder.

        let targetPath = path.join(outputDir, entry.entryName);

        // Custom stripping logic for GitHub archives (remove top level folder)
        const parts = entry.entryName.split('/');
        if (parts.length > 1) {
            // Heuristic: If it looks like a github release archive, strip the first dir
            // e.g. "cldr-json-45.0.0/"
            targetPath = path.join(outputDir, parts.slice(1).join('/'));
        }

        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        fs.writeFileSync(targetPath, entry.getData());
        extractedCount++;
    });
    console.log(`✅ Extracted ${extractedCount} files.`);
}

async function getLatestGitHubTag(repo: string): Promise<string> {
    console.log(`🔍 Checking latest release for ${repo}...`);
    // Authenticated when GITHUB_TOKEN is set (CI), to avoid the shared-IP rate limit.
    const headers: Record<string, string> = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers });
    if (!res.ok) throw new Error(`Failed to check latest release for ${repo}: ${res.statusText}`);
    const data = await res.json() as any;
    console.log(`✨ Latest version for ${repo}: ${data.tag_name}`);
    return data.tag_name;
}

// --- Main Tasks ---

async function updateWorldBank() {
    console.log('\n--- World Bank ---');
    const dir = path.join(DATA_DIR, 'worldbankgroup');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Download Zip
    const res = await fetch(process.env.WB_POPULATION_URL!);
    if (!res.ok) throw new Error(`Failed to fetch WB Data: ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const zip = new AdmZip(buffer);

    const popPattern = new RegExp(process.env.WB_POPULATION_CSV_PATTERN!.replace('*', '.*'));
    const metaPattern = new RegExp(process.env.WB_METADATA_CSV_PATTERN!.replace('*', '.*'));

    zip.getEntries().forEach(entry => {
        if (popPattern.test(entry.entryName) || metaPattern.test(entry.entryName)) {
            console.log(`📦 Extracting: ${entry.entryName}`);
            zip.extractEntryTo(entry, dir, false, true);
        }
    });
}

async function updateMledoze() {
    console.log('\n--- Mledoze ---');
    await downloadFile(process.env.MLEDOZE_COUNTRIES_URL!, path.join(DATA_DIR, 'mledoze.json'));
}

async function updateAirports() {
    console.log('\n--- Airports ---');
    // 1. Download CSV (IATA/ICAO) - Backup/Secondary
    if (process.env.AIRPORTS_CSV_URL) {
        await downloadFile(process.env.AIRPORTS_CSV_URL, path.join(DATA_DIR, 'airports.csv'));
    }

    // 2. Download JSON (mwgg/Airports) - Primary
    if (process.env.AIRPORTS_JSON_URL) {
        await downloadFile(process.env.AIRPORTS_JSON_URL, path.join(DATA_DIR, 'airports.json'));
    }
}

async function updateCLDR() {
    console.log('\n--- CLDR ---');
    let version = process.env.CLDR_VERSION || 'latest';
    if (version === 'latest') {
        version = await getLatestGitHubTag(process.env.CLDR_REPO!);
    }

    const url = `https://github.com/${process.env.CLDR_REPO}/archive/refs/tags/${version}.zip`;
    const packages = (process.env.CLDR_PACKAGES || '').split(',');
    const outputDir = path.join(DATA_DIR, 'cldr');

    // Clean dir first? Maybe risky. Let's overwrite.

    await downloadZipAndExtract(url, outputDir, (filename) => {
        // Filename example: cldr-json-44.0.0/cldr-json/cldr-core/package.json
        // We want to keep if it contains any of the packages
        return packages.some(pkg => filename.includes(`/${pkg}/`));
    });
}

async function updateLibphonenumber() {
    console.log('\n--- Libphonenumber ---');
    const url = 'https://raw.githubusercontent.com/google/libphonenumber/master/resources/PhoneNumberMetadata.xml';
    const outputDir = path.join(DATA_DIR, 'libphonenumber');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    await downloadFile(url, path.join(outputDir, 'PhoneNumberMetadata.xml'));
}

async function updateTimeZones() {
    console.log('\n--- IANA tz ---');
    const outputDir = path.join(DATA_DIR, 'tz');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    await downloadFile(process.env.TZ_ZONE_TAB_URL || 'https://raw.githubusercontent.com/eggert/tz/main/zone.tab', path.join(outputDir, 'zone.tab'));
}

async function updateAddressFormats() {
    console.log('\n--- libaddressinput ---');
    const outputDir = path.join(DATA_DIR, 'libaddressinput');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    await downloadFile(
        process.env.ADDRESS_DATA_URL || 'https://raw.githubusercontent.com/google/libaddressinput/master/testdata/countryinfo.txt',
        path.join(outputDir, 'countryinfo.txt')
    );
}

async function updateCurrencyUnits() {
    console.log('\n--- ourworldincode/currency ---');
    const outputDir = path.join(DATA_DIR, 'ourworldincode');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    await downloadFile(
        process.env.CURRENCY_UNITS_URL || 'https://raw.githubusercontent.com/ourworldincode/currency/main/currencies.json',
        path.join(outputDir, 'currencies.json')
    );
}

async function queryWikidata(query: string, attempt = 1): Promise<{ results?: { bindings?: unknown[] } }> {
    const retry = async (reason: string, seconds: number) => {
        const wait = Math.min(seconds, 120);
        console.log(`⏳ Wikidata ${reason}, retrying in ${wait}s...`);
        await new Promise((resolve) => setTimeout(resolve, wait * 1000));
        return queryWikidata(query, attempt + 1);
    };
    let res: Response;
    try {
        res = await fetch(process.env.WIKIDATA_SPARQL_URL || 'https://query.wikidata.org/sparql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/sparql-results+json',
                // Required by the Wikimedia User-Agent policy.
                'User-Agent': 'LocaleDB data build (https://localedb.org; https://github.com/ozkurkculer/localedb)',
            },
            body: new URLSearchParams({ query }),
        });
    } catch (error) {
        // Connection resets and timeouts: retry like a 5xx.
        if (attempt < 5) return retry('was unreachable', 15 * attempt);
        throw error;
    }
    // Wikidata rate-limits (429) and times out (5xx) under load; wait as asked and retry.
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
        return retry(`answered ${res.status}`, Number(res.headers.get('retry-after')) || 15 * attempt);
    }
    if (!res.ok) throw new Error(`Wikidata query failed: ${res.status} ${res.statusText}`);
    return res.json() as Promise<{ results?: { bindings?: unknown[] } }>;
}

async function updateWikidata() {
    console.log('\n--- Wikidata ---');
    const outputDir = path.join(DATA_DIR, 'wikidata');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const queries = [
        ['countries', WIKIDATA_COUNTRY_QUERY],
        ['fifa-federations', WIKIDATA_FIFA_FEDERATION_QUERY],
        ['fifa', WIKIDATA_FIFA_QUERY],
        ['currencies', WIKIDATA_CURRENCY_QUERY],
    ] as const;
    for (const [name, query] of queries) {
        const json = await queryWikidata(query);
        fs.writeFileSync(path.join(outputDir, `${name}.json`), JSON.stringify(json));
        console.log(`✅ Saved ${json.results?.bindings?.length ?? 0} Wikidata ${name}`);
    }
}


async function main() {
    const args = process.argv.slice(2);
    const availableSources = ['mledoze', 'airports', 'worldbank', 'cldr', 'libphonenumber', 'tz', 'address', 'wikidata', 'currency-units'];

    // Check for helps/list
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: pnpm update:data [source1] [source2] ...

Available sources:
${availableSources.map(s => `  - ${s}`).join('\n')}

If no source is specified, ALL sources will be updated.
        `);
        return;
    }

    // Filter sources
    const sourcesToUpdate = args.length > 0
        ? args.filter(arg => availableSources.includes(arg))
        : availableSources;

    if (sourcesToUpdate.length === 0 && args.length > 0) {
        console.error(`❌ No valid sources found in arguments: ${args.join(', ')}`);
        console.log(`Available sources: ${availableSources.join(', ')}`);
        process.exit(1);
    }

    console.log(`🚀 Updating sources: ${sourcesToUpdate.join(', ')}`);

    try {
        if (sourcesToUpdate.includes('mledoze')) await updateMledoze();
        if (sourcesToUpdate.includes('airports')) await updateAirports();
        if (sourcesToUpdate.includes('worldbank')) await updateWorldBank();
        if (sourcesToUpdate.includes('cldr')) await updateCLDR();
        if (sourcesToUpdate.includes('libphonenumber')) await updateLibphonenumber();
        if (sourcesToUpdate.includes('tz')) await updateTimeZones();
        if (sourcesToUpdate.includes('address')) await updateAddressFormats();
        if (sourcesToUpdate.includes('wikidata')) await updateWikidata();
        if (sourcesToUpdate.includes('currency-units')) await updateCurrencyUnits();

        console.log('\n✨ Selected data sources updated successfully!');
    } catch (error) {
        console.error('\n❌ Update failed:', error);
        process.exit(1);
    }
}

main();
