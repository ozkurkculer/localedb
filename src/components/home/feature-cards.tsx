import { Globe2, Code2, Coins, Languages, Plane } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FeatureCard } from './feature-card';

export async function FeatureCards() {
    const t = await getTranslations();

    return (
        <section className="mx-auto max-w-5xl pb-24 md:pb-32">
            <div className="grid gap-6 sm:grid-cols-2">
                <FeatureCard
                    icon={<Globe2 className="h-10 w-10" />}
                    title={t('home.features.countries.title')}
                    description={t('home.features.countries.description')}
                    href="/countries"
                    variant="blue"
                    animationDelay="animate-fade-in-up-delay-4"
                />
                <FeatureCard
                    icon={<Languages className="h-10 w-10" />}
                    title={t('home.features.languages.title')}
                    description={t('home.features.languages.description')}
                    href="/languages"
                    variant="green"
                    animationDelay="animate-fade-in-up-delay-5"
                />
                <FeatureCard
                    icon={<Coins className="h-10 w-10" />}
                    title={t('home.features.currencies.title')}
                    description={t('home.features.currencies.description')}
                    href="/currencies"
                    variant="gold"
                    animationDelay="animate-fade-in-up-delay-6"
                />
                <FeatureCard
                    icon={<Plane className="h-10 w-10" />}
                    title={t('home.features.airports.title')}
                    description={t('home.features.airports.description')}
                    href="/airports"
                    variant="red"
                    animationDelay="animate-fade-in-up-delay-7"
                />
                <FeatureCard
                    icon={<Code2 className="h-10 w-10" />}
                    title={t('home.features.localeCodes.title')}
                    description={t('home.features.localeCodes.description')}
                    href="/locale-codes"
                    variant="default"
                    animationDelay="animate-fade-in-up-delay-8"
                />
            </div>
        </section>
    );
}
