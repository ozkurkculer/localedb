"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, X, Plane } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Airport } from "@/types/airport";

interface AirportsGridClientProps {
  airports: Airport[];
  countryMap: Record<string, { name: string; emoji: string }>;
}

export function AirportsGridClient({ airports, countryMap }: AirportsGridClientProps) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 50;
  const t = useTranslations();

  // Filter airports
  const filteredAirports = React.useMemo(() => {
    let results = airports;
    if (search) {
      const lowerSearch = search.toLowerCase();
      results = results.filter((airport) => {
        const countryName = countryMap[airport.countryCode]?.name || "";
        return (
          airport.name.toLowerCase().includes(lowerSearch) ||
          airport.iata.toLowerCase().includes(lowerSearch) ||
          airport.icao.toLowerCase().includes(lowerSearch) ||
          countryName.toLowerCase().includes(lowerSearch) ||
          airport.region.toLowerCase().includes(lowerSearch)
        );
      });
    }
    return results;
  }, [airports, search, countryMap]);

  // Reset page on search
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  // Paginate
  const displayedAirports = filteredAirports.slice(0, page * itemsPerPage);
  const hasMore = displayedAirports.length < filteredAirports.length;

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("airports.search")}
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
        <div className="text-sm text-muted-foreground">
          {t("airports.showing", { shown: displayedAirports.length, total: filteredAirports.length })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedAirports.map((airport) => {
          const country = countryMap[airport.countryCode];
          const key = airport.iata || airport.icao || `${airport.latitude}-${airport.longitude}`;
          return (
            <div key={key} className="flex items-start justify-between rounded-lg border border-border/40 bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
                  <Plane className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-medium truncate" title={airport.name}>{airport.name}</div>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span>{country?.emoji}</span>
                      <span className="truncate">{country?.name}</span>
                    </span>
                    <span className="truncate">{airport.region}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {airport.iata && <span className="rounded-md bg-muted px-2 py-1 font-mono text-sm font-bold text-sky-600 dark:text-sky-400">{airport.iata}</span>}
                {airport.icao && <span className="rounded-md bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{airport.icao}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {displayedAirports.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          {t("airports.noResults")}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={() => setPage(p => p + 1)}>
            {t("airports.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
