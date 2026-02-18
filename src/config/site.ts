export const siteConfig = {
  name: "LocaleDB",
  title: "LocaleDB - The Localization Encyclopedia",
  description:
    "Open-source reference for global localization standards. Currency formats, date patterns, country codes, and more for every country.",
  url: "https://localedb.org",
  ogImage: "https://localedb.org/og_image.png",
  links: {
    github: "https://github.com/ozkurkculer/localedb",
  },
  creator: {
    name: "Mehmet Emin Ozkurkculer",
    url: "https://github.com/ozkurkculer",
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
    "phone numbers",
    "currency",
    "date",
    "time",
    "country",
    "region",
    "language",
    "locale codes",
    "unicode",
    "unicode codes",
    "unicode-8",
    "province",
  ] as string[],
};

export type SiteConfig = typeof siteConfig;
