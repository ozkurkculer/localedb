import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getCountry, getAllCountryCodes, getCountryIndex } from '@/lib/countries';
import { CopyButton } from '@/components/copy-button';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    MapPin,
    Globe,
    Clock,
    Phone,
    CreditCard,
    Languages,
    Calendar,
    Languages as LanguagesIcon,
    Hash,
    Banknote,
    Calculator,
    Phone as PhoneIcon,
    Settings,
    Code2,
    Plane,
    Landmark,
    Users,
    Ruler
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getContinentStyle } from '@/components/countries/continent-variants';
import { AirportsDrawer } from '@/components/countries/airports-drawer';

interface CountryPageProps {
    params: Promise<{
        code: string;
    }>;
}

// Generate static params for all countries
export async function generateStaticParams() {
    const codes = await getAllCountryCodes();

    return codes.map((code) => ({
        code: code
    }));
}

// Prevent dynamic rendering for unlisted codes
export const dynamicParams = false;

// Generate metadata for each country page
export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
    const { code } = await params;
    const t = await getTranslations('countries.detail');

    try {
        const country = await getCountry(code);

        if (!country) {
            return {
                title: 'Country Not Found'
            };
        }

        const ogUrl = new URL('https://localedb.org/og_image.png');
        ogUrl.searchParams.set('mode', 'country');
        ogUrl.searchParams.set('title', country.basics.name);
        ogUrl.searchParams.set('subtitle', `${country.basics.region} • ${country.basics.subregion}`);
        ogUrl.searchParams.set('icon', country.basics.flagEmoji);

        return {
            title: t('meta.title', { name: country.basics.name }),
            description: t('meta.description', {
                name: country.basics.name,
                currency: country.currency.code,
                phone: country.phone.callingCode,
                capital: country.basics.capital,
                region: country.basics.region
            }),
            openGraph: {
                title: t('meta.ogTitle', { flag: country.basics.flagEmoji, name: country.basics.name }),
                description: t('meta.ogDescription', { name: country.basics.name, currency: country.currency.code, phone: country.phone.callingCode, timezones: country.dateTime.timezones.join(', ') }),
                images: [
                    {
                        url: ogUrl.toString(),
                        width: 1200,
                        height: 630,
                        alt: t('meta.ogAlt', { name: country.basics.name })
                    }
                ]
            },
            keywords: [
                country.basics.name,
                country.basics.nativeName,
                t('meta.keywords.localeData'),
                t('meta.keywords.currencyFormat'),
                t('meta.keywords.dateFormat'),
                `ISO ${country.codes.iso3166Alpha2}`,
                country.currency.code,
                t('meta.keywords.localization'),
                t('meta.keywords.formatting')
            ]
        };
    } catch {
        return {
            title: 'Country Not Found'
        };
    }
}

