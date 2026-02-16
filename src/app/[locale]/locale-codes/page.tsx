import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCountryIndex } from "@/lib/countries";
import { LocaleCodesTableClient } from "@/components/locale-codes/locale-codes-table-client";

export const metadata: Metadata = {
  title: "Locale Codes (BCP-47)",
  description:
    "Complete reference table of BCP-47 locale codes for all countries.",
};

export default async function LocaleCodesPage() {
  const countries = await getCountryIndex();
  const t = await getTranslations();

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">{t("localeCodes.title")}</h1>
        <p className="text-base text-muted-foreground sm:text-lg md:text-xl">
          {t("localeCodes.subtitle", { count: countries.length })}
        </p>
      </div>

      <LocaleCodesTableClient countries={countries} />

      {/* Info Section */}
      <div className="mt-12 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl sm:text-2xl font-bold">{t("localeCodes.about.title")}</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">BCP-47</strong> {t("localeCodes.about.intro")}
            </p>
            <p>
              {t("localeCodes.about.structure", { tag: "" })}
              <code className="mx-1 rounded bg-muted px-2 py-1">
                language-REGION
              </code>
            </p>
            <p>{t("localeCodes.about.examples")}</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>
                <code className="rounded bg-muted px-2 py-1">en-US</code> -
                English (United States)
              </li>
              <li>
                <code className="rounded bg-muted px-2 py-1">tr-TR</code> -
                Turkish (Turkey)
              </li>
              <li>
                <code className="rounded bg-muted px-2 py-1">de-DE</code> -
                German (Germany)
              </li>
              <li>
                <code className="rounded bg-muted px-2 py-1">ja-JP</code> -
                Japanese (Japan)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
