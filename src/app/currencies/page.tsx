import type { Metadata } from "next";
import { getCurrencyIndex } from "@/lib/currencies";
import { CurrenciesGridClient } from "@/components/currencies/currencies-grid-client";

export const metadata: Metadata = {
  title: "Currencies",
  description: "Browse localization data for world currencies.",
};

export default async function CurrenciesPage() {
  const currencies = await getCurrencyIndex();

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">Browse Currencies</h1>
        <p className="text-base text-muted-foreground sm:text-lg md:text-xl">
          Explore formatting rules and symbols for {currencies.length} currencies
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        <CurrenciesGridClient currencies={currencies} />
      </div>
    </div>
  );
}