export default async function CountryPage({ params }: CountryPageProps) {
    const { code } = await params;
    const t = await getTranslations('countries.detail');
    const now = new Date();

    let country;
    try {
        country = await getCountry(code);
    } catch {
        notFound();
    }

    // If country is null after try-catch, redirect to 404
    if (!country) {
        notFound();
    }

    // Load index for alpha3 -> alpha2 mapping
    const countryIndex = await getCountryIndex();
    const alpha3Map = new Map(countryIndex.map((c) => [c.alpha3 || '', c.code]));

    const style = getContinentStyle(country.basics.continent);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Country',
        name: country.basics.name,
        alternateName: country.basics.nativeName,
        identifier: country.codes.iso3166Alpha2,
        url: `https://localedb.org/countries/${country.codes.iso3166Alpha2}`,
        conteninent: {
            '@type': 'Continent',
            name: country.basics.continent
        },
        currency: {
            '@type': 'Currency',
            name: country.currency.name,
            isoCode: country.currency.code,
            symbol: country.currency.symbol
        },
        telephone: `+${country.phone.callingCode}`
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://localedb.org'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Countries',
                item: 'https://localedb.org/countries'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: country.basics.name,
                item: `https://localedb.org/countries/${country.codes.iso3166Alpha2}`
            }
        ]
    };

    return (
        <div className="container py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            {/* Hero */}
            <div className="mb-12 text-center">
                {/* Flag with subtle shadow */}
                <div className="mb-4">
                    <span
                        className={`fi fi-${country.codes.iso3166Alpha2.toLowerCase()} text-6xl sm:text-7xl md:text-8xl rounded-lg shadow-sm`}
                    />
                </div>

                {/* Country Name - continent-colored gradient */}
                <h1
                    className={`mb-2 text-2xl font-bold sm:text-3xl md:text-4xl bg-gradient-to-br ${style.nameGradient} bg-clip-text text-transparent`}
                >
                    {country.basics.name}
                </h1>

                <p className="text-base text-muted-foreground sm:text-lg md:text-xl">{country.basics.officialName}</p>

                {/* Continent badge + native name */}
                <div className="mt-3 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badgeBg} ${style.badgeText}`}
                    >
                        {country.basics.continent}
                    </span>
                    <span className="text-border">|</span>
                    <span>{country.basics.nativeName}</span>
                </div>
            </div>

            {/* Quick Info Cards */}
            <div className="mx-auto mb-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                    label={t('capital')}
                    value={country.basics.capital}
                    icon={<Landmark className="h-4 w-4" />}
                    accentClass={style.accentBorder}
                />
                <InfoCard
                    label={t('population')}
                    value={country.basics.population.toLocaleString()}
                    icon={<Users className="h-4 w-4" />}
                    accentClass={style.accentBorder}
                />
                <InfoCard
                    label={t('currency.name')}
                    value={`${country.currency.symbol} ${country.currency.code}`}
                    icon={<Banknote className="h-4 w-4" />}
                    accentClass={style.accentBorder}
                />
                <InfoCard
                    label={t('callingCode')}
                    value={country.phone.callingCode}
                    icon={<PhoneIcon className="h-4 w-4" />}
                    accentClass={style.accentBorder}
                />
            </div>

            {/* Main content sections */}
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Languages & Geography */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Languages */}
                    <Section
                        title={t('sections.languages')}
                        icon={<LanguagesIcon className="h-4 w-4 text-muted-foreground" />}
                    >
                        <div className="grid gap-2">
                            {country.basics.languages.map((lang) => (
                                <div
                                    key={lang.code}
                                    className="flex items-center justify-between rounded-md bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                                >
                                    <div>
                                        <div className="text-sm font-medium">{lang.name}</div>
                                        <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
                                    </div>
                                    <code className="rounded-md bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
                                        {lang.code}
                                    </code>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Geography */}
                    <Section
                        title={t('sections.geography')}
                        icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <DataItem label={t('geography.region')} value={country.basics.region} />
                            <DataItem label={t('geography.subregion')} value={country.basics.subregion} />
                            <DataItem
                                label={t('geography.continent')}
                                value={
                                    // Try to translate continent if key exists, otherwise fallback to original
                                    // Assuming continent names map to keys like 'europe', 'asia', etc.
                                    ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'].includes(country.basics.continent)
                                        ? (await getTranslations('countries.filters.continent'))(country.basics.continent.toLowerCase().replace(' ', ''))
                                        : country.basics.continent
                                }
                            />
                            <DataItem label={t('geography.area')} value={`${country.basics.area.toLocaleString()} km²`} />
                            <DataItem label={t('geography.landlocked')} value={country.basics.landlocked ? t('geography.yes') : t('geography.no')} />
                            <DataItem label={t('geography.tld')} value={country.basics.tld.join(', ')} />
                        </div>

                        {country.basics.borders.length > 0 && (
                            <div className="col-span-full mt-6">
                                <p className="mb-3 text-sm font-medium text-muted-foreground">{t('geography.neighbors')}</p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {country.basics.borders.map((border) => {
                                        const targetCode = alpha3Map.get(border) || border;
                                        // Find the country in the index to get the real name
                                        const neighbor = countryIndex.find((c) => c.code === targetCode);
                                        const name = neighbor ? neighbor.name : border;

                                        return (
                                            <Link
                                                key={border}
                                                href={`/countries/${targetCode}`}
                                                className="group flex items-center gap-2 rounded-md border border-border/40 bg-background/50 p-2 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm"
                                            >
                                                <span
                                                    className={`fi fi-${targetCode.toLowerCase()} text-xl rounded shadow-sm`}
                                                />
                                                <span className="truncate text-xs font-medium group-hover:text-primary">
                                                    {name}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Section>
                </div>

                {/* Airports */}
                {country.airports && country.airports.length > 0 && (
                    <Section
                        title={t('airports.count', { count: country.airports.length })}
                        icon={<Plane className="h-4 w-4 text-muted-foreground" />}
                    >
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {country.airports.slice(0, 9).map((airport, i) => (
                                <div key={i} className="rounded-md bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                                    <div className="mb-1 flex items-center gap-2">
                                        <code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs font-semibold">
                                            {airport.iata || airport.icao}
                                        </code>
                                    </div>
                                    <div className="line-clamp-1 text-sm font-medium">{airport.name}</div>
                                    <div className="text-xs text-muted-foreground">{airport.region}</div>
                                </div>
                            ))}
                        </div>

                        {country.airports.length > 9 && (
                            <div className="mt-4 text-center">
                                <AirportsDrawer airports={country.airports} countryName={country.basics.name} />
                            </div>
                        )}
                    </Section>
                )}

                {/* Country Codes */}
                <Section title={t('sections.codes')} icon={<Hash className="h-4 w-4 text-muted-foreground" />}>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DataItem label="ISO 3166-1 Alpha-2" value={country.codes.iso3166Alpha2} />
                        <DataItem label="ISO 3166-1 Alpha-3" value={country.codes.iso3166Alpha3} />
                        <DataItem label="ISO 3166-1 Numeric" value={country.codes.iso3166Numeric} />
                        <DataItem label="BCP 47" value={country.codes.bcp47.join(', ')} />
                        <DataItem label="IOC" value={country.codes.ioc} />
                        <DataItem label="FIFA" value={country.codes.fifa} />
                    </div>
                </Section>

                {/* Currency Format */}
                <Section
                    title={t('sections.currencyFormat')}
                    icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DataItem label={t('currency.code')} value={country.currency.code} />
                        <DataItem label={t('currency.name')} value={country.currency.name} />
                        <DataItem label={t('currency.symbol')} value={country.currency.symbol} />
                        <DataItem label={t('currency.symbolPosition')} value={country.currency.symbolPosition} />
                        <DataItem label={t('currency.decimalSeparator')} value={country.currency.decimalSeparator} />
                        <DataItem label={t('currency.thousandsSeparator')} value={country.currency.thousandsSeparator} />
                    </div>

                    <div className="mt-4 rounded-lg border border-border/30 bg-muted/40 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Example</p>
                        <p className="mt-1.5 font-mono text-xl font-bold text-foreground">{country.currency.example}</p>
                    </div>
                </Section>

                {/* Date & Time Formats */}
                <Section title={t('sections.dateTime')} icon={<Clock className="h-4 w-4 text-muted-foreground" />}>
                    <div className="space-y-6">
                        {/* Date Format Examples */}
                        <div>
                            <h4 className="mb-3 text-sm font-semibold">{t('dateTime.dateFormats')}</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('dateTime.full')}
                                    </p>
                                    <p className="mt-1.5 font-mono text-base font-semibold text-foreground">
                                        {new Intl.DateTimeFormat(country.codes.bcp47[0], { dateStyle: 'full' }).format(
                                            now
                                        )}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                        {country.dateTime.dateFormats.full}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('dateTime.long')}
                                    </p>
                                    <p className="mt-1.5 font-mono text-base font-semibold text-foreground">
                                        {new Intl.DateTimeFormat(country.codes.bcp47[0], { dateStyle: 'long' }).format(
                                            now
                                        )}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                        {country.dateTime.dateFormats.long}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('dateTime.medium')}
                                    </p>
                                    <p className="mt-1.5 font-mono text-base font-semibold text-foreground">
                                        {new Intl.DateTimeFormat(country.codes.bcp47[0], {
                                            dateStyle: 'medium'
                                        }).format(now)}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                        {country.dateTime.dateFormats.medium}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('dateTime.short')}
                                    </p>
                                    <p className="mt-1.5 font-mono text-base font-semibold text-foreground">
                                        {new Intl.DateTimeFormat(country.codes.bcp47[0], { dateStyle: 'short' }).format(
                                            now
                                        )}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                        {country.dateTime.dateFormats.short}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Time Format Examples */}
                        <div>
                            <h4 className="mb-3 text-sm font-semibold">{t('dateTime.timeFormats')}</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('dateTime.full')}
                                    </p>
                                    <p className="mt-1.5 font-mono text-base font-semibold text-foreground">
                                        {new Intl.DateTimeFormat(country.codes.bcp47[0], { timeStyle: 'full' }).format(
                                            now
                                        )}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                        {country.dateTime.timeFormats.full}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('dateTime.long')}
                                    </p>
                                    <p className="mt-1.5 font-mono text-base font-semibold text-foreground">
                                        {new Intl.DateTimeFormat(country.codes.bcp47[0], { timeStyle: 'long' }).format(
                                            now
                                        )}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                        {country.dateTime.timeFormats.long}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('dateTime.medium')}
                                    </p>
                                    <p className="mt-1.5 font-mono text-base font-semibold text-foreground">
                                        {new Intl.DateTimeFormat(country.codes.bcp47[0], {
                                            timeStyle: 'medium'
                                        }).format(now)}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                        {country.dateTime.timeFormats.medium}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {t('dateTime.short')}
                                    </p>
                                    <p className="mt-1.5 font-mono text-base font-semibold text-foreground">
                                        {new Intl.DateTimeFormat(country.codes.bcp47[0], { timeStyle: 'short' }).format(
                                            now
                                        )}
                                    </p>
                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                        {country.dateTime.timeFormats.short}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div>
                            <h4 className="mb-3 text-sm font-semibold">{t('dateTime.additionalInfo')}</h4>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <DataItem
                                    label={t('dateTime.firstDayOfWeek')}
                                    value={
                                        [t('dateTime.monday'), t('dateTime.tuesday'), t('dateTime.wednesday'), t('dateTime.thursday'), t('dateTime.friday'), t('dateTime.saturday'), t('dateTime.sunday')][
                                        country.dateTime.firstDayOfWeek - 1
                                        ]
                                    }
                                />
                                <DataItem label={t('dateTime.clockFormat')} value={country.dateTime.clockFormat} />
                                <DataItem label={t('dateTime.primaryTimezone')} value={country.dateTime.primaryTimezone} />
                                <DataItem label={t('dateTime.utcOffset')} value={country.dateTime.utcOffset} />
                            </div>
                        </div>

                        {/* Timezones */}
                        {country.dateTime.timezones.length > 0 && (
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">{t('dateTime.timezones')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {country.dateTime.timezones.map((tz, i) => (
                                        <code key={i} className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                                            {tz}
                                        </code>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Number Formatting */}
                <Section
                    title={t('sections.numberFormat')}
                    icon={<Calculator className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DataItem label={t('numberFormat.decimalSeparator')} value={country.numberFormat.decimalSeparator} />
                        <DataItem label={t('numberFormat.thousandsSeparator')} value={country.numberFormat.thousandsSeparator} />
                        <DataItem label={t('numberFormat.digitGrouping')} value={country.numberFormat.digitGrouping} />
                        <DataItem label={t('numberFormat.numberingSystem')} value={country.numberFormat.numberingSystem} />
                    </div>

                    <div className="mt-4 rounded-lg border border-border/30 bg-muted/40 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('numberFormat.example')}</p>
                        <p className="mt-1.5 font-mono text-xl font-bold text-foreground">
                            {country.numberFormat.example}
                        </p>
                    </div>
                </Section>

                {/* Phone Formatting */}
                <Section title={t('sections.phone')} icon={<PhoneIcon className="h-4 w-4 text-muted-foreground" />}>
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <DataItem label={t('phone.callingCode')} value={country.phone.callingCode} />
                            <DataItem label={t('phone.trunkPrefix')} value={country.phone.trunkPrefix || t('common.na')} />
                            <DataItem label={t('phone.internationalPrefix')} value={country.phone.internationalPrefix} />
                            <DataItem
                                label={t('phone.subscriberNumberLengths')}
                                value={country.phone.subscriberNumberLengths.join(', ')}
                            />
                        </div>

                        {/* Example Format */}
                        <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {t('phone.exampleFormat')}
                            </p>
                            <p className="mt-1.5 font-mono text-xl font-bold text-foreground">
                                {country.phone.exampleFormat}
                            </p>
                        </div>

                        {/* Format Patterns Table */}
                        {country.phone.formats.length > 0 && (
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">{t('phone.patterns')}</h4>
                                <div className="rounded-lg border border-border/40">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableHead className="text-xs font-semibold">{t('phone.table.pattern')}</TableHead>
                                                <TableHead className="text-xs font-semibold">{t('phone.table.format')}</TableHead>
                                                <TableHead className="text-xs font-semibold">{t('phone.table.leadingDigits')}</TableHead>
                                                <TableHead className="text-xs font-semibold">{t('phone.table.nationalPrefix')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {country.phone.formats.map((fmt, i) => (
                                                <TableRow key={i} className={i % 2 === 1 ? 'bg-muted/15' : ''}>
                                                    <TableCell className="font-mono text-xs">{fmt.pattern}</TableCell>
                                                    <TableCell className="font-mono text-xs">{fmt.format}</TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {fmt.leadingDigits?.join(', ') || '—'}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {fmt.nationalPrefixRule || '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* Phone Number Types */}
                        {Object.keys(country.phone.types).length > 0 && (
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">{t('phone.types')}</h4>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {Object.entries(country.phone.types).map(([typeName, typeData]) => {
                                        if (!typeData) return null;
                                        const labels: Record<string, string> = {
                                            fixedLine: t('phone.typeLabels.fixedLine'),
                                            mobile: t('phone.typeLabels.mobile'),
                                            tollFree: t('phone.typeLabels.tollFree'),
                                            premiumRate: t('phone.typeLabels.premiumRate'),
                                            sharedCost: t('phone.typeLabels.sharedCost'),
                                            voip: t('phone.typeLabels.voip'),
                                            uan: t('phone.typeLabels.uan')
                                        };
                                        return (
                                            <div key={typeName} className="rounded-lg bg-muted/30 p-4">
                                                <div className="mb-2 text-sm font-semibold">
                                                    {labels[typeName] || typeName}
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">{t('phone.example')}</span>
                                                        <span className="font-mono text-xs">
                                                            {typeData.exampleNumber}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">{t('phone.lengths')}</span>
                                                        <span className="font-mono text-xs">
                                                            {typeData.possibleLengths.join(', ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* General Pattern */}
                        <div>
                            <DataItem label={t('phone.patterns')} value={country.phone.generalPattern} />
                        </div>
                    </div>
                </Section>

                {/* Locale Settings */}
                <Section title={t('sections.locale')} icon={<Settings className="h-4 w-4 text-muted-foreground" />}>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DataItem label={t('locale.writingDirection')} value={country.locale.writingDirection.toUpperCase()} />
                        <DataItem label={t('locale.measurementSystem')} value={country.locale.measurementSystem} />
                        <DataItem label={t('locale.temperatureScale')} value={country.locale.temperatureScale} />
                        <DataItem label={t('locale.paperSize')} value={country.locale.paperSize} />
                        <DataItem label={t('locale.drivingSide')} value={country.locale.drivingSide} />
                        <DataItem label={t('locale.weekNumbering')} value={country.locale.weekNumbering} />
                    </div>
                </Section>

                {/* Raw JSON Export */}
                <Section title={t('sections.rawJson')} icon={<Code2 className="h-4 w-4 text-muted-foreground" />}>
                    <div className="relative">
                        <div className="absolute right-2 top-2">
                            <CopyButton value={JSON.stringify(country, null, 2)} label="Country data" />
                        </div>
                        <pre className="overflow-x-auto max-h-96 rounded-lg bg-muted p-4 text-xs">
                            <code>{JSON.stringify(country, null, 2)}</code>
                        </pre>
                    </div>
                </Section>
            </div>
        </div>
    );
}

// Helper Components

function InfoCard({
    label,
    value,
    icon,
    accentClass
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    accentClass?: string;
}) {
    return (
        <div
            className={`rounded-lg border border-border/40 bg-card p-4 ${accentClass ? `border-t-2 ${accentClass}` : ''}`}
        >
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                {icon}
                <p className="text-sm font-medium">{label}</p>
            </div>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-border/40 bg-card">
            {/* Section header with icon */}
            <div className="flex items-center gap-3 border-b border-border/30 px-6 py-4">
                {icon && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">{icon}</div>
                )}
                <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
            </div>
            {/* Section body */}
            <div className="p-6">{children}</div>
        </div>
    );
}

function DataItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="group relative rounded-md bg-muted/30 px-3 py-2.5">
            <p className="mb-0.5 text-xs font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-sm text-foreground">{value}</p>
                <CopyButton
                    value={value}
                    label={label}
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                />
            </div>
        </div>
    );
}
