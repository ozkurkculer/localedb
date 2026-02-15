"use client";

import * as React from "react";
import { Search, X, Plane } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Airport } from "@/types/airport";

interface AirportsTableClientProps {
  airports: Airport[];
  countryMap: Record<string, { name: string; emoji: string }>;
}

export function AirportsTableClient({ airports, countryMap }: AirportsTableClientProps) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 50;

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
            placeholder="Search by name, code, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 focus-visible:ring-red-500"
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
            Showing {displayedAirports.length} of {filteredAirports.length} airports
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border/40">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">IATA</TableHead>
              <TableHead className="w-[100px]">ICAO</TableHead>
              <TableHead>Airport Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Region</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedAirports.map((airport) => {
              const country = countryMap[airport.countryCode];
              const key = airport.iata || airport.icao || `${airport.latitude}-${airport.longitude}`;
              
              return (
                <TableRow key={key} className="group hover:bg-red-500/5">
                  <TableCell className="font-mono font-bold text-red-600 dark:text-red-400">
                    {airport.iata}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {airport.icao}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       <Plane className="h-4 w-4 text-red-500/50 opacity-0 transition-opacity group-hover:opacity-100" />
                       {airport.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span>{country?.emoji}</span>
                      <span>{country?.name}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {airport.region}
                  </TableCell>
                </TableRow>
              );
            })}
            {displayedAirports.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No airports found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => p + 1)}
            className="hover:border-red-500/50 hover:bg-red-500/5 hover:text-red-600 dark:hover:text-red-400"
          >
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
}
