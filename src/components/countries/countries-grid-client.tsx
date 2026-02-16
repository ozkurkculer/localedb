"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CountryIndexEntry } from "@/types/country";

interface CountriesGridClientProps {
  countries: CountryIndexEntry[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

type SortKey = "name" | "code" | "currency";
type SortOrder = "asc" | "desc";

export function CountriesGridClient({ countries }: CountriesGridClientProps) {
  const t = useTranslations();
  const [search, setSearch] = React.useState("");
  const [selectedContinent, setSelectedContinent] = React.useState<
    string | null
  >(null);
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");

  // Get unique continents
  const continents = React.useMemo(() => {
    const unique = Array.from(new Set(countries.map((c) => c.continent)));
    return unique.sort();
  }, [countries]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Filter and Sort
  const filteredCountries = React.useMemo(() => {
    let result = countries.filter((country) => {
      const matchesSearch =
        search === "" ||
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.code.toLowerCase().includes(search.toLowerCase()) ||
        country.currencyCode.toLowerCase().includes(search.toLowerCase()) ||
        country.callingCode.includes(search);

      const matchesContinent =
        selectedContinent === null || country.continent === selectedContinent;

      return matchesSearch && matchesContinent;
    });

    result.sort((a, b) => {
      let valA = "";
      let valB = "";

      switch (sortKey) {
        case "name":
          valA = a.name;
          valB = b.name;
          break;
        case "code":
          valA = a.code;
          valB = b.code;
          break;
        case "currency":
          valA = a.currencyCode;
          valB = b.currencyCode;
          break;
      }

      return sortOrder === "asc"
        ? valA.localeCompare(valB, 'en')
        : valB.localeCompare(valA, 'en');
    });

    return result;
  }, [countries, search, selectedContinent, sortKey, sortOrder]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("countries.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center flex-col-reverse md:flex-row-reverse gap-4 md:gap-2">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                {t(`countries.sort.${sortKey}`)} ({sortOrder === "asc" ? "A-Z" : "Z-A"})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("name")}>
                {t("countries.sort.name")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("code")}>
                {t("countries.sort.name")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("currency")}>
                {t("currencies.title")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Continent Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedContinent === null ? "default" : "outline"}
              onClick={() => setSelectedContinent(null)}
            >
              {t("countries.filters.continent.all")}
            </Button>
            {continents.map((continent) => (
              <Button
                key={continent}
                size="sm"
                variant={
                  selectedContinent === continent ? "default" : "outline"
                }
                onClick={() => setSelectedContinent(continent)}
              >
                {continent}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCountries.length} of {countries.length} countries
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredCountries.map((country) => (
          <motion.div
            key={country.code}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <CountryCard country={country} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredCountries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("common.notFound")}</p>
          <Button
            variant="link"
            onClick={() => {
              setSearch("");
              setSelectedContinent(null);
            }}
            className="mt-2"
          >
            {t("common.notFound")}
          </Button>
        </div>
      )}
    </div>
  );
}

interface CountryCardProps {
  country: CountryIndexEntry;
}

function CountryCard({ country }: CountryCardProps) {
  return (
    <Link
      href={`/countries/${country.code}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-card p-5 transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Flag */}
      <div className="mb-3 text-4xl">{country.flagEmoji}</div>

      {/* Country Name */}
      <h3 className="mb-2 line-clamp-1 text-lg font-bold bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-indigo-500 transition-all">
        {country.name}
      </h3>

      {/* Meta Info */}
      <div className="mt-auto space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            {country.continent}
          </span>
        </div>
        <p className="line-clamp-1 text-xs">{country.region}</p>
        <div className="flex items-center justify-between pt-1">
          <code className="text-xs font-semibold text-foreground">
            {country.code}
          </code>
          <span className="text-xs">
            {country.currencyCode} · {country.callingCode}
          </span>
        </div>
      </div>
    </Link>
  );
}
