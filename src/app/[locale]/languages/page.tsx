import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLanguageIndex } from "@/lib/languages";
import { LanguagesGridClient } from "@/components/languages/languages-grid-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'languages.meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "/languages",
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: "/languages",
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

export default async function LanguagesPage() {
  const languages = await getLanguageIndex();
  const t = await getTranslations();

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">{t("languages.title")}</h1>
        <p className="text-base text-muted-foreground sm:text-lg md:text-xl">
          {t("languages.subtitle", { count: languages.length })}
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        {languages.length > 0 ? (
          <LanguagesGridClient languages={languages} />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            {t("languages.noData")}
          </div>
        )}
      </div>
    </div>
  );
}
