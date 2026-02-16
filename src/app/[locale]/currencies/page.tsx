import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCurrencyIndex } from "@/lib/currencies";
import { CurrenciesGridClient } from "@/components/currencies/currencies-grid-client";

export const metadata: Metadata = {
  title: "Currencies",
  description: "Browse localization data for world currencies.",
};

export default async function CurrenciesPage() {
  const currencies = await getCurrencyIndex();
  const t = await getTranslations();

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">{t("currencies.title")}</h1>
        <p className="text-base text-muted-foreground sm:text-lg md:text-xl">
          {t("currencies.subtitle", { count: currencies.length })}
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        {currencies.length > 0 ? (
          <CurrenciesGridClient currencies={currencies} />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            {t("currencies.noData")}
          </div>
        )}
      </div>
    </div>
  );
}
