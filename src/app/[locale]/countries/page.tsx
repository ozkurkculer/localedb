import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCountryIndex } from "@/lib/countries";
import { CountriesGridClient } from "@/components/countries/countries-grid-client";

export async function generateMetadata() {
  const t = await getTranslations("countries.meta");

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/countries",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "/countries",
      siteName: "LocaleDB",
      images: [
        {
          url: "/og_image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og_image.png"],
    },
  };
}

export default async function CountriesPage() {
  const countries = await getCountryIndex();
  const t = await getTranslations();

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">{t("countries.title")}</h1>
        <p className="text-base text-muted-foreground sm:text-lg md:text-xl">
          {t("countries.subtitle", { count: countries.length })}
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        {countries.length > 0 ? (
          <CountriesGridClient countries={countries} />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            {t("countries.noData")}
          </div>
        )}
      </div>
    </div>
  );
}
