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
        <h1 className="mb-4 text-4xl font-bold">Browse Countries</h1>
        <p className="text-xl text-muted-foreground">
          Explore localization data for {countries.length} countries
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        <CountriesGridClient countries={countries} />
      </div>
    </div>
  );
}
