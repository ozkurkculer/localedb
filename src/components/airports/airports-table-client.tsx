"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X, Plane, ArrowUpDown, Copy, Check } from "lucide-react";
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
import { toast } from "sonner";

interface AirportsTableClientProps {
  airports: Airport[];
  countryMap: Record<string, { name: string; emoji: string }>;
}

type SortKey = "iata" | "icao" | "name" | "country" | "region";
type SortOrder = "asc" | "desc";

export function AirportsTableClient({ airports, countryMap }: AirportsTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<SortKey>("iata");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");
  const itemsPerPage = 50;

  // Update URL when search changes (debounced)
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [search, pathname, router, searchParams]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  // Filter and Sort
  const processedAirports = React.useMemo(() => {
    let results = [...airports];

    // Filter
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

    // Sort
    results.sort((a, b) => {
      let valA = "";
      let valB = "";

      switch (sortKey) {
        case "country":
          valA = countryMap[a.countryCode]?.name || "";
          valB = countryMap[b.countryCode]?.name || "";
          break;
        case "iata":
          valA = a.iata || "";
          valB = b.iata || "";
          break;
        case "icao":
          valA = a.icao || "";
          valB = b.icao || "";
          break;
        case "name":
          valA = a.name || "";
          valB = b.name || "";
          break;
        case "region":
          valA = a.region || "";
          valB = b.region || "";
          break;
      }

      return sortOrder === "asc" 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    });

    return results;
  }, [airports, search, countryMap, sortKey, sortOrder]);

  // Reset page on search/sort
  React.useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortOrder]);

  // Paginate
  const displayedAirports = processedAirports.slice(0, page * itemsPerPage);
  const hasMore = displayedAirports.length < processedAirports.length;

  const SortIcon = ({ active }: { active: boolean }) => (
    <ArrowUpDown className={`ml-2 h-4 w-4 ${active ? "opacity-100" : "opacity-40"}`} />
  );

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
            Showing {displayedAirports.length} of {processedAirports.length} airports
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border/40">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px] cursor-pointer hover:text-foreground" onClick={() => handleSort("iata")}>
                <div className="flex items-center">IATA <SortIcon active={sortKey === "iata"} /></div>
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer hover:text-foreground" onClick={() => handleSort("icao")}>
                <div className="flex items-center">ICAO <SortIcon active={sortKey === "icao"} /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort("name")}>
                <div className="flex items-center">Airport Name <SortIcon active={sortKey === "name"} /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort("country")}>
                 <div className="flex items-center">Location <SortIcon active={sortKey === "country"} /></div>
              </TableHead>
              <TableHead className="cursor-pointer text-right hover:text-foreground" onClick={() => handleSort("region")}>
                 <div className="flex items-center justify-end">Region <SortIcon active={sortKey === "region"} /></div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedAirports.map((airport) => {
              const country = countryMap[airport.countryCode];
              const key = airport.iata || airport.icao || `${airport.latitude}-${airport.longitude}`;
              
              return (
                <TableRow key={key} className="group hover:bg-red-500/5">
                  <TableCell>
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-red-600 dark:text-red-400">{airport.iata}</span>
                        {airport.iata && (
                            <button 
                                onClick={() => copyToClipboard(airport.iata, "IATA Code")}
                                className="opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                title="Copy IATA"
                            >
                                <Copy className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-muted-foreground">{airport.icao}</span>
                        {airport.icao && (
                            <button 
                                onClick={() => copyToClipboard(airport.icao, "ICAO Code")}
                                className="opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                title="Copy ICAO"
                            >
                                <Copy className="h-3 w-3" />
                            </button>
                        )}
                    </div>
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
                  <TableCell>
                     {/* Removed row copy since we have granular copy now, or keep it as generic copy */}
                  </TableCell>
                </TableRow>
              );
            })}
            {displayedAirports.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
