import { Link } from '@/i18n/routing';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';
import { footerNav } from '@/config/navigation';
import { getAppVersion } from '@/lib/updates';
import { Logo } from '@/components/logo';
import { Github, Package } from 'lucide-react';

export async function Footer() {
    const t = await getTranslations();
    const version = getAppVersion();
    return (
        <footer className="border-t border-border/40 py-12 md:py-16">
            <div className="grid container grid-cols-2 gap-8 md:grid-cols-4">
                {/* Brand */}
                <div className="col-span-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <Logo className="h-8 w-auto" />
                    </Link>
                    <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t('footer.description')}</p>

                    {/* Dataset at a glance */}
                    <ul className="mt-6 flex max-w-sm flex-wrap gap-2 text-xs text-muted-foreground">
                        {(['countries', 'currencies', 'languages', 'airports'] as const).map((key) => (
                            <li key={key} className="rounded-md border border-border/60 px-2 py-1">
                                {t(`docs.overview.stats.${key}`)}
                            </li>
                        ))}
                    </ul>

                    {/* Install + links */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <code className="rounded-md border border-border/60 bg-muted/50 px-3 py-1.5 font-mono text-xs text-foreground">
                            npm i @localedb/core
                        </code>
                        <a
                            href={siteConfig.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <Github className="h-4 w-4" />
                        </a>
                        <a
                            href={siteConfig.links.npm}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="npm"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <Package className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="mb-4 text-sm font-semibold">{t('footer.sections.resources.title')}</h3>
                    <ul className="space-y-3 text-sm">
                        {footerNav.resources.map((item) => {
                            const label = t(item.title as any);
                            return (
                                <li key={item.href}>
                                    {item.disabled ? (
                                        <span aria-disabled="true" className="cursor-not-allowed text-muted-foreground opacity-60">
                                            {label}
                                        </span>
                                    ) : (
                                        <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                                            {label}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Community */}
                <div>
                    <h3 className="mb-4 text-sm font-semibold">{t('footer.sections.community.title')}</h3>
                    <ul className="space-y-3 text-sm">
                        {footerNav.community.map((item) => {
                            const LinkComponent = item.external ? NextLink : Link;
                            return (
                                <li key={item.href}>
                                    <LinkComponent
                                        href={item.href}
                                        className={`
                        text-muted-foreground transition-colors hover:text-foreground
                        ${item.disabled ? 'cursor-not-allowed opacity-60' : ''}
                      `}
                                        {...(item.external && {
                                            target: '_blank',
                                            rel: 'noopener noreferrer'
                                        })}
                                    >
                                        {t(item.title as any)}
                                    </LinkComponent>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Bottom */}
            <div className="mt-12 border-t border-border/40">
                <div className="container flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Link
                            href="/updates"
                            className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs transition-colors hover:text-foreground"
                        >
                            v{version}
                        </Link>
                        <p>
                            Built with ❤️ by{' '}
                            <a
                                href={siteConfig.creator.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium underline-offset-4 transition-colors hover:text-foreground hover:underline"
                            >
                                ozkurkculer
                            </a>
                            , for curious minds.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {footerNav.legal.map((item) => {
                            const LinkComponent = item.external ? NextLink : Link;
                            return (
                                <LinkComponent
                                    key={item.href}
                                    href={item.href}
                                    className="transition-colors hover:text-foreground"
                                    {...(item.external && {
                                        target: '_blank',
                                        rel: 'noopener noreferrer'
                                    })}
                                >
                                    {t(item.title as any)}
                                </LinkComponent>
                            );
                        })}
                    </div>
                </div>
            </div>
        </footer>
    );
}
