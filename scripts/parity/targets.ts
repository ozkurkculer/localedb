/**
 * URL lists for the parity snapshot.
 *
 * - `sample`: a representative slice of every locale (each page type, a few
 *   detail pages, 404s) plus the redirect / locale-detection edge cases.
 * - `sitemap`: every URL in `<base>/sitemap.xml` plus the same edge cases.
 */

export interface Target {
    /** Path plus query, e.g. `/tr/countries/TR` or `/og-image?title=x`. */
    path: string;
    /** Extra request headers (locale detection cases). */
    headers?: Record<string, string>;
}

// Mirrors src/i18n/routing.ts (importing it here would pull in next-intl/navigation).
export const LOCALES = ['en', 'tr', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ja'];
export const DEFAULT_LOCALE = 'en';

const SAMPLE_PAGES = [
    '',
    '/about',
    '/contributing',
    '/roadmap',
    '/updates',
    '/countries',
    '/currencies',
    '/languages',
    '/airports',
    '/locale-codes',
    '/privacy',
    '/terms',
    '/docs',
    '/export',
    '/phone-numbers',
    '/countries/TR',
    '/countries/US',
    '/countries/JP',
    '/countries/SA',
    '/countries/XK',
    '/currencies/USD',
    '/currencies/EUR',
    '/currencies/JPY',
    '/languages/en',
    '/languages/ar',
    '/languages/tr',
    '/regions/europe',
    '/regions/asia',
    '/regions/north-america',
    // 404s inside a valid locale
    '/countries/ZZ',
    '/does-not-exist',
];

/** Redirects, locale detection, 404s outside a locale, non-page routes. Not in the sitemap. */
export const EDGE_CASES: Target[] = [
    { path: '/en' },
    { path: '/en/countries/TR' },
    { path: '/tr/' },
    { path: '/xx' },
    { path: '/xx/countries/TR' },
    { path: '/api' },
    { path: '/tr/api' },
    { path: '/countries/UNK' },
    { path: '/tr/countries/UNK' },
    { path: '/regions/north%20america' },
    { path: '/tr/regions/south%20america' },
    { path: '/og-image' },
    { path: '/og-image?title=Test&subtitle=Parity' },
    { path: '/og_image.png' },
    { path: '/favicon.ico' },
    { path: '/robots.txt' },
    { path: '/api/countries' },
    { path: '/', headers: { 'accept-language': 'tr-TR,tr;q=0.9' } },
    { path: '/', headers: { 'accept-language': 'ar' } },
    { path: '/countries', headers: { 'accept-language': 'ja' } },
    { path: '/', headers: { cookie: 'NEXT_LOCALE=ru' } },
    { path: '/tr', headers: { cookie: 'NEXT_LOCALE=en' } },
];

function localized(locale: string, page: string): string {
    if (locale === DEFAULT_LOCALE) return page || '/';
    return `/${locale}${page}`;
}

export function sampleTargets(): Target[] {
    const pages = LOCALES.flatMap((locale) => SAMPLE_PAGES.map((page) => ({ path: localized(locale, page) })));
    return [...pages, ...EDGE_CASES];
}

/** Every `<loc>` in the base's sitemap, re-rooted onto its path (the sitemap always says https://localedb.org). */
export async function sitemapTargets(base: string): Promise<Target[]> {
    const res = await fetch(new URL('/sitemap.xml', base));
    if (!res.ok) throw new Error(`sitemap.xml: HTTP ${res.status}`);
    const xml = await res.text();
    const paths = new Set<string>();
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const url = new URL(match[1].trim());
        paths.add(url.pathname + url.search);
    }
    return [...[...paths].map((path) => ({ path })), ...EDGE_CASES];
}

export function targetKey(target: Target): string {
    if (!target.headers) return target.path;
    const h = Object.entries(target.headers)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
    return `${target.path} [${h}]`;
}
