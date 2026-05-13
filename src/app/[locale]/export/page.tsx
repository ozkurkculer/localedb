import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCountryIndex } from "@/lib/countries";
import { getCurrencyIndex } from "@/lib/currencies";
import { getLanguageIndex } from "@/lib/languages";
import { getAirportIndex } from "@/lib/airports";
import { ExportBuilderClient } from "@/components/export/export-builder-client";
import type { EntityOption } from "@/components/export/entity-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "export.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/export" },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "/export",
      siteName: "LocaleDB",
      images: [
        {
          url: "/og_image.png",
          width: 1200,
          height: 630,
          alt: t("ogAlt"),
        },
      ],
      locale,
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

export default async function ExportPage() {
  const [countriesIndex, currenciesIndex, languagesIndex, airports] =
    await Promise.all([
      getCountryIndex(),
      getCurrencyIndex(),
      getLanguageIndex(),
      getAirportIndex(),
    ]);

  const countries: EntityOption[] = countriesIndex
    .map((c) => ({
      id: c.code,
      label: `${c.flagEmoji} ${c.name}`,
      sublabel: c.code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const currencies: EntityOption[] = currenciesIndex
    .map((c) => ({
      id: c.code,
      label: c.name,
      sublabel: c.code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const languages: EntityOption[] = languagesIndex
    .map((l) => ({
      id: l.code,
      label: `${l.name} (${l.nativeName})`,
      sublabel: l.code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const airportOptions: EntityOption[] = airports
    .filter((a) => !!a.iata)
    .slice(0, 2000)
    .map((a) => ({
      id: a.iata,
      label: a.name,
      sublabel: a.iata,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <ExportBuilderClient
      countries={countries}
      currencies={currencies}
      languages={languages}
      airports={airportOptions}
    />
  );
}
