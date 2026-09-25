import { Link } from '@/i18n/routing';
import NextLink from 'next/link';
import { ArrowRight, Code2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { getCountry, getCountryIndex } from '@/lib/countries';
import { DitherBackground } from './dither-background';
import { LocaleDataBoxes, type HeroCountrySample } from './locale-data-boxes';

const SAMPLE_COUNT = 24;

/** Picks a random set of countries (per build) to surface in the hero's data boxes. */
async function getHeroSamples(): Promise<HeroCountrySample[]> {
    const index = await getCountryIndex();
    const picks = index
        .filter((entry) => entry.name.length <= 18)
        .sort(() => Math.random() - 0.5)
        .slice(0, SAMPLE_COUNT);

    const countries = await Promise.all(picks.map((entry) => getCountry(entry.code)));

    return countries.flatMap((country) => {
        if (!country) return [];
        const { codes, currency, numberFormat, dateTime, phone, basics } = country;
        const rows = [
            { label: 'bcp47', value: codes.bcp47?.[0] },
            {
                label: 'currency',
                value: currency?.code && [currency.code, currency.symbol].filter((part, i) => i === 0 || part !== currency.code).join(' '),
            },
            { label: 'number', value: numberFormat?.example },
            { label: 'date', value: dateTime?.datePatterns?.short },
            { label: 'phone', value: phone?.callingCode },
        ];
        if (rows.some((row) => !row.value)) return [];
        return [
            {
                code: codes.iso3166Alpha2,
                alpha3: codes.iso3166Alpha3,
                name: basics.name.toUpperCase(),
                rows: rows as HeroCountrySample['rows'],
            },
        ];
    });
}

export async function Hero() {
    const [t, samples] = await Promise.all([getTranslations(), getHeroSamples()]);

    return (
        <section className="relative isolate overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <DitherBackground />
                <LocaleDataBoxes samples={samples} className="absolute inset-0 hidden xl:block" />
            </div>

            <div className="container">
                <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 py-24 text-center md:py-32 lg:py-40">
                    <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up-lcp">
                        {t('home.title.the')}{' '}
                        <span className="bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent">
                            {t('home.title.localization')}
                        </span>{' '}
                        {t('home.title.forDevelopers')}
                    </h1>

                    <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in-up-delay-2">
                        {t('site.description')}
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-up-delay-3">
                        <Button size="lg" asChild>
                            <Link href="/countries">
                                {t('home.cta.browseCountries')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <NextLink href={siteConfig.links.github} target="_blank">
                                <Code2 className="mr-2 h-4 w-4" />
                                {t('home.cta.viewOnGitHub')}
                            </NextLink>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
