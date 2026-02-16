export const siteConfig = {
  name: "LocaleDB",
  title: "LocaleDB - The Localization Encyclopedia",
  description:
    "Open-source reference for global localization standards. Currency formats, date patterns, country codes, and more for every country.",
  url: "https://localedb.org",
  ogImage: "https://localedb.org/og-image",
  links: {
    github: "https://github.com/ozkurkculer/localedb",
    twitter: "https://twitter.com/localedb",
  },
  creator: {
    name: "LocaleDB Contributors",
    url: "https://github.com/ozkurkculer/localedb/graphs/contributors",
  },
  keywords: [
    "localization",
    "internationalization",
    "i18n",
    "l10n",
    "currency format",
    "date format",
    "country codes",
    "ISO 3166",
    "BCP47",
    "CLDR",
    "locale data",
    "number formatting",
    "timezone",
  ] as string[],
};

export type SiteConfig = typeof siteConfig;
