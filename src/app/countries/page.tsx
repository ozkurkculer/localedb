import Link from "next/link";
import type { Metadata } from "next";
import { getCountryIndex } from "@/lib/countries";

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {countries.map((country) => (
            <CountryCard key={country.code} country={country} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CountryCardProps {
  country: {
    code: string;
    name: string;
    flagEmoji: string;
    continent: string;
    region: string;
    primaryLocale: string;
    currencyCode: string;
    callingCode: string;
  };
}

function CountryCard({ country }: CountryCardProps) {
  return (
    <Link
      href={`/countries/${country.code}`}
      className="group relative overflow-hidden rounded-lg border border-border/40 bg-card p-6 transition-all hover:border-border hover:shadow-md"
    >
      <div className="mb-4 text-5xl">{country.flagEmoji}</div>
      <h3 className="mb-2 text-xl font-semibold group-hover:text-primary">
        {country.name}
      </h3>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>{country.region}</p>
        <p className="font-mono">{country.code}</p>
        <p>
          {country.currencyCode} · {country.callingCode}
        </p>
      </div>
    </Link>
  );
}
