'use client';

import { Link } from '@/i18n/routing';
import NextLink from 'next/link';
import { Globe, ChevronDown, Database, Info } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { navGroups } from '@/config/navigation';
import { SearchCommand } from '@/components/search-command';
import { ThemeToggle } from './theme-toggle';
import { MobileNav } from './mobile-nav';
import { LocaleSwitcher } from './locale-switcher';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export function Header() {
    const t = useTranslations();
    const pathname = usePathname();
    const [dataOpen, setDataOpen] = useState(false);
    const [projectOpen, setProjectOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center">
                {/* Mobile Navigation */}
                <MobileNav />

                {/* Logo */}
                <Link href="/" className="mr-4 flex items-center space-x-2 md:mr-8">
                    <Globe className="h-6 w-6" />
                    <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
                </Link>

                {/* Desktop Navigation - Dropdowns */}
                <nav className="hidden flex-1 items-center space-x-1 text-sm font-medium md:flex">
                    {/* Data Dropdown */}
                    <DropdownMenu open={dataOpen} onOpenChange={setDataOpen}>
                        <DropdownMenuTrigger className="group inline-flex h-9 items-center gap-1 rounded-md px-3 text-foreground/80 transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground">
                            <Database className="h-4 w-4" />
                            <span>{t(navGroups.data.label)}</span>
                            <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            {navGroups.data.items.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link
                                        href={item.href}
                                        className={`cursor-pointer ${
                                            pathname === item.href ? 'bg-accent font-medium' : ''
                                        }`}
                                    >
                                        {t(item.title as any)}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Project Dropdown */}
                    <DropdownMenu open={projectOpen} onOpenChange={setProjectOpen}>
                        <DropdownMenuTrigger className="group inline-flex h-9 items-center gap-1 rounded-md px-3 text-foreground/80 transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground">
                            <Info className="h-4 w-4" />
                            <span>{t(navGroups.project.label)}</span>
                            <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            {navGroups.project.items.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link
                                        href={item.href}
                                        className={`cursor-pointer ${
                                            pathname === item.href ? 'bg-accent font-medium' : ''
                                        }`}
                                    >
                                        {t(item.title as any)}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>

                {/* Right side - Search, GitHub & Theme toggle */}
                <div className="flex flex-1 items-center justify-end space-x-2 sm:flex-initial">
                    <SearchCommand />
                    <NextLink
                        href={siteConfig.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:block"
                    >
                        <div className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                            {t('footer.sections.resources.github')}
                        </div>
                    </NextLink>
                    <LocaleSwitcher />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
