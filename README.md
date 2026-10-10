# LocaleDB.org

**The Ultimate Open-Source Localization Encyclopedia.**

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/LocaleDB_logo_white.svg" />
    <img src="public/LocaleDB_logo.svg" alt="LocaleDB Logo" width="600" />
  </picture>
</p>

<p align="center">
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-16.3.8-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS 4" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  </a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" />
  </a>
  <a href="https://github.com/ozkurkculer/localedb/graphs/contributors">
    <img src="https://img.shields.io/badge/Contributors-Welcome-green.svg?style=flat-square" alt="Contributors Welcome" />
  </a>
</p>



## 🚀 The Vision

Localization (L10n) is more than just translation. It's about getting the currency right, the date format perfect, and the number separators exact. 

**LocaleDB.org** is a community-driven database designed to give developers instant access to structured localization data for every country on Earth. No more guesswork about whether Germany uses a comma or a dot effectively.


## ✨ Features

I provide structured JSON data for:

### 🏳️ Countries (250+)
Comprehensive country profiles including:
- **Core Data:** Name, Native Name, Capital, Region, Subregion.
- **Geography:** Borders, Area, Landlocked status.
- **Codes:** ISO 3166-1 (Alpha-2, Alpha-3, Numeric), IOC, FIFA.
- **Locale:** BCP 47 codes (e.g., `tr-TR`, `en-US`).
- **Demographics:** Population, Gentonyms.

### 💰 Currencies (150+)
Precise financial formatting rules:
- **Identifiers:** ISO 4217 Code, Numeric Code, Name.
- **Symbols:** Primary (`$`), Narrow (`$`), Position (Before/After).
- **Formatting:** Decimal & Thousands separators, Decimal digits.
- **Subunits:** Name and value (e.g., 100 Cents = 1 Dollar).

### 🗣️ Languages (100+)
Key linguistic data:
- **Identification:** ISO 639-1, 639-2, 639-3 codes.
- **Names:** English and Native names.
- **Script:** Writing direction (LTR/RTL).

### 🛫 Airports (9,000+)
Global airport database sourced from mwgg/Airports and IP2Location:
- **Identification:** IATA & ICAO codes.
- **Location:** Latitude, Longitude, Region, Country.
- **Details:** Full airport names.

### 📅 Date & Time
Regional formatting patterns:
- **Calendars:** Gregorian and local calendars.
- **Formats:** Full, Long, Medium, Short date/time patterns.
- **Preferences:** First day of the week, 12h/24h clock preference.


## 📦 npm Packages & CLI (beta)

Use the same data in your own code:

```bash
npm install @localedb/core        # typed, offline data API
npx @localedb/cli init            # generate JSON, CSV or TypeScript files in your project
```

```ts
import { getCountry } from "@localedb/core";
getCountry("TR")?.currency.symbol; // "₺"
```

See [`packages/core`](packages/core) and [`packages/cli`](packages/cli) for the full API and commands.


## 📚 Data Sources

LocaleDB aggregates and normalizes data from the most reliable open-source projects:

