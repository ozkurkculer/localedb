import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCountry, getAllCountryCodes } from "@/lib/countries";
import { CopyButton } from "@/components/copy-button";

interface CountryPageProps {
  params: Promise<{
    code: string;
  }>;
}

// Generate static params for all countries
export async function generateStaticParams() {
  const codes = await getAllCountryCodes();

  return codes.map((code) => ({
    code: code,
  }));
}

// Prevent dynamic rendering for unlisted codes
export const dynamicParams = false;

// Generate metadata for each country page
export async function generateMetadata({
  params,
}: CountryPageProps): Promise<Metadata> {
  const { code } = await params;

  try {
    const country = await getCountry(code);

    return {
      title: `${country.basics.name} - Locale Data`,
      description: `Localization data for ${country.basics.name}: currency (${country.currency.code}), date formats, number formats, phone codes, and more.`,
      openGraph: {
        title: `${country.basics.flagEmoji} ${country.basics.name} Locale Data`,
        description: `Complete localization reference for ${country.basics.name}`,
      },
    };
  } catch {
    return {
      title: "Country Not Found",
    };
  }
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { code } = await params;

  let country;
  try {
    country = await getCountry(code);
  } catch {
    notFound();
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 text-8xl">{country.basics.flagEmoji}</div>
        <h1 className="mb-2 text-4xl font-bold">{country.basics.name}</h1>
        <p className="text-xl text-muted-foreground">
          {country.basics.officialName}
        </p>
        <p className="mt-2 text-lg text-muted-foreground">
          {country.basics.nativeName} · {country.basics.continent}
        </p>
      </div>

      {/* Quick Info */}
      <div className="mx-auto mb-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Capital" value={country.basics.capital} />
        <InfoCard
          label="Population"
          value={country.basics.population.toLocaleString()}
        />
        <InfoCard
          label="Currency"
          value={`${country.currency.symbol} ${country.currency.code}`}
        />
        <InfoCard label="Calling Code" value={country.phone.callingCode} />
      </div>

      {/* Languages & Geography */}
      <div className="mx-auto mb-8 grid max-w-6xl gap-8 md:grid-cols-2">
         {/* Languages */}
         <Section title="Languages">
            <div className="grid gap-3">
              {country.basics.languages.map((lang) => (
                <div key={lang.code} className="flex items-center justify-between rounded-md border border-border/40 bg-background/50 p-3">
                   <div>
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
                   </div>
                   <div className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                      {lang.code}
                   </div>
                </div>
              ))}
            </div>
         </Section>

         {/* Geography */}
         <Section title="Geography">
            <div className="grid gap-4 sm:grid-cols-2">
               <DataItem label="Region" value={country.basics.region} />
               <DataItem label="Subregion" value={country.basics.subregion} />
               <DataItem label="Continent" value={country.basics.continent} />
               <DataItem label="Area" value={`${country.basics.area.toLocaleString()} km²`} />
               <DataItem label="Landlocked" value={country.basics.landlocked ? "Yes" : "No"} />
               <DataItem label="TLD" value={country.basics.tld.join(", ")} />
               {country.basics.borders.length > 0 && (
                   <div className="col-span-2">
                      <p className="mb-1 text-sm font-medium text-muted-foreground">Borders</p>
                      <div className="flex flex-wrap gap-2">
                        {country.basics.borders.map(border => (
                           <span key={border} className="rounded-md bg-muted px-2 py-1 text-xs">{border}</span>
                        ))}
                      </div>
                   </div>
               )}
            </div>
         </Section>
      </div>

      {/* Data Sections */}
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Codes */}
        <Section title="Country Codes">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DataItem label="ISO 3166-1 Alpha-2" value={country.codes.iso3166Alpha2} />
            <DataItem label="ISO 3166-1 Alpha-3" value={country.codes.iso3166Alpha3} />
            <DataItem label="ISO 3166-1 Numeric" value={country.codes.iso3166Numeric} />
            <DataItem label="BCP 47" value={country.codes.bcp47.join(", ")} />
            <DataItem label="IOC" value={country.codes.ioc} />
            <DataItem label="FIFA" value={country.codes.fifa} />
          </div>
        </Section>

        {/* Currency */}
        <Section title="Currency Format">
          <div className="grid gap-4 sm:grid-cols-2">
            <DataItem label="Name" value={country.currency.name} />
            <DataItem label="Native Name" value={country.currency.nativeName} />
            <DataItem label="Code" value={country.currency.code} />
            <DataItem label="Symbol" value={country.currency.symbol} />
            <DataItem
              label="Symbol Position"
              value={country.currency.symbolPosition}
            />
            <DataItem
              label="Decimal Separator"
              value={country.currency.decimalSeparator}
            />
            <DataItem
              label="Thousands Separator"
              value={country.currency.thousandsSeparator}
            />
            <DataItem
              label="Decimal Digits"
              value={country.currency.decimalDigits.toString()}
            />
          </div>
          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Example:</p>
            <p className="mt-1 font-mono text-2xl font-bold">
              {country.currency.example}
            </p>
          </div>
        </Section>

        {/* Date & Time */}
        <Section title="Date & Time Formats">
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold">Date Formats</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                <DataItem label="Full" value={country.dateTime.dateFormats.full} />
                <DataItem label="Long" value={country.dateTime.dateFormats.long} />
                <DataItem label="Medium" value={country.dateTime.dateFormats.medium} />
                <DataItem label="Short" value={country.dateTime.dateFormats.short} />
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Time Formats</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                <DataItem label="Full" value={country.dateTime.timeFormats.full} />
                <DataItem label="Long" value={country.dateTime.timeFormats.long} />
                <DataItem label="Medium" value={country.dateTime.timeFormats.medium} />
                <DataItem label="Short" value={country.dateTime.timeFormats.short} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DataItem
                label="First Day of Week"
                value={
                  country.dateTime.firstDayOfWeek === 1 ? "Monday" : "Sunday"
                }
              />
              <DataItem
                label="Clock Format"
                value={country.dateTime.clockFormat}
              />
              <DataItem
                label="Primary Timezone"
                value={country.dateTime.primaryTimezone}
              />
              <DataItem label="UTC Offset" value={country.dateTime.utcOffset} />
              <div className="col-span-2">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Timezones</p>
                  <div className="flex flex-wrap gap-1">
                      {country.dateTime.timezones.map(tz => (
                          <span key={tz} className="rounded-md border bg-muted/50 px-2 py-1 text-xs font-mono">{tz}</span>
                      ))}
                  </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Number Format */}
        <Section title="Number Formatting">
          <div className="grid gap-4 sm:grid-cols-2">
            <DataItem
              label="Decimal Separator"
              value={country.numberFormat.decimalSeparator}
            />
            <DataItem
              label="Thousands Separator"
              value={country.numberFormat.thousandsSeparator}
            />
            <DataItem
              label="Digit Grouping"
              value={country.numberFormat.digitGrouping}
            />
            <DataItem
              label="Numbering System"
              value={country.numberFormat.numberingSystem}
            />
          </div>
          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Example:</p>
            <p className="mt-1 font-mono text-2xl font-bold">
              {country.numberFormat.example}
            </p>
          </div>
        </Section>

        {/* Locale Info */}
        <Section title="Locale Settings">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DataItem
              label="Writing Direction"
              value={country.locale.writingDirection.toUpperCase()}
            />
            <DataItem
              label="Measurement System"
              value={country.locale.measurementSystem}
            />
            <DataItem
              label="Temperature Scale"
              value={country.locale.temperatureScale}
            />
            <DataItem label="Paper Size" value={country.locale.paperSize} />
            <DataItem
              label="Driving Side"
              value={country.locale.drivingSide}
            />
            <DataItem
              label="Week Numbering"
              value={country.locale.weekNumbering}
            />
          </div>
        </Section>

        {/* JSON Export */}
        <Section title="Raw JSON Data">
          <div className="relative">
            <div className="absolute right-2 top-2 z-10">
              <CopyButton
                value={JSON.stringify(country, null, 2)}
                label="JSON data"
                className="h-8 w-8 bg-background/80 backdrop-blur"
              />
            </div>
            <div className="rounded-lg bg-muted p-4">
              <pre className="overflow-x-auto text-sm">
                <code>{JSON.stringify(country, null, 2)}</code>
              </pre>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-6">
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="group relative">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-mono text-sm">{value}</p>
        <CopyButton
          value={value}
          label={label}
          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </div>
  );
}
