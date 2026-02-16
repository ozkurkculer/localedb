import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCountryIndex } from "@/lib/countries";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyButton } from "@/components/copy-button";

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

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableCaption>
            {t("localeCodes.table.caption")}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-background w-16">{t("localeCodes.table.flag")}</TableHead>
              <TableHead className="sticky left-16 z-10 bg-background min-w-[150px]">{t("localeCodes.table.country")}</TableHead>
              <TableHead className="min-w-[100px]">{t("localeCodes.table.alpha2")}</TableHead>
              <TableHead className="min-w-[120px]">{t("localeCodes.table.bcp47")}</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[100px]">{t("localeCodes.table.currency")}</TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px]">{t("localeCodes.table.callingCode")}</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[150px]">{t("localeCodes.table.region")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries.map((country) => (
              <TableRow key={country.code}>
                <TableCell className="sticky left-0 z-10 bg-background text-2xl">
                  {country.flagEmoji}
                </TableCell>
                <TableCell className="sticky left-16 z-10 bg-background font-medium">{country.name}</TableCell>
                <TableCell>
                  <div className="group flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      {country.code}
                    </code>
                    <CopyButton
                      value={country.code}
                      label={`${country.name} code`}
                      className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="group flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      {country.primaryLocale}
                    </code>
                    <CopyButton
                      value={country.primaryLocale}
                      label={`${country.name} locale`}
                      className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="group flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-sm">
                      {country.currencyCode}
                    </code>
                    <CopyButton
                      value={country.currencyCode}
                      label={`${country.currencyCode} currency`}
                      className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <code className="text-sm text-muted-foreground">
                    {country.callingCode}
                  </code>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {country.region}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Hint */}
      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground sm:hidden">
        💡 Swipe left to see more columns
      </div>

      {/* Info Section */}
      <div className="mt-12 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl sm:text-2xl font-bold">About BCP-47</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">BCP-47</strong> (Best Current
              Practice 47) is the standard for language tags used to identify
              languages, regions, and locales on the internet.
            </p>
            <p>
              A BCP-47 tag typically consists of:
              <code className="mx-1 rounded bg-muted px-2 py-1">
                language-REGION
              </code>
              where language is an ISO 639 code and REGION is an ISO 3166-1
              alpha-2 code.
            </p>
            <p>
              Examples:
            </p>
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
