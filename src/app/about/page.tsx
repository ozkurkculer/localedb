import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about LocaleDB and our mission to simplify localization for developers worldwide.",
};

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl md:text-4xl">About LocaleDB</h1>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-xl text-muted-foreground">
            {siteConfig.description}
          </p>

          <h2 className="mt-12">The Problem</h2>
          <p>
            Modern web development requires products to work globally. But
            localization (L10n) is much more than just translating text.
            Developers struggle with:
          </p>
          <ul>
            <li>Currency symbol placement (before or after the amount?)</li>
            <li>Date format differences (DD/MM/YYYY vs MM/DD/YYYY)</li>
            <li>Number separators (1,250.00 vs 1.250,00)</li>
            <li>Phone number formats</li>
            <li>Address formatting conventions</li>
            <li>Time zones and calendar systems</li>
          </ul>
          <p>
            This data is scattered across complex documentation, buried in CLDR
            files, or requires installing heavy libraries just to check a simple
            format.
          </p>

          <h2>Our Solution</h2>
          <p>
            LocaleDB is a developer-first, community-driven encyclopedia that
            provides:
          </p>
          <ul>
            <li>
              <strong>Structured JSON data</strong> for every country's
              localization standards
            </li>
            <li>
              <strong>Ready-to-use formats</strong> you can copy directly into
              your code
            </li>
            <li>
              <strong>CLDR-based accuracy</strong> using Unicode's Common Locale
              Data Repository
            </li>
            <li>
              <strong>Open source</strong> so anyone can contribute corrections
            </li>
            <li>
              <strong>Fast, static generation</strong> with no server required
            </li>
          </ul>

          <h2>Data Sources</h2>
          <p>LocaleDB aggregates data from trusted sources:</p>
          <ul>
            <li>
              <strong>CLDR (Common Locale Data Repository)</strong> - Unicode's
              standard for locale data
            </li>
            <li>
              <strong>mledoze/countries</strong> - Comprehensive country
              information
            </li>
            <li>
              <strong>Google libaddressinput</strong> - Address format standards
            </li>
            <li>
              <strong>Community contributions</strong> - Local experts verifying
              accuracy
            </li>
          </ul>

          <h2>Open Source</h2>
          <p>
            LocaleDB is MIT licensed and welcomes contributions. Whether you're
            fixing a typo, adding a missing country, or improving the UI, we'd
            love your help.
          </p>

          <div className="not-prose mt-8 flex gap-4">
            <Button asChild>
              <Link href={siteConfig.links.github} target="_blank">
                View on GitHub
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contributing">Contributing Guide</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
