import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { siteConfig } from '@/config/site';

type LegalNamespace = 'legal.privacy' | 'legal.terms';

const linkClass = 'font-medium text-foreground underline underline-offset-4 hover:text-primary';

/** Tags available inside legal copy, e.g. "<github>Open an issue</github>". */
const richLinks = {
    github: (chunks: ReactNode) => (
        <a href={`${siteConfig.links.github}/issues`} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {chunks}
        </a>
    ),
    license: (chunks: ReactNode) => (
        <a href={`${siteConfig.links.github}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {chunks}
        </a>
    ),
    vercel: (chunks: ReactNode) => (
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className={linkClass}>
            {chunks}
        </a>
    ),
    docs: (chunks: ReactNode) => (
        <Link href="/docs" className={linkClass}>
            {chunks}
        </Link>
    ),
    contributing: (chunks: ReactNode) => (
        <Link href="/contributing" className={linkClass}>
            {chunks}
        </Link>
    ),
    code: (chunks: ReactNode) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{chunks}</code>,
};

export async function LegalDocument({ namespace, sections }: { namespace: LegalNamespace; sections: string[] }) {
    const t = await getTranslations(namespace);

    return (
        <article className="container max-w-3xl py-12 md:py-24">
            <header className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
                <p className="mt-4 text-sm text-muted-foreground">{t('updated')}</p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">{t.rich('intro', richLinks)}</p>
            </header>

            <div className="space-y-10">
                {sections.map((section) => (
                    <section key={section}>
                        <h2 className="mb-3 text-xl font-semibold">{t(`sections.${section}.title`)}</h2>
                        <p className="leading-7 text-muted-foreground">{t.rich(`sections.${section}.body`, richLinks)}</p>
                    </section>
                ))}
            </div>
        </article>
    );
}
