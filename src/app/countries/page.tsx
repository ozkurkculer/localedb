import type { Metadata } from "next";
import { getCountryIndex } from "@/lib/countries";
import { CountriesGridClient } from "@/components/countries/countries-grid-client";

export const metadata: Metadata = {
  title: "Countries",
  description: "Browse localization data for all countries in the world.",
};

export default async function CountriesPage() {
  const countries = await getCountryIndex();

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">Browse Countries</h1>
        <p className="text-base text-muted-foreground sm:text-lg md:text-xl">
          Explore localization data for {countries.length} countries
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        <CountriesGridClient countries={countries} />
      </div>
    </div>
  );
}
