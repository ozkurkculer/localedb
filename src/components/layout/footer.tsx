import { Link } from '@/i18n/routing';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';
import { footerNav } from '@/config/navigation';
import { getAppVersion } from '@/lib/updates';
import { Logo } from '@/components/logo';

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
                </div>

                {/* Resources */}
                <div>
                    <h3 className="mb-4 text-sm font-semibold">{t('footer.sections.resources.title')}</h3>
                    <ul className="space-y-3 text-sm">
                        {footerNav.resources.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                      text-muted-foreground transition-colors hover:text-foreground
                      ${item.disabled ? 'cursor-not-allowed opacity-60' : ''}
                    `}
                                >
                                    {t(item.title as any)}
                                </Link>
                            </li>
                        ))}
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
                        <p>Built with ❤️ by ozkurkculer, for developers.</p>
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
