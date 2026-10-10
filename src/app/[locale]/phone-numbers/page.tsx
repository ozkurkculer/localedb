import { PhoneNumbersClient, PhoneNumberEntry } from '@/components/phone/phone-numbers-client';
import { getAllCountryCodes, getCountry } from '@/lib/countries';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'phoneNumbers.meta' });

    return {
        title: t('title'),
        description: t('description'),
        alternates: localeAlternates(locale, "/phone-numbers"),
        openGraph: {
            title: t('ogTitle'),
            description: t('ogDescription'),
            url: "/phone-numbers",
            siteName: "LocaleDB",
            images: [
                {
                    url: "/og_image.png",
                    width: 1200,
                    height: 630,
                    alt: t('ogAlt'),
                },
            ],
            locale: locale,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: t('title'),
            description: t('description'),
            images: ["/og_image.png"],
        },
    };
}

// Helper to read country data
async function getPhoneData(): Promise<PhoneNumberEntry[]> {
    const codes = await getAllCountryCodes();
    const entries: PhoneNumberEntry[] = [];

    for (const code of codes) {
        try {
            const country = await getCountry(code);

            // Skip if missing or no phone data
            if (!country?.phone) continue;

            // Prioritize mobile pattern, fallback to general
            const pattern = country.phone.types?.mobile?.pattern || country.phone.generalPattern || "";
            const exampleNumber = country.phone.types?.mobile?.exampleNumber || "";

            // Use the pre-formatted example if available, otherwise construct one
            // The data usually has 'exampleFormat' for the whole number
            const exampleFormat = country.phone.exampleFormat ||
                (country.phone.callingCode ? `${country.phone.callingCode} ${exampleNumber}` : exampleNumber);

            entries.push({
                countryCode: country.codes.iso3166Alpha2,
                name: country.basics.name,
                flagEmoji: country.basics.flagEmoji,
                callingCode: country.phone.callingCode,
                pattern: pattern,
                exampleFormat: exampleFormat,
                exampleNumber: exampleNumber,
                region: country.basics.region
            });
        } catch (e) {
            console.error(`Error processing ${code} for phone data`, e);
        }
    }

    return entries.sort((a, b) => a.name.localeCompare(b.name));
}

export default async function PhoneNumbersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const data = await getPhoneData();

    return (
        <div className="container py-10">
            <PhoneNumbersClient data={data} />
        </div>
    );
}
