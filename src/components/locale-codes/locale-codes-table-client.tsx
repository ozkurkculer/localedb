"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, Filter, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CopyButton } from "@/components/copy-button";

interface CountryIndexEntry {
    code: string;
    name: string;
    nativeName: string;
    flagEmoji: string;
    continent: string;
    region: string;
    primaryLocale: string;
    currencyCode: string;
    callingCode: string;
}

interface LocaleCodesTableClientProps {
    countries: CountryIndexEntry[];
}

const CONTINENTS = [
    "all",
    "Africa",
    "Antarctica",
    "Asia",
    "Europe",
    "North America",
    "Oceania",
    "South America",
] as const;

const continentKeyMap: Record<string, string> = {
    all: "all",
    Africa: "africa",
    Antarctica: "antarctica",
    Asia: "asia",
    Europe: "europe",
    "North America": "northAmerica",
    Oceania: "oceania",
    "South America": "southAmerica",
};

export function LocaleCodesTableClient({
    countries,
}: LocaleCodesTableClientProps) {
    const t = useTranslations();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedContinent, setSelectedContinent] = useState<string>("all");

    const filteredCountries = useMemo(() => {
        let result = countries;

        // Filter by continent
        if (selectedContinent !== "all") {
            result = result.filter((c) => c.continent === selectedContinent);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(query) ||
                    c.code.toLowerCase().includes(query) ||
                    c.primaryLocale.toLowerCase().includes(query) ||
                    c.currencyCode?.toLowerCase().includes(query) ||
                    c.callingCode?.includes(query) ||
                    c.region?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [countries, searchQuery, selectedContinent]);

    return (
        <div>
            {/* Search & Filter Bar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={t("localeCodes.search")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Continent Filter */}
                <div className="flex flex-wrap gap-2">
                    <Filter className="hidden sm:block h-4 w-4 mt-2 text-muted-foreground" />
                    {CONTINENTS.map((continent) => {
                        const key = continentKeyMap[continent];
                        return (
                            <Button
                                key={continent}
                                variant={selectedContinent === continent ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedContinent(continent)}
                                className="text-xs"
                            >
                                {t(`countries.filters.continent.${key}`)}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-3 text-sm text-muted-foreground">
                {t("localeCodes.resultsCount", { count: filteredCountries.length, total: countries.length })}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableCaption>{t("localeCodes.table.caption")}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky left-0 z-10 bg-background w-16">
                                {t("localeCodes.table.flag")}
                            </TableHead>
                            <TableHead className="sticky left-16 z-10 bg-background min-w-[150px]">
                                {t("localeCodes.table.country")}
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                                {t("localeCodes.table.alpha2")}
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                                {t("localeCodes.table.bcp47")}
                            </TableHead>
                            <TableHead className="hidden sm:table-cell min-w-[100px]">
                                {t("localeCodes.table.currency")}
                            </TableHead>
                            <TableHead className="hidden md:table-cell min-w-[120px]">
                                {t("localeCodes.table.callingCode")}
                            </TableHead>
                            <TableHead className="hidden lg:table-cell min-w-[150px]">
                                {t("localeCodes.table.region")}
                            </TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCountries.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {t("localeCodes.noResults")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCountries.map((country) => (
                                <TableRow
                                    key={country.code}
                                    className="group cursor-pointer transition-colors hover:bg-muted/50"
                                >
                                    <TableCell className="sticky left-0 z-10 bg-background group-hover:bg-muted/50 text-2xl transition-colors">
                                        <Link href={`/countries/${country.code}`} className="block">
                                            {country.flagEmoji}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="sticky left-16 z-10 bg-background group-hover:bg-muted/50 transition-colors">
                                        <Link
                                            href={`/countries/${country.code}`}
                                            className="font-medium text-foreground hover:text-primary transition-colors"
                                        >
                                            {country.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="rounded bg-muted px-2 py-1 text-sm">
                                                {country.code}
                                            </code>
                                            <CopyButton
                                                value={country.code}
                                                label={t("localeCodes.copy.code", { name: country.name })}
                                                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="rounded bg-muted px-2 py-1 text-sm">
                                                {country.primaryLocale}
                                            </code>
                                            <CopyButton
                                                value={country.primaryLocale}
                                                label={t("localeCodes.copy.locale", { name: country.name })}
                                                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <div className="flex items-center gap-2">
                                            <code className="rounded bg-muted px-2 py-1 text-sm">
                                                {country.currencyCode}
                                            </code>
                                            <CopyButton
                                                value={country.currencyCode}
                                                label={t("localeCodes.copy.currency", { code: country.currencyCode })}
                                                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <code className="text-sm text-muted-foreground">
                                            {country.callingCode}
                                        </code>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                        {country.region}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/countries/${country.code}`}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100"
                                            title={t("localeCodes.viewCountry")}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Hint */}
            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground sm:hidden">
                {t("localeCodes.mobileHint")}
            </div>
        </div>
    );
}
