import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getAllRegions, getCountriesByRegion } from '@/lib/countries';
import { getContinentStyle } from '@/components/countries/continent-variants';
import { getTranslations } from 'next-intl/server';
import { Globe } from 'lucide-react';

interface RegionPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export async function generateStaticParams() {
    const regions = await getAllRegions();
    return regions.map((region) => ({
        slug: region.toLowerCase()
    }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
    const { slug, locale } = await params;
    // Simple title case for metadata
    const regionName = slug.charAt(0).toUpperCase() + slug.slice(1);
    const t = await getTranslations({ locale, namespace: 'regions.meta' });

    const ogUrl = new URL('https://localedb.org/og_image.png');
    ogUrl.searchParams.set('mode', 'site'); // Using site mode for regions for now, or could add region mode
    ogUrl.searchParams.set('title', `${regionName} Region`);
    ogUrl.searchParams.set('subtitle', `Countries and localization data for ${regionName}`);
    ogUrl.searchParams.set('icon', '🌍');

    return {
        title: t('title', { region: regionName }),
        description: t('description', { region: regionName }),
        alternates: {
            canonical: `/regions/${slug}`,
        },
        openGraph: {
            title: t('ogTitle', { region: regionName }),
            description: t('ogDescription', { region: regionName }),
            url: `/regions/${slug}`,
            siteName: "LocaleDB",
            images: [
                {
                    url: ogUrl.toString(),
                    width: 1200,
                    height: 630,
                    alt: t('ogAlt', { region: regionName })
                }
            ],
            locale: locale,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: t('title', { region: regionName }),
            description: t('description', { region: regionName }),
            images: [ogUrl.toString()],
        }
    };
}

export default async function RegionPage({ params }: RegionPageProps) {
    const { slug, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'regions' });

    // We need to match the slug back to the actual continent name in DB if it's case sensitive?
    // The helper getCountriesByRegion is case-insensitive, so 'europe' works for 'Europe'.
    const countries = await getCountriesByRegion(slug);

    if (!countries || countries.length === 0) {
        notFound();
    }

    // Get the display name from the first country's continent field to be accurate
    const displayRegionName = countries[0].continent;
    const style = getContinentStyle(displayRegionName);

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: t('breadcrumbs.home'),
                item: 'https://localedb.org'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: t('breadcrumbs.regions'),
                item: 'https://localedb.org/regions' // We might need a regions index page later
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: displayRegionName,
                item: `https://localedb.org/regions/${slug}`
            }
        ]
    };

    return (
        <div className="container py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            {/* Hero */}
            <div className="mb-12 text-center">
                <div className="mb-4 flex justify-center">
                    <div className={`rounded-full p-4 ${style.badgeBg}`}>
                        <Globe className={`h-12 w-12 ${style.badgeText}`} />
                    </div>
                </div>
                <h1
                    className={`mb-4 text-4xl font-bold sm:text-5xl bg-gradient-to-br ${style.nameGradient} bg-clip-text text-transparent`}
                >
                    {displayRegionName}
                </h1>
                <p className="text-xl text-muted-foreground">{t('hero.subtitle', { count: countries.length })}</p>
            </div>

            {/* Countries Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {countries.map((country) => (
                    <Link
                        key={country.code}
                        href={`/countries/${country.code}`}
                        className="group relative overflow-hidden rounded-lg border border-border/40 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <span className={`fi fi-${country.code.toLowerCase()} text-4xl rounded shadow-sm`} />
                            <span className="font-mono text-xs text-muted-foreground">{country.code}</span>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold transition-colors group-hover:text-primary">{country.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {country.region || country.continent}
                            </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                                {country.currencyCode}
                            </span>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                                {country.primaryLocale}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
