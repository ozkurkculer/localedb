'use client';

import * as React from 'react';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, X, ArrowUpDown, Globe, MapPin, Phone, Banknote } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { CountryIndexEntry } from '@/types/country';
import { getContinentStyle } from './continent-variants';

interface CountriesGridClientProps {
    countries: CountryIndexEntry[];
}

type SortKey = 'name' | 'code' | 'currency';
type SortOrder = 'asc' | 'desc';

export function CountriesGridClient({ countries }: CountriesGridClientProps) {
    const t = useTranslations();
    const [searchInput, setSearchInput] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [selectedContinent, setSelectedContinent] = React.useState<string | null>(null);
    const [sortKey, setSortKey] = React.useState<SortKey>('name');
    const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const prefersReducedMotion = useReducedMotion();

    // Debounced search handler
    const handleSearchChange = React.useCallback((value: string) => {
        setSearchInput(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setSearch(value), 200);
    }, []);

    // Cleanup debounce on unmount
    React.useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // Get unique continents
    const continents = React.useMemo(() => {
        const unique = Array.from(new Set(countries.map((c) => c.continent)));
        return unique.sort();
    }, [countries]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    // Filter and Sort
    const filteredCountries = React.useMemo(() => {
        let result = countries.filter((country) => {
            const matchesSearch =
                search === '' ||
                country.name.toLowerCase().includes(search.toLowerCase()) ||
                country.code.toLowerCase().includes(search.toLowerCase()) ||
                country.currencyCode.toLowerCase().includes(search.toLowerCase()) ||
                country.callingCode.includes(search);

            const matchesContinent = selectedContinent === null || country.continent === selectedContinent;

            return matchesSearch && matchesContinent;
        });

        result.sort((a, b) => {
            let valA = '';
            let valB = '';

            switch (sortKey) {
                case 'name':
                    valA = a.name;
                    valB = b.name;
                    break;
                case 'code':
                    valA = a.code;
                    valB = b.code;
                    break;
                case 'currency':
                    valA = a.currencyCode;
                    valB = b.currencyCode;
                    break;
            }

            return sortOrder === 'asc' ? valA.localeCompare(valB, 'en') : valB.localeCompare(valA, 'en');
        });

        return result;
    }, [countries, search, selectedContinent, sortKey, sortOrder]);

    // Staggered entry animation
    const containerVariants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.03
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12, scale: 0.97 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 400,
                damping: 28
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.15, ease: 'easeIn' as const }
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="space-y-4">
                {/* Row 1: Search + Sort */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t('countries.search')}
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9 pr-9"
                        />
                        {searchInput && (
                            <button
                                onClick={() => {
                                    setSearchInput('');
                                    setSearch('');
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Sort dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowUpDown className="h-4 w-4" />
                                {t(`countries.sort.${sortKey}`)} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSort('name')}>
                                {t('countries.sort.name')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('code')}>
                                {t('countries.sort.code')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort('currency')}>
                                {t('currencies.title')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Row 2: Continent Chips - horizontal scrollable */}
                <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
                        <ContinentChip
                            label={t('countries.filters.continent.all')}
                            active={selectedContinent === null}
                            onClick={() => setSelectedContinent(null)}
                        />
                        {continents.map((continent) => (
                            <ContinentChip
                                key={continent}
                                label={continent}
                                active={selectedContinent === continent}
                                continent={continent}
                                onClick={() => setSelectedContinent(continent)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
                {t('countries.subtitle', { count: filteredCountries.length })}
                {(search || selectedContinent) && (
                    <span className="text-foreground/60">
                        {' '}
                        / {countries.length} {t('countries.filters.continent.all').toLowerCase()}
                    </span>
                )}
            </p>

            {/* Grid */}
            {filteredCountries.length > 0 ? (
                <motion.div
                    layout
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredCountries.map((country) => (
                            <motion.div
                                key={country.code}
                                layout
                                variants={itemVariants}
                                exit="exit"
                                className="h-full"
                            >
                                <CountryCard country={country} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 py-16 text-center"
                >
                    <Globe className="h-12 w-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground">{t('common.notFound')}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSearchInput('');
                            setSearch('');
                            setSelectedContinent(null);
                        }}
                    >
                        Clear filters
                    </Button>
                </motion.div>
            )}
        </div>
    );
}

interface ContinentChipProps {
    label: string;
    active: boolean;
    continent?: string;
    onClick: () => void;
}

function ContinentChip({ label, active, continent, onClick }: ContinentChipProps) {
    const style = continent ? getContinentStyle(continent) : null;

    return (
        <button
            onClick={onClick}
            className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                active
                    ? style
                        ? `${style.badgeBg} ${style.badgeText} border-current/20`
                        : 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/40 bg-background text-muted-foreground hover:border-border hover:text-foreground'
            )}
        >
            {label}
        </button>
    );
}

interface CountryCardProps {
    country: CountryIndexEntry;
}

function CountryCard({ country }: CountryCardProps) {
    const style = getContinentStyle(country.continent);
    const prefersReducedMotion = useReducedMotion();

    return (
        <Link href={`/countries/${country.code}`} className="group relative block h-full">
            <motion.div
                className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-card p-4 transition-colors"
                whileHover={
                    prefersReducedMotion
                        ? undefined
                        : {
                              y: -4,
                              boxShadow: style.hoverShadow
                          }
                }
                transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
            >
                {/* Radial gradient glow on hover */}
                <div
                    className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(400px circle at 50% 0%, ${style.glowColor}, transparent 70%)`
                    }}
                />

                {/* Colored border overlay on hover */}
                <div
                    className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        boxShadow: `inset 0 0 0 1px ${style.borderGlow}`
                    }}
                />

                {/* Top: Flag + Code badge */}
                <div className="relative mb-3 flex items-start justify-between">
                    <span className="text-4xl leading-none">{country.flagEmoji}</span>
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {country.code}
                    </code>
                </div>

                {/* Country Name - continent-colored gradient */}
                <h3
                    className={`relative mb-2 line-clamp-1 duration-200 text-base font-bold from-white to-white bg-clip-text text-transparent bg-gradient-to-tr ${style.nameGradientHover} transition-colors`}
                >
                    {country.name}
                </h3>

                {/* Continent Badge - colored chip */}
                <div className="relative mb-3">
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badgeBg} ${style.badgeText}`}
                    >
                        {country.continent}
                    </span>
                </div>

                {/* Meta row - bottom-anchored */}
                <div className="relative mt-auto grid grid-cols-3 gap-x-3 gap-y-1.5 border-t border-border/30 pt-3 text-xs text-muted-foreground">
                    <div className="col-span-1 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0 opacity-50" />
                        <span className="truncate">{country.region}</span>
                    </div>
                    <div className="col-span-1 flex items-center gap-1.5">
                        <Banknote className="h-3 w-3 shrink-0 opacity-50" />
                        <span>{country.currencyCode}</span>
                    </div>
                    <div className="col-span-1 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0 opacity-50" />
                        <span>{country.callingCode}</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
