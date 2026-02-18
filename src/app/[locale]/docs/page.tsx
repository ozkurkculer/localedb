import { getTranslations } from 'next-intl/server';
import { Globe2, Database, FileCode2, FolderTree, Terminal, GitPullRequest, Languages as LanguagesIcon, CheckCircle2, ArrowDown } from 'lucide-react';
import { TableOfContents } from '@/components/docs/table-of-contents';
import { CodeBlock } from '@/components/docs/code-block';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'docs.meta' });

    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: "/docs",
        },
        openGraph: {
            title: t('ogTitle'),
            description: t('ogDescription'),
            url: "/docs",
            siteName: "LocaleDB",
            images: [
                {
                    url: "/og_image.png",
                    width: 1200,
                    height: 630,
                    alt: t('ogAlt'),
                },
            ],
            locale: locale,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: t('title'),
            description: t('description'),
            images: ["/og_image.png"],
        },
    };
}

export default async function DocsPage() {
    const t = await getTranslations('docs');

    return (
        <div className="container py-12 md:py-24">
            {/* Hero */}
            <div className="mx-auto max-w-5xl text-center mb-16 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/50 px-4 py-1.5 text-sm mb-6">
                    <FileCode2 className="h-4 w-4" />
                    <span className="font-medium">{t('badge')}</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
                    <span className="bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent">
                        {t('title')}
                    </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    {t('subtitle')}
                </p>
            </div>

            {/* Content with TOC */}
            <div className="mx-auto max-w-7xl">
                <div className="flex gap-12">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Overview */}
                        <section id="overview" className="mb-24 scroll-mt-24 animate-fade-in-up-delay-1">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Globe2 className="h-6 w-6 text-blue-500" />
                                </div>
                                {t('overview.title')}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t('overview.description')}
                            </p>

                            {/* Stats Grid */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                                {[
                                    { label: t('overview.stats.countries'), icon: Globe2, color: 'blue' },
                                    { label: t('overview.stats.languages'), icon: LanguagesIcon, color: 'green' },
                                    { label: t('overview.stats.currencies'), icon: Database, color: 'amber' },
                                    { label: t('overview.stats.airports'), icon: Database, color: 'red' }
                                ].map((stat, i) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={i} className="rounded-lg border border-border bg-card p-4">
                                            <Icon className={`h-5 w-5 text-${stat.color}-500 mb-2`} />
                                            <p className="font-semibold">{stat.label}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Key Features */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="text-xl font-bold mb-4">{t('overview.features.title')}</h3>
                                <ul className="space-y-3">
                                    {Object.values(t.raw('overview.features.items')).map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{item as string}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Getting Started */}
                        <section id="getting-started" className="mb-24 scroll-mt-24 border-t pt-16">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2">
                                    <Terminal className="h-6 w-6 text-emerald-500" />
                                </div>
                                {t('gettingStarted.title')}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t('gettingStarted.description')}
                            </p>

                            <CodeBlock
                                code={`# ${t('gettingStarted.steps.clone')}
git clone https://github.com/ozkurkculer/localedb.git
cd localedb

# ${t('gettingStarted.steps.install')}
pnpm install

# ${t('gettingStarted.steps.updateData')}
pnpm update:data

# ${t('gettingStarted.steps.buildData')}
pnpm build:data

# ${t('gettingStarted.steps.dev')}
pnpm dev`}
                                language="bash"
                            />
                        </section>

                        {/* Data Pipeline */}
                        <section id="data-pipeline" className="mb-24 scroll-mt-24 border-t pt-16">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-purple-500/10 p-2">
                                    <ArrowDown className="h-6 w-6 text-purple-500" />
                                </div>
                                {t('dataPipeline.title')}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t('dataPipeline.description')}
                            </p>

                            {/* Pipeline Steps */}
                            <div className="relative space-y-6 before:absolute before:left-[19px] before:top-8 before:h-[calc(100%-4rem)] before:w-0.5 before:bg-border">
                                {Object.entries(t.raw('dataPipeline.steps')).map(([key, step]: [string, any], i) => (
                                    <div key={key} className="relative flex gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background">
                                            <span className="text-sm font-bold">{i + 1}</span>
                                        </div>
                                        <div className="flex-1 rounded-lg border border-border bg-card p-4">
                                            <h3 className="font-bold mb-1">{step.title}</h3>
                                            <p className="text-sm text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Priority Rules */}
                            <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
                                <h3 className="text-xl font-bold mb-4">{t('dataPipeline.priority.title')}</h3>
                                <p className="text-muted-foreground mb-4">{t('dataPipeline.priority.description')}</p>
                                <ul className="space-y-2">
                                    {Object.values(t.raw('dataPipeline.priority.rules')).map((rule, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span className="text-amber-500">•</span>
                                            <span>{rule as string}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Data Schemas */}
                        <section id="data-schemas" className="mb-24 scroll-mt-24 border-t pt-16">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-500/10 p-2">
                                    <FileCode2 className="h-6 w-6 text-indigo-500" />
                                </div>
                                {t('dataSchemas.title')}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t('dataSchemas.description')}
                            </p>

                            {/* Schema Cards */}
                            <div className="space-y-6">
                                {['country', 'language', 'currency'].map((schema) => {
                                    const schemaData = t.raw(`dataSchemas.${schema}`) as any;
                                    return (
                                        <div key={schema} className="rounded-xl border border-border bg-card p-6">
                                            <h3 className="text-xl font-bold mb-2">{schemaData.title}</h3>
                                            <code className="text-sm text-muted-foreground">{schemaData.path}</code>
                                            <div className="mt-4 space-y-2">
                                                {Object.entries(schemaData.fields).map(([key, value]) => (
                                                    <div key={key} className="rounded-lg bg-muted/50 p-3">
                                                        <code className="text-sm font-bold text-primary">{key}</code>
                                                        <p className="text-sm text-muted-foreground mt-1">{value as string}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Project Structure */}
                        <section id="project-structure" className="mb-24 scroll-mt-24 border-t pt-16">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-cyan-500/10 p-2">
                                    <FolderTree className="h-6 w-6 text-cyan-500" />
                                </div>
                                {t('projectStructure.title')}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t('projectStructure.description')}
                            </p>

                            <CodeBlock
                                code={`localedb/
├── data/                    # ${t('projectStructure.tree.data')}
│   ├── countries/           # 250 country JSON files
│   ├── languages/           # 114 language JSON files
│   ├── currencies/          # 161 currency JSON files
│   ├── _index_*.json        # Lightweight indices
│   └── _meta.json           # Build metadata
├── scripts/                 # ${t('projectStructure.tree.scripts')}
│   ├── update-data.ts       # Download raw data
│   ├── build-data.ts        # Process & generate JSON
│   └── generate-changelog.ts
├── src/
│   ├── app/[locale]/        # Next.js pages (i18n)
│   ├── components/          # React components
│   ├── lib/                 # Data access functions
│   ├── config/              # Site & nav config
│   └── i18n/                # Internationalization setup
└── messages/                # ${t('projectStructure.tree.messages')}`}
                                language="bash"
                            />
                        </section>

                        {/* Scripts Reference */}
                        <section id="scripts" className="mb-24 scroll-mt-24 border-t pt-16">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-pink-500/10 p-2">
                                    <Terminal className="h-6 w-6 text-pink-500" />
                                </div>
                                {t('scripts.title')}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t('scripts.description')}
                            </p>

                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Command</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {Object.entries(t.raw('scripts.commands')).map(([key, cmd]: [string, any]) => (
                                            <tr key={key} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    <code className="text-sm font-mono text-primary">{cmd.command}</code>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {cmd.description}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Contributing */}
                        <section id="contributing" className="mb-24 scroll-mt-24 border-t pt-16">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/10 p-2">
                                    <GitPullRequest className="h-6 w-6 text-orange-500" />
                                </div>
                                {t('contributing.title')}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t('contributing.description')}
                            </p>

                            <div className="rounded-xl border border-border bg-card p-6 mb-6">
                                <h3 className="text-xl font-bold mb-4">{t('contributing.workflow.title')}</h3>
                                <ol className="space-y-3">
                                    {Object.entries(t.raw('contributing.workflow.steps')).map(([key, step], i) => (
                                        <li key={key} className="flex gap-3">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                {i + 1}
                                            </span>
                                            <span className="text-muted-foreground">{step as string}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="text-xl font-bold mb-4">{t('contributing.guidelines.title')}</h3>
                                <ul className="space-y-3">
                                    {Object.values(t.raw('contributing.guidelines.items')).map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{item as string}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* i18n */}
                        <section id="i18n" className="mb-24 scroll-mt-24 border-t pt-16">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-violet-500/10 p-2">
                                    <LanguagesIcon className="h-6 w-6 text-violet-500" />
                                </div>
                                {t('i18n.title')}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t('i18n.description')}
                            </p>

                            <div className="space-y-6">
                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h3 className="text-xl font-bold mb-3">{t('i18n.languages.title')}</h3>
                                    <p className="text-muted-foreground">{t('i18n.languages.list')}</p>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h3 className="text-xl font-bold mb-3">{t('i18n.location.title')}</h3>
                                    <p className="text-muted-foreground">{t('i18n.location.description')}</p>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h3 className="text-xl font-bold mb-3">{t('i18n.rtl.title')}</h3>
                                    <p className="text-muted-foreground">{t('i18n.rtl.description')}</p>
                                </div>

                                <div className="rounded-xl border border-border bg-card p-6">
                                    <h3 className="text-xl font-bold mb-4">{t('i18n.addLanguage.title')}</h3>
                                    <ol className="space-y-3">
                                        {Object.entries(t.raw('i18n.addLanguage.steps')).map(([key, step], i) => (
                                            <li key={key} className="flex gap-3">
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                    {i + 1}
                                                </span>
                                                <span className="text-muted-foreground">{step as string}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* TOC Sidebar */}
                    <TableOfContents />
                </div>
            </div>
        </div>
    );
}
