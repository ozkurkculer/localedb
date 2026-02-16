import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getLanguage, getAllLanguageCodes } from "@/lib/languages";
import { getCountryIndex } from "@/lib/countries";
import { CopyButton } from "@/components/copy-button";

interface LanguagePageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateStaticParams() {
  const codes = await getAllLanguageCodes();
  return codes.map((code) => ({
    code: code,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: LanguagePageProps): Promise<Metadata> {
  const { code } = await params;

  try {
    const language = await getLanguage(code);

    if (!language) {
      return {
        title: "Language Not Found",
      };
    }

    return {
      title: `${language.data.name} - Locale Data`,
      description: `Localization data for ${language.data.name} language. Spoken in ${language.data.countries.length} countries.`,
    };
  } catch {
    return {
      title: "Language Not Found",
    };
  }
}

export default async function LanguagePage({ params }: LanguagePageProps) {
  const { code } = await params;

  let language;
  try {
    language = await getLanguage(code);
  } catch {
    notFound();
  }

  // If language is null after try-catch, redirect to 404
  if (!language) {
    notFound();
  }

  // Fetch country index to enrich country list
  const countryIndex = await getCountryIndex();
  const spokenIn = countryIndex.filter(c => language.data.countries.includes(c.code));

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-emerald-400 to-green-600 bg-clip-text text-transparent">{language.data.name}</h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">{language.data.nativeName}</p>
        <div className="mt-4 flex justify-center gap-2">
            <span className="rounded-md bg-muted px-3 py-1 font-mono text-sm">{language.data.code}</span>
            {language.data.iso639_2 && <span className="rounded-md bg-muted px-3 py-1 font-mono text-sm">{language.data.iso639_2}</span>}
            {language.data.iso639_3 && <span className="rounded-md bg-muted px-3 py-1 font-mono text-sm">{language.data.iso639_3}</span>}
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
          {/* Countries List */}
          <section className="rounded-lg border border-border/40 bg-card p-6">
              <h2 className="mb-6 text-xl sm:text-2xl font-bold">Spoken In ({spokenIn.length} Countries)</h2>
              {spokenIn.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {spokenIn.map(country => (
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
                <CopyButton value={JSON.stringify(language, null, 2)} label="JSON" />
            </div>
            <div className="rounded-lg bg-muted p-4">
              <pre className="overflow-x-auto text-sm">
                <code>{JSON.stringify(language, null, 2)}</code>
              </pre>
            </div>
          </section>
      </div>
    </div>
  );
}
