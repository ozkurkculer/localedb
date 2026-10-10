import { routing } from "@/i18n/routing";

/** `path` as served in `locale` ("" is the home page); the default locale has no prefix. */
function localizedPath(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return path || "/";
  return `/${locale}${path}`;
}

/**
 * Canonical and hreflang links for `locale`'s version of `path`.
 * Each locale is its own canonical page; pointing them all at the English URL
 * made Google treat translations as duplicates and leave them unindexed.
 */
export function localeAlternates(locale: string, path: string) {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...Object.fromEntries(routing.locales.map((loc) => [loc, localizedPath(loc, path)])),
      "x-default": localizedPath(routing.defaultLocale, path),
    },
  };
}
