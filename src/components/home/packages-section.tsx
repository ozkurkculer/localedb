import NextLink from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/docs/code-block';
import { siteConfig } from '@/config/site';

const EXAMPLE = `import { getCountry } from "@localedb/core";

const tr = getCountry("TR");
tr?.currency.symbol;               // "₺"
tr?.numberFormat.decimalSeparator; // ","
tr?.dateTime.dateFormats.short;    // "d.MM.y"

// or from the command line
// npx @localedb/cli get country TR`;

/** Home page pointer to the npm packages; the details live in /docs#packages. */
export async function PackagesSection() {
    const t = await getTranslations();

    return (
        <section className="mx-auto max-w-5xl pb-24 md:pb-32">
            <div className="grid items-center gap-8 rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8 md:grid-cols-2 md:p-12">
                <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 font-mono text-xs text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        @localedb/core · @localedb/cli
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('docs.packages.title')}</h2>
                    <p className="mt-4 text-muted-foreground">{t('docs.packages.description')}</p>

                    <code className="mt-6 block w-fit rounded-md border border-border/60 bg-muted/50 px-4 py-2 font-mono text-sm text-foreground">
                        npm install @localedb/core
                    </code>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button asChild>
                            <Link href="/docs#packages">
                                {t('footer.sections.resources.documentation')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <NextLink href={siteConfig.links.npm} target="_blank" rel="noopener noreferrer">
                                <Package className="mr-2 h-4 w-4" />
                                npm
                            </NextLink>
                        </Button>
                    </div>
                </div>

                {/* Code samples read left to right in every locale. */}
                <div dir="ltr" className="min-w-0">
                    <CodeBlock title="example.ts" code={EXAMPLE} />
                </div>
            </div>
        </section>
    );
}
