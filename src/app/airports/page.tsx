import type { Metadata } from "next";
import { getAirportIndex } from "@/lib/airports";
import { getCountryIndex } from "@/lib/countries";
import { AirportsGridClient } from "@/components/airports/airports-grid-client";

export const metadata: Metadata = {
  title: "World Airports Database - LocaleDB",
  description: "Browse thousands of airports worldwide with IATA/ICAO codes and location data.",
};

export default async function AirportsPage() {
  const airports = await getAirportIndex();
  const countries = await getCountryIndex();
  
  // Create a map for quick country lookups
  const countryMap: Record<string, { name: string; emoji: string }> = {};
  countries.forEach(c => {
      countryMap[c.code] = { name: c.name, emoji: c.flagEmoji };
  });

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold bg-gradient-to-br from-sky-400 to-blue-600 bg-clip-text text-transparent">World Airports</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive database of global airports with IATA and ICAO codes.
        </p>
      </div>

      <AirportsGridClient airports={airports} countryMap={countryMap} />
    </div>
  );
}
