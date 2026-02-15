import type { Metadata } from "next";
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

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Locale Codes Reference</h1>
        <p className="text-xl text-muted-foreground">
          BCP-47 locale tags, ISO codes, and currency codes for all {countries.length} countries
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableCaption>
            ISO 3166-1 and BCP-47 locale codes for all countries
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Flag</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Alpha-2</TableHead>
              <TableHead>BCP-47</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Calling Code</TableHead>
              <TableHead>Region</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries.map((country) => (
              <TableRow key={country.code}>
                <TableCell className="text-2xl">
                  {country.flagEmoji}
                </TableCell>
                <TableCell className="font-medium">{country.name}</TableCell>
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
                <TableCell>
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
                <TableCell>
                  <code className="text-sm text-muted-foreground">
                    {country.callingCode}
                  </code>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {country.region}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Info Section */}
      <div className="mt-12 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-2xl font-bold">About BCP-47</h2>
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
