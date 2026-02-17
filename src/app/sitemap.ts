import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@/config/site';
import { getAllCountryCodes } from '@/lib/countries';
import { getAllCurrencyCodes } from '@/lib/currencies';
import { getAllLanguageCodes } from '@/lib/languages';
import { getAllRegions } from '@/lib/countries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.url;

    // Get all dynamic route codes
    const countryCodes = await getAllCountryCodes();
    const currencyCodes = await getAllCurrencyCodes();
    const languageCodes = await getAllLanguageCodes();
    const regions = await getAllRegions();

    const sitemap: MetadataRoute.Sitemap = [];

    // Static pages for each locale
    const staticPages = [
        '',
        '/about',
        '/contributing',
        '/roadmap',
        '/updates',
        '/countries',
        '/currencies',
        '/languages',
        '/airports',
        '/locale-codes'
    ];

    routing.locales.forEach((locale) => {
        const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;

        // Add static pages
        staticPages.forEach((page) => {
            sitemap.push({
                url: `${baseUrl}${localePrefix}${page}`,
                lastModified: new Date(),
                changeFrequency: page === '' ? 'weekly' : 'monthly',
                priority: page === '' ? 1.0 : 0.8,
                alternates: {
                    languages: Object.fromEntries(
                        routing.locales.map((loc) => {
                            const altPrefix = loc === routing.defaultLocale ? '' : `/${loc}`;
                            return [loc, `${baseUrl}${altPrefix}${page}`];
                        })
                    )
                }
            });
        });

        // Add country detail pages
        countryCodes.forEach((code) => {
            sitemap.push({
                url: `${baseUrl}${localePrefix}/countries/${code}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
                alternates: {
                    languages: Object.fromEntries(
                        routing.locales.map((loc) => {
                            const altPrefix = loc === routing.defaultLocale ? '' : `/${loc}`;
                            return [loc, `${baseUrl}${altPrefix}/countries/${code}`];
                        })
                    )
                }
            });
        });

        // Add currency detail pages
        currencyCodes.forEach((code) => {
            sitemap.push({
                url: `${baseUrl}${localePrefix}/currencies/${code}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
                alternates: {
                    languages: Object.fromEntries(
                        routing.locales.map((loc) => {
                            const altPrefix = loc === routing.defaultLocale ? '' : `/${loc}`;
                            return [loc, `${baseUrl}${altPrefix}/currencies/${code}`];
                        })
                    )
                }
            });
        });

        // Add language detail pages
        languageCodes.forEach((code) => {
            sitemap.push({
                url: `${baseUrl}${localePrefix}/languages/${code}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
                alternates: {
                    languages: Object.fromEntries(
                        routing.locales.map((loc) => {
                            const altPrefix = loc === routing.defaultLocale ? '' : `/${loc}`;
                            return [loc, `${baseUrl}${altPrefix}/languages/${code}`];
                        })
                    )
                }
            });
        });

        // Add region pages
        regions.forEach((region) => {
            const slug = region.toLowerCase();
            sitemap.push({
                url: `${baseUrl}${localePrefix}/regions/${slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
                alternates: {
                    languages: Object.fromEntries(
                        routing.locales.map((loc) => {
                            const altPrefix = loc === routing.defaultLocale ? '' : `/${loc}`;
                            return [loc, `${baseUrl}${altPrefix}/regions/${slug}`];
                        })
                    )
                }
            });
        });
    });
    return sitemap;
}
