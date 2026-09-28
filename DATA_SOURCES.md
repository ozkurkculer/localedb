# Data Sources & Automation

This project automatically aggregates data from multiple upstream sources.

## Data Prioritization Strategy

We merge data from multiple sources to create the most accurate and rich dataset. The build script (`scripts/build-data.ts`) applies the following strict priority (highest to lowest):

### Country Data
1.  **CLDR** (Highest): Localized Names, Number Formats, Date/Time Patterns.
2.  **ICU**: Fallback for localized names and regions.
3.  **World Bank**: Population, Region, Income Group.
4.  **Mledoze**: Coordinates, Calling Codes, Currencies, Languages, Geo-data.
5.  **SimpleLocalize** (Base): Basic country list and ISO codes.

### Time Zones
**IANA tz database** (`zone.tab`, public domain): time zones per country. The primary zone is the capital's; the UTC offset is its standard-time offset.

### Phone Data
**Google libphonenumber** (`PhoneNumberMetadata.xml`): calling codes, number patterns, formats and example numbers.

### Airport Data
Merged from two sources:
1.  **mwgg/Airports (JSON)** (Primary): Global coverage with Timezones.
2.  **ip2location (CSV)** (Secondary): Fallback for smaller airports.

## Licenses

Each source keeps its own license (Unicode License v3, ODbL 1.0, CC BY 4.0, public domain, Apache 2.0, MIT, CC BY-SA 4.0). The full list, with share-alike and attribution requirements, is in [`packages/core/NOTICE`](packages/core/NOTICE).

## Automation Commands

### 1. Update Data (`pnpm update:data`)
Fetches fresh data from upstream sources.

```bash
pnpm update:data
# Optional: pnpm update:data airports
```

### 2. Build Data (`pnpm build:data`)
Processes raw data using the prioritization logic above and generates `data/countries/*.json` and indexes.

### 3. Full Build (`pnpm build`)
Runs `update:data` -> `build:data` -> `next build`.

## Configuration
See `.env` for URLs and versions.
