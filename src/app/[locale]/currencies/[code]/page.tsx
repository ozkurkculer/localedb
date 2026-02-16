import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCurrency, getAllCurrencyCodes } from "@/lib/currencies";
import { getCountryIndex } from "@/lib/countries";
import { CopyButton } from "@/components/copy-button";

interface CurrencyPageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateStaticParams() {
  const codes = await getAllCurrencyCodes();
  return codes.map((code) => ({
    code: code,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: CurrencyPageProps): Promise<Metadata> {
  const { code } = await params;

  try {
    const currency = await getCurrency(code);

    if (!currency) {
      return {
        title: "Currency Not Found",
      };
    }

    return {
      title: `${currency.data.name} (${currency.data.code}) - Locale Data`,
      description: `Localization data for ${currency.data.name}: symbol ${currency.data.symbol}, formatting rules, and usage in ${currency.data.countries.length} countries.`,
    };
  } catch {
    return {
      title: "Currency Not Found",
    };
  }
}

export default async function CurrencyPage({ params }: CurrencyPageProps) {
  const { code } = await params;

  let currency;
  try {
    currency = await getCurrency(code);
  } catch {
    notFound();
  }

  // If currency is null after try-catch, redirect to 404
  if (!currency) {
    notFound();
  }

  // Fetch country index to enrich country list
  const countryIndex = await getCountryIndex();
  const usedIn = countryIndex.filter(c => currency.data.countries.includes(c.code));

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 text-6xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">{currency.data.symbol}</div>
        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold">{currency.data.name}</h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">{currency.data.nativeName}</p>
        <div className="mt-4 flex justify-center gap-2">
            <span className="rounded-md bg-muted px-3 py-1 font-mono text-sm">{currency.data.code}</span>
            <span className="rounded-md bg-muted px-3 py-1 font-mono text-sm">Numeric: {currency.data.numericCode}</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
          
          {/* Formatting Rules */}
          <section className="rounded-lg border border-border/40 bg-card p-6">
              <h2 className="mb-6 text-xl sm:text-2xl font-bold">Formatting Rules</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DataItem label="Decimal Separator" value={currency.data.decimalSeparator} />
                  <DataItem label="Thousands Separator" value={currency.data.thousandsSeparator} />
                  <DataItem label="Symbol Position" value={currency.data.symbolPosition} />
                  <DataItem label="Decimal Digits" value={currency.data.decimalDigits.toString()} />
                  <DataItem label="Subunit" value={`${currency.data.subunitValue} ${currency.data.subunitName}`} />
                  <DataItem label="Pattern" value={currency.data.pattern} />
              </div>
              
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Standard Example</p>
                      <p className="mt-1 font-mono text-xl font-bold">{currency.data.example}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Accounting Example</p>
                      <p className="mt-1 font-mono text-xl font-bold">{currency.data.accountingExample}</p>
                  </div>
              </div>
          </section>

          {/* Countries List */}
          <section className="rounded-lg border border-border/40 bg-card p-6">
              <h2 className="mb-6 text-xl sm:text-2xl font-bold">Used In ({usedIn.length} Countries)</h2>
              {usedIn.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {usedIn.map(country => (
                        <Link key={country.code} href={`/countries/${country.code}`} className="group flex items-center gap-3 rounded-md border border-border/40 bg-background/50 p-3 transition-colors hover:border-primary/50 hover:bg-muted/50">
                            <span className="text-2xl">{country.flagEmoji}</span>
                            <div>
                                <div className="font-medium group-hover:text-primary">{country.name}</div>
                                <div className="text-xs text-muted-foreground">{country.code}</div>
                            </div>
                        </Link>
                    ))}
                </div>
              ) : (
                  <p className="text-muted-foreground">No official countries listed.</p>
              )}
          </section>

          {/* Raw JSON */}
          <section className="rounded-lg border border-border/40 bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold">Raw JSON Data</h2>
                <CopyButton value={JSON.stringify(currency, null, 2)} label="JSON" />
            </div>
            <div className="rounded-lg bg-muted p-4">
              <pre className="overflow-x-auto text-sm">
                <code>{JSON.stringify(currency, null, 2)}</code>
              </pre>
            </div>
          </section>
      </div>
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
    return (
      <div className="group relative">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="font-mono text-sm">{value}</p>
          <CopyButton
            value={value}
            label={label}
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    );
  }
