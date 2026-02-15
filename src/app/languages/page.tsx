import type { Metadata } from "next";
import { getLanguageIndex } from "@/lib/languages";
import { LanguagesGridClient } from "@/components/languages/languages-grid-client";

export const metadata: Metadata = {
  title: "Languages",
  description: "Browse localization data for world languages.",
};

export default async function LanguagesPage() {
  const languages = await getLanguageIndex();

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Browse Languages</h1>
        <p className="text-xl text-muted-foreground">
          Explore localization data for {languages.length} languages
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        <LanguagesGridClient languages={languages} />
      </div>
    </div>
  );
}
