import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getCountry, getAllCountryCodes, getCountryIndex } from '@/lib/countries';
import { CopyButton } from '@/components/copy-button';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Globe,
    MapPin,
    Languages as LanguagesIcon,
    Hash,
    Banknote,
    Clock,
    Calculator,
    Phone as PhoneIcon,
    Settings,
    Code2,
    Plane,
    Landmark,
    Users,
    Ruler
} from 'lucide-react';
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

    try {
        const country = await getCountry(code);

        if (!country) {
            return {
                title: 'Country Not Found'
            };
        }

        return {
            title: `${country.basics.name} - Locale Data`,
            description: `Localization data for ${country.basics.name}: currency (${country.currency.code}), date formats, number formats, phone codes, and more.`,
            openGraph: {
                title: `${country.basics.flagEmoji} ${country.basics.name} Locale Data`,
                description: `Complete localization reference for ${country.basics.name}`
            }
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
    const alpha3Map = new Map(countryIndex.map((c) => [c.alpha3 || "", c.code]));

    const style = getContinentStyle(country.basics.continent);

    return (
        <div className="container py-12">
            {/* Hero */}
            <div className="mb-12 text-center">
                {/* Flag with subtle shadow */}
                <div className="mb-4">
                    <span className={`fi fi-${country.codes.iso3166Alpha2.toLowerCase()} text-6xl sm:text-7xl md:text-8xl rounded-lg shadow-sm`} />
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
                    label="Capital"
                    value={country.basics.capital}
                    icon={<Landmark className="h-4 w-4" />}
                    accentClass={style.accentBorder}
                />
                <InfoCard
                    label="Population"
                    value={country.basics.population.toLocaleString()}
                    icon={<Users className="h-4 w-4" />}
                    accentClass={style.accentBorder}
                />
                <InfoCard
                    label="Currency"
                    value={`${country.currency.symbol} ${country.currency.code}`}
                    icon={<Banknote className="h-4 w-4" />}
                    accentClass={style.accentBorder}
                />
                <InfoCard
                    label="Calling Code"
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
                            <DataItem label="Region" value={country.basics.region} />
                            <DataItem label="Subregion" value={country.basics.subregion} />
                            <DataItem label="Continent" value={country.basics.continent} />
                            <DataItem label="Area" value={`${country.basics.area.toLocaleString()} km²`} />
                            <DataItem label="Landlocked" value={country.basics.landlocked ? 'Yes' : 'No'} />
                            <DataItem label="TLD" value={country.basics.tld.join(', ')} />
                        </div>

                        {country.basics.borders.length > 0 && (
                            <div className="col-span-full mt-4">
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Borders</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {country.basics.borders.map((border) => {
                                        const targetCode = alpha3Map.get(border) || border;
                                        return (
                                            <Link
                                                key={border}
                                                href={`/countries/${targetCode}`}
                                                className="rounded-md bg-muted px-2 py-1 font-mono text-xs transition-colors hover:bg-muted/80 hover:text-foreground"
                                            >
                                                {border}
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
                        title={`Airports (${country.airports.length})`}
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
                        <DataItem label="Code" value={country.currency.code} />
                        <DataItem label="Name" value={country.currency.name} />
                        <DataItem label="Symbol" value={country.currency.symbol} />
                        <DataItem label="Symbol Position" value={country.currency.symbolPosition} />
                        <DataItem label="Decimal Separator" value={country.currency.decimalSeparator} />
                        <DataItem label="Thousands Separator" value={country.currency.thousandsSeparator} />
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
                            <h4 className="mb-3 text-sm font-semibold">Date Format Examples</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Full
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
                                        Long
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
                                        Medium
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
                                        Short
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
                            <h4 className="mb-3 text-sm font-semibold">Time Format Examples</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Full
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
                                        Long
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
                                        Medium
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
                                        Short
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
                            <h4 className="mb-3 text-sm font-semibold">Additional Info</h4>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <DataItem
                                    label="First Day of Week"
                                    value={
                                        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][
                                        country.dateTime.firstDayOfWeek - 1
                                        ]
                                    }
                                />
                                <DataItem label="Clock Format" value={country.dateTime.clockFormat} />
                                <DataItem label="Primary Timezone" value={country.dateTime.primaryTimezone} />
                                <DataItem label="UTC Offset" value={country.dateTime.utcOffset} />
                            </div>
                        </div>

                        {/* Timezones */}
                        {country.dateTime.timezones.length > 0 && (
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">Timezones</h4>
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
                        <DataItem label="Decimal Separator" value={country.numberFormat.decimalSeparator} />
                        <DataItem label="Thousands Separator" value={country.numberFormat.thousandsSeparator} />
                        <DataItem label="Digit Grouping" value={country.numberFormat.digitGrouping} />
                        <DataItem label="Numbering System" value={country.numberFormat.numberingSystem} />
                    </div>

                    <div className="mt-4 rounded-lg border border-border/30 bg-muted/40 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Example</p>
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
                            <DataItem label="Calling Code" value={country.phone.callingCode} />
                            <DataItem label="Trunk Prefix" value={country.phone.trunkPrefix || 'N/A'} />
                            <DataItem label="International Prefix" value={country.phone.internationalPrefix} />
                            <DataItem
                                label="Subscriber Number Lengths"
                                value={country.phone.subscriberNumberLengths.join(', ')}
                            />
                        </div>

                        {/* Example Format */}
                        <div className="rounded-lg border border-border/30 bg-muted/40 p-4">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Example Format
                            </p>
                            <p className="mt-1.5 font-mono text-xl font-bold text-foreground">
                                {country.phone.exampleFormat}
                            </p>
                        </div>

                        {/* Format Patterns Table */}
                        {country.phone.formats.length > 0 && (
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">Format Patterns</h4>
                                <div className="rounded-lg border border-border/40">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableHead className="text-xs font-semibold">Pattern</TableHead>
                                                <TableHead className="text-xs font-semibold">Format</TableHead>
                                                <TableHead className="text-xs font-semibold">Leading Digits</TableHead>
                                                <TableHead className="text-xs font-semibold">National Prefix</TableHead>
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
                                <h4 className="mb-3 text-sm font-semibold">Phone Number Types</h4>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {Object.entries(country.phone.types).map(([typeName, typeData]) => {
                                        if (!typeData) return null;
                                        const labels: Record<string, string> = {
                                            fixedLine: 'Fixed Line',
                                            mobile: 'Mobile',
                                            tollFree: 'Toll Free',
                                            premiumRate: 'Premium Rate',
                                            sharedCost: 'Shared Cost',
                                            voip: 'VoIP',
                                            uan: 'UAN'
                                        };
                                        return (
                                            <div key={typeName} className="rounded-lg bg-muted/30 p-4">
                                                <div className="mb-2 text-sm font-semibold">
                                                    {labels[typeName] || typeName}
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Example</span>
                                                        <span className="font-mono text-xs">
                                                            {typeData.exampleNumber}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Lengths</span>
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
                            <DataItem label="General Pattern" value={country.phone.generalPattern} />
                        </div>
                    </div>
                </Section>

                {/* Locale Settings */}
                <Section title={t('sections.locale')} icon={<Settings className="h-4 w-4 text-muted-foreground" />}>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DataItem label="Writing Direction" value={country.locale.writingDirection.toUpperCase()} />
                        <DataItem label="Measurement System" value={country.locale.measurementSystem} />
                        <DataItem label="Temperature Scale" value={country.locale.temperatureScale} />
                        <DataItem label="Paper Size" value={country.locale.paperSize} />
                        <DataItem label="Driving Side" value={country.locale.drivingSide} />
                        <DataItem label="Week Numbering" value={country.locale.weekNumbering} />
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
