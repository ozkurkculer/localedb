/**
 * Publishes the JSON the site needs at request time to `public/_data/` (git-ignored).
 *
 *   pnpm build:public-data      (runs before `next build` and `next dev`)
 *
 * Only derives from the output of `pnpm build:data`; it never changes `data/`, so the data flow
 * (update:data → build:data → next build) and `data/overrides` stay as they are.
 *
 *   countries/{CODE}.json         copy of data/countries     ← /api/export
 *   currencies/{CODE}.json        copy of data/currencies    ← /api/export
 *   languages/{code}.json         copy of data/languages     ← /api/export
 *   _index_airports.json          copy of the airport index  ← /api/export
 *   country-airports/{CODE}.json  name/region/iata/icao of every airport, for countries with
 *                                 more than COUNTRY_PAGE_AIRPORTS ← the country page's airports drawer
 *
 * The files are public URLs: robots.txt disallows `/_data/` and next.config sends
 * `X-Robots-Tag: noindex` for them.
 */
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'fs/promises';
import path from 'path';
import type { Airport, CountryLocaleData } from '@localedb/core/browser';
import { COUNTRY_PAGE_AIRPORTS, type DrawerAirport } from '../src/lib/published-data';

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'data');
const OUT = path.join(ROOT, 'public', '_data');
const RECORD_DIRS = ['countries', 'currencies', 'languages'] as const;

async function jsonFiles(dir: string): Promise<string[]> {
    return (await readdir(dir)).filter((f) => f.endsWith('.json')).sort();
}

async function main() {
    try {
        await stat(path.join(DATA, 'countries'));
    } catch {
        throw new Error('data/countries is missing: run `pnpm update:data && pnpm build:data` first.');
    }

    await rm(OUT, { recursive: true, force: true });
    let files = 0;
    let bytes = 0;
    const written = async (file: string) => {
        files++;
        bytes += (await stat(file)).size;
    };

    for (const dir of RECORD_DIRS) {
        await mkdir(path.join(OUT, dir), { recursive: true });
        for (const file of await jsonFiles(path.join(DATA, dir))) {
            const target = path.join(OUT, dir, file);
            await copyFile(path.join(DATA, dir, file), target);
            await written(target);
        }
    }

    const airportIndex = path.join(OUT, '_index_airports.json');
    await copyFile(path.join(DATA, '_index_airports.json'), airportIndex);
    await written(airportIndex);

    await mkdir(path.join(OUT, 'country-airports'), { recursive: true });
    for (const file of await jsonFiles(path.join(DATA, 'countries'))) {
        const country = JSON.parse(await readFile(path.join(DATA, 'countries', file), 'utf-8')) as CountryLocaleData;
        const airports: Airport[] = country.airports ?? [];
        if (airports.length <= COUNTRY_PAGE_AIRPORTS) continue;
        const list: DrawerAirport[] = airports.map(({ name, region, iata, icao }) => ({ name, region, iata, icao }));
        const target = path.join(OUT, 'country-airports', file);
        await writeFile(target, JSON.stringify(list));
        await written(target);
    }

    console.log(`public/_data: ${files} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
