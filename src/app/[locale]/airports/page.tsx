import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAirportIndex } from "@/lib/airports";
import { getCountryIndex } from "@/lib/countries";
import { AirportsTableClient } from "@/components/airports/airports-table-client";

export const metadata: Metadata = {
  title: "World Airports - LocaleDB",
  description: "Searchable database of global airports with IATA/ICAO codes.",
};

export default async function AirportsPage() {
  const airports = await getAirportIndex();
  const countries = await getCountryIndex();
  const t = await getTranslations();

  // Create a map for quick country lookups
  const countryMap: Record<string, { name: string; emoji: string }> = {};
  countries.forEach(c => {
      countryMap[c.code] = { name: c.name, emoji: c.flagEmoji };
  });

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold bg-gradient-to-br from-red-500 to-rose-600 bg-clip-text text-transparent sm:text-3xl md:text-4xl">{t("airports.title")}</h1>
        <p className="text-base text-muted-foreground sm:text-lg md:text-xl">
          {t("airports.subtitle", { count: airports.length })}
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12">{t("common.loading")}</div>}>
        <AirportsTableClient airports={airports} countryMap={countryMap} />
      </Suspense>
    </div>
  );
}
