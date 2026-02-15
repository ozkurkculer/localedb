"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CountryIndexEntry } from "@/types/country";

interface CountriesGridClientProps {
  countries: CountryIndexEntry[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function CountriesGridClient({ countries }: CountriesGridClientProps) {
  const [search, setSearch] = React.useState("");
  const [selectedContinent, setSelectedContinent] = React.useState<
    string | null
  >(null);

  // Get unique continents
  const continents = React.useMemo(() => {
    const unique = Array.from(new Set(countries.map((c) => c.continent)));
    return unique.sort();
  }, [countries]);

  // Filter countries
  const filteredCountries = React.useMemo(() => {
    return countries.filter((country) => {
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
  }, [countries, search, selectedContinent]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, currency..."
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

        {/* Continent Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedContinent === null ? "default" : "outline"}
            onClick={() => setSelectedContinent(null)}
          >
            All
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

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCountries.length} of {countries.length} countries
      </div>

      {/* Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredCountries.map((country, index) => (
          <motion.div
            key={country.code}
            variants={fadeInUp}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <CountryCard country={country} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredCountries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No countries found.</p>
          <Button
            variant="link"
            onClick={() => {
              setSearch("");
              setSelectedContinent(null);
            }}
            className="mt-2"
          >
            Clear filters
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
      className="group relative overflow-hidden rounded-lg border border-border/40 bg-card p-6 transition-all hover:border-border hover:shadow-md"
    >
      <div className="mb-4 text-5xl">{country.flagEmoji}</div>
      <h3 className="mb-2 text-xl font-semibold group-hover:text-primary">
        {country.name}
      </h3>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>{country.region}</p>
        <p className="font-mono">{country.code}</p>
        <p>
          {country.currencyCode} · {country.callingCode}
        </p>
      </div>
    </Link>
  );
}