- **[CLDR](https://cldr.unicode.org/)** (Common Locale Data Repository): The gold standard for formatting patterns (dates, numbers, currencies).
- **[mledoze/countries](https://github.com/mledoze/countries)**: Comprehensive country data (ISO codes, geography, demographics).
- **[IP2Location](https://github.com/ip2location/ip2location-iata-icao)**: Global airport database with IATA/ICAO codes.
- **[mwgg/Airports](https://github.com/mwgg/Airports)**: Airport names, locations and time zones.
- **[World Bank Open Data](https://data.worldbank.org)**: Population, region and income group.
- **[libphonenumber](https://github.com/google/libphonenumber)**: Phone number patterns and formats.
- **[IANA tz database](https://www.iana.org/time-zones)**: Time zones per country.
- **[libaddressinput](https://github.com/google/libaddressinput)**: Address formats and postal codes.
- **[Wikidata](https://www.wikidata.org)**: FIFA, vehicle, ITU, UIC, maritime and mobile country codes, capital coordinates, driving side and currency subunits.
- **[ourworldincode/currency](https://github.com/ourworldincode/currency)**: Currency subunit names and ratios.



## 🛠 Tech Stack

Built with the latest and greatest web technologies for speed and developer experience:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Oxide engine)
- **Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/) & [Flag Icons](https://flagicons.lipis.dev/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)
- **Package Manager:** [pnpm](https://pnpm.io/)


## 📦 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ozkurkculer/localedb.git
   cd localedb
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Setup Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   *(No API keys required for basic functionality, but the file must exist)*

4. **Run clean build to take data:**
   ```bash
   pnpm build:clean
   ```

5. **Run development server:**
   ```bash
   pnpm dev
   ```

6. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) (or whatever port it runs on)

### Building for Production

To create an optimized production build (SSG):

```bash
pnpm build
```

This will run type checks, linting, and generate static pages for all locales.

### ☁️ Local Preview on Cloudflare Workers

The site can also run on Cloudflare Workers through [OpenNext](https://opennext.js.org/cloudflare) (`wrangler.jsonc`, `open-next.config.ts`). To try the Worker locally in `workerd`, the same runtime Cloudflare uses, after the data has been built (`pnpm build:clean` once):

```bash
pnpm preview
```

This runs `pnpm cf:build` (`opennextjs-cloudflare build`, which calls `pnpm build`, then `scripts/cloudflare-headers.ts`) and serves the result at [http://localhost:8787](http://localhost:8787). No Cloudflare login is needed for the preview.

- Prerendered pages and `public/` (including `public/_data`) are served as Workers static assets. `/api/export` reads `public/_data` through the `ASSETS` binding instead of the disk (`src/lib/data/runtime.ts`).
- Static assets are served before the Worker runs, so `next.config.ts` `headers()` does not reach them. `scripts/cloudflare-headers.ts` generates `.open-next/assets/_headers` from those rules. Keep header and redirect rules in `next.config.ts`.
- Cloudflare Web Analytics is rendered only when `NEXT_PUBLIC_CF_BEACON_TOKEN` is set at build time. Pass it on the command line or in CI, not in a committed file.
- `pnpm cf-typegen` regenerates `cloudflare-env.d.ts` after binding changes in `wrangler.jsonc`.
- Deploying is `pnpm run deploy` (`pnpm deploy` is a built-in pnpm command) and needs `wrangler login`. See "Deploy (Cloudflare)" below.

### ☁️ Deploy (Cloudflare)

Production is the `localedb` Worker at [https://localedb.org](https://localedb.org) (a Worker custom domain, added in the Cloudflare dashboard). `www.localedb.org`, `localedb.app` and `www.localedb.app` redirect there (301, path and query kept) through Redirect Rules in their zones. The Worker has no workers.dev or preview URL (`workers_dev` and `preview_urls` are `false` in `wrangler.jsonc`); wrangler does not touch the dashboard custom domain as long as `wrangler.jsonc` declares no `routes`.

Every push to `main` deploys the `localedb` Worker through GitHub Actions (`.github/workflows/deploy-cloudflare.yml`); it can also be started by hand from the Actions tab (`workflow_dispatch`, `main` only). Deploys run one at a time and are never cancelled halfway.

**CI flow** (Node 24, pinned because ICU and tz data end up in the dataset and the pages):

1. `pnpm install --frozen-lockfile`
2. `cp .env.example .env` and `pnpm update:data`: fresh downloads of every source. Any failing source fails the run, so a partial dataset is never deployed.
3. `pnpm build:data`
4. `pnpm cf:build`: `opennextjs-cloudflare build` runs `pnpm build` (`build:public-data` + `next build`), then `scripts/cloudflare-headers.ts`. Same order as `pnpm build:clean`, with `next build` run once.
5. `opennextjs-cloudflare deploy --tag <commit sha> --message ci-run-<run id>`: copies the prerendered pages into the static assets and runs `wrangler deploy`. Every deploy uploads ~6,000 changed files (~3 GB): the build id is in every page.
6. `scripts/cloudflare-smoke.sh https://localedb.org`: waits until production serves the new build id, then checks a few URLs (no `x-robots-tag` on pages, `cache-control` set by `src/middleware.ts`) and one `/api/export` request. If it fails, production is rolled back automatically to the version that was live before the run (`wrangler rollback`, no upload) and the run is red. If the deploy step itself fails, the summary shows the rollback command instead.

The run summary lists step timings, uploaded/existing asset counts, Worker size, version id and commit.

**Manual deploy** (Node 24, after `wrangler login`, with fresh data):

```bash
pnpm build:clean
```

```bash
NEXT_PUBLIC_CF_BEACON_TOKEN=<token> pnpm run deploy
```

**Rollback** (no upload, takes effect in seconds; without a version id it offers the previous one):

```bash
pnpm wrangler rollback <version-id>
```

`pnpm wrangler deployments list` and `pnpm wrangler versions list` show the history; CI versions carry the commit sha as their tag. After a deploy or rollback, some requests can reach the previous version for a few minutes.

**Required settings** (GitHub → Settings → Secrets and variables → Actions):

| Name | Kind | Value |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Secret | Account API token limited to the LocaleDB account with **Account → Workers Scripts: Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | The Cloudflare account id |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Variable | Cloudflare Web Analytics site token. Public (it is in every page's HTML), so a variable, not a secret |

**PR previews** are off: each would upload ~3 GB. If needed, a manual workflow can run `opennextjs-cloudflare upload` (uploads a version without deploying it); that also needs `preview_urls: true` in `wrangler.jsonc`. Secrets are not available to pull requests from forks, so such a job must skip them.

**Why GitHub Actions and not Workers Builds:** Workers Builds (Cloudflare's Git integration) allows 20 minutes and 20 GB of disk per build on the paid plan. It defaults to Node 24 (selectable with `.nvmrc` or `NODE_VERSION`), so the Node version is not the issue. But our build needs ~13 GB of disk, the data download depends on upstream sources, and a deploy uploads ~3 GB. That leaves little margin under the 20-minute limit. Actions has a 60-minute job limit, lets us check disk space and free more, and lets the data pipeline, the smoke test and the step summary live in one versioned file.

### 📜 Available Scripts

- **`pnpm build:data`**: Generates all static JSON files in `data/` from sources.
- **`pnpm update:data`**: Fetches fresh data from external sources (CLDR, mledoze, IANA tz, Wikidata, etc.).
- **`pnpm build:clean`**: Performs a full clean build: updates data -> builds data -> builds Next.js app.
- **`pnpm packages:typecheck` / `packages:test` / `packages:build`**: Checks, tests and builds the npm packages in `packages/`.



## 📂 Project Structure

A quick overview of the codebase:

```
LocaleDB/
├── data/                  # Static JSON data (Single Source of Truth)
│   ├── countries/         # 250+ country files
│   ├── currencies/        # 150+ currency files
│   └── ...
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components (shadcn/ui, layout)
│   ├── lib/               # Data loaders (server-side)
│   └── ...
├── packages/
│   ├── core/              # @localedb/core: types + data API (npm)
│   └── cli/               # @localedb/cli: the localedb command (npm)
├── scripts/               # Build & Data generation scripts
│   └── build-data.ts      # The heart of our data pipeline
└── public/                # Static assets (logos, images)
```


## 🤝 Contributing

I love contributions! Whether it's fixing a typo in a country's data or improving the UI.

1. **Fork** the repository.
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`).
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`).
4. **Push** to the branch (`git push origin feature/amazing-feature`).
5. **Open** a Pull Request.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/ozkurkculer">@ozkurkculer</a> and contributors.
</p>