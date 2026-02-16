'use client';

import * as React from 'react';
import { Link } from '@/i18n/routing';
import { Menu, Database, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { navGroups } from '@/config/navigation';
import { ThemeToggle } from './theme-toggle';

export function MobileNav() {
    const [open, setOpen] = React.useState(false);
    const t = useTranslations();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>{t('common.menu')}</SheetTitle>
                </SheetHeader>

                {/* Data Section */}
                <div className="mt-8">
                    <div className="mb-3 flex items-center gap-2 px-5 text-sm font-semibold text-muted-foreground">
                        <Database className="h-4 w-4" />
                        <span>{t(navGroups.data.label)}</span>
                    </div>
                    <nav className="flex flex-col space-y-3 px-5">
                        {navGroups.data.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="text-lg font-medium transition-colors hover:text-primary"
                            >
                                {t(item.title as any)}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Project Section */}
                <div className="mt-6">
                    <div className="mb-3 flex items-center gap-2 px-5 text-sm font-semibold text-muted-foreground">
                        <Info className="h-4 w-4" />
                        <span>{t(navGroups.project.label)}</span>
                    </div>
                    <nav className="flex flex-col space-y-3 px-5">
                        {navGroups.project.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="text-lg font-medium transition-colors hover:text-primary"
                            >
                                {t(item.title as any)}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Theme Toggle */}
                <div className="mt-8 flex items-center gap-4 border-t px-5 pt-4">
                    <span className="text-sm text-muted-foreground">{t('common.theme')}:</span>
                    <ThemeToggle />
                </div>
            </SheetContent>
        </Sheet>
    );
}
