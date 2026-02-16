import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLanguageIndex } from "@/lib/languages";
import { LanguagesGridClient } from "@/components/languages/languages-grid-client";

export const metadata: Metadata = {
  title: "Languages",
  description: "Browse localization data for world languages.",
};

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
