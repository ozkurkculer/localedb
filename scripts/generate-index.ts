#!/usr/bin/env tsx
/**
 * Generate _index.json from all country data files
 *
 * This creates a lightweight index file used for the countries grid page,
 * avoiding the need to load all full country data at once.
 *
 * Usage:
 *   pnpm generate-index
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface CountryLocaleData {
  basics: {
    name: string;
    flagEmoji: string;
    continent: string;
    region: string;
  };
  codes: {
    iso3166Alpha2: string;
    bcp47: string[];
  };
  currency: {
    code: string;
  };
  phone: {
    callingCode: string;
  };
}

interface CountryIndexEntry {
  code: string;
  name: string;
  flagEmoji: string;
  continent: string;
  region: string;
  primaryLocale: string;
  currencyCode: string;
  callingCode: string;
}

async function generateIndex() {
  console.log('📋 Generating country index...');

  const dataDir = path.join(process.cwd(), 'data', 'countries');
  const indexPath = path.join(process.cwd(), 'data', '_index.json');

  // Read all country files
  const files = await fs.readdir(dataDir);
  const countryFiles = files.filter(f => f.endsWith('.json') && f !== '_index.json');

  const index: CountryIndexEntry[] = [];

  for (const file of countryFiles) {
    const filePath = path.join(dataDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const data: CountryLocaleData = JSON.parse(content);

    index.push({
      code: data.codes.iso3166Alpha2,
      name: data.basics.name,
      flagEmoji: data.basics.flagEmoji,
      continent: data.basics.continent,
      region: data.basics.region,
      primaryLocale: data.codes.bcp47[0],
      currencyCode: data.currency.code,
      callingCode: data.phone.callingCode
    });
  }

  // Sort by name
  index.sort((a, b) => a.name.localeCompare(b.name));

  // Write index file
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');

  console.log(`✅ Generated index with ${index.length} countries`);
  console.log(`   Saved to: data/_index.json\n`);
}

generateIndex().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
