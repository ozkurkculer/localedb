# 🌍 LocaleDB.org

**The Ultimate Open-Source Localization Encyclopedia.**

<p align="center">
  <img src="public/LocaleDB_logo_white.svg" alt="LocaleDB Logo" width="600" />
</p>

<p align="center">
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
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
Global airport database sourced from IP2Location:
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
- **[SimpleLocalize/countries-and-languages](https://github.com/simplelocalize/countries-and-languages)**: Normalized lists of countries and languages.
- **[IP2Location](https://github.com/ip2location/ip2location-iata-icao)**: Global airport database with IATA/ICAO codes.
- **[mwgg/Airports](https://github.com/mwgg/Airports)**: Airport names, locations and time zones.
- **[World Bank Open Data](https://data.worldbank.org)**: Population, region and income group.
- **[libphonenumber](https://github.com/google/libphonenumber)**: Phone number patterns and formats.
- **[ICU](https://github.com/unicode-org/icu)**: International Components for Unicode.



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

### 📜 Available Scripts

- **`pnpm build:data`**: Generates all static JSON files in `data/` from sources.
- **`pnpm update:data`**: Fetches fresh data from external sources (SimpleLocalize, etc.).
- **`pnpm build:clean`**: Performs a full clean build: updates data -> builds data -> builds Next.js app.
- **`pnpm packages:typecheck` / `packages:test` / `packages:build`**: Checks, tests and builds the npm packages in `packages/`.



## 📂 Project Structure

A quick overview of the codebase (see `docs/CODEBASE_MAP.md` for full details):

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