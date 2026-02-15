import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contributing",
  description: "Learn how to contribute to LocaleDB and help improve localization data for developers worldwide.",
};

export default function ContributingPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl md:text-4xl">Contributing to LocaleDB</h1>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-xl text-muted-foreground">
            LocaleDB is an open-source project and we love contributions from
            developers worldwide!
          </p>

          <h2>Ways to Contribute</h2>

          <h3>1. Fix or Update Country Data</h3>
          <p>If you notice incorrect locale data for a country:</p>
          <ol>
            <li>
              Fork the{" "}
              <Link href={siteConfig.links.github} target="_blank">
                GitHub repository
              </Link>
            </li>
            <li>
              Edit the country JSON file in <code>/data/countries/</code>
            </li>
            <li>Verify your changes against official sources (CLDR, local standards)</li>
            <li>Submit a Pull Request with a clear description</li>
          </ol>

          <h3>2. Add a New Country</h3>
          <p>To add a country not yet in LocaleDB:</p>
          <ol>
            <li>Use an existing country JSON as a template</li>
            <li>
              Create <code>/data/countries/XX.json</code> (XX = ISO alpha-2
              code)
            </li>
            <li>Fill in all required fields using CLDR data</li>
            <li>
              Update <code>/data/_index.json</code> with the new country
            </li>
            <li>Submit a Pull Request</li>
          </ol>

          <h3>3. Improve the Website</h3>
          <p>Help us make LocaleDB better by:</p>
          <ul>
            <li>Improving UI/UX</li>
            <li>Adding search functionality</li>
            <li>Creating comparison tools</li>
            <li>Writing better documentation</li>
            <li>Fixing bugs</li>
          </ul>

          <h2>Data Schema</h2>
          <p>
            Each country JSON file follows a strict TypeScript schema defined in{" "}
            <code>/src/types/country.ts</code>. Key sections:
          </p>
          <ul>
            <li>
              <code>basics</code> - Country name, capital, coordinates, flag
            </li>
            <li>
              <code>codes</code> - ISO 3166, BCP47, IOC, FIFA codes
            </li>
            <li>
              <code>currency</code> - Symbol, position, separators, patterns
            </li>
            <li>
              <code>dateTime</code> - Date/time formats, month/day names,
              timezones
            </li>
            <li>
              <code>numberFormat</code> - Decimal/thousands separators, grouping
            </li>
            <li>
              <code>phone</code> - Calling code, format, number lengths
            </li>
            <li>
              <code>addressFormat</code> - Postal code format, address line order
            </li>
            <li>
              <code>locale</code> - Writing direction, measurement system, paper
              size
            </li>
          </ul>

          <h2>Data Sources to Reference</h2>
          <p>When adding or updating data, use these authoritative sources:</p>
          <ul>
            <li>
              <Link href="https://cldr.unicode.org/" target="_blank">
                CLDR (Unicode Common Locale Data Repository)
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/mledoze/countries"
                target="_blank"
              >
                mledoze/countries GitHub Repository
              </Link>
            </li>
            <li>
              National standards organizations (e.g., TSE for Turkey, ANSI for
              USA)
            </li>
            <li>Official government websites for postal codes and formats</li>
          </ul>

          <h2>Pull Request Guidelines</h2>
          <ul>
            <li>
              <strong>One change per PR</strong> - Don't mix data updates with
              code changes
            </li>
            <li>
              <strong>Clear commit messages</strong> - "Update Turkish currency
              format" not "fix data"
            </li>
            <li>
              <strong>Reference sources</strong> - Link to CLDR or official
              documentation
            </li>
            <li>
              <strong>Test locally</strong> - Run <code>pnpm dev</code> and
              verify changes
            </li>
            <li>
              <strong>Validate JSON</strong> - Ensure proper formatting and
              schema compliance
            </li>
          </ul>

          <h2>Code of Conduct</h2>
          <p>
            We're committed to fostering a welcoming community. Be respectful,
            constructive, and collaborative. Harassment or toxic behavior will
            not be tolerated.
          </p>

          <h2>Questions?</h2>
          <p>
            Open a{" "}
            <Link href={`${siteConfig.links.github}/discussions`} target="_blank">
              GitHub Discussion
            </Link>{" "}
            if you need help or have questions about contributing.
          </p>

          <div className="not-prose mt-8 rounded-lg border border-border/40 bg-muted p-6">
            <p className="font-semibold">Ready to contribute?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Visit our{" "}
              <Link
                href={siteConfig.links.github}
                target="_blank"
                className="underline"
              >
                GitHub repository
              </Link>{" "}
              to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
