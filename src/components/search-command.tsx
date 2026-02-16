"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Globe, Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { CountryIndexEntry } from "@/types/country";

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [countries, setCountries] = React.useState<CountryIndexEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const hasFetched = React.useRef(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch countries when dialog opens for the first time
  React.useEffect(() => {
    if (open && !hasFetched.current) {
      setLoading(true);
      fetch("/api/countries")
        .then((res) => res.json())
        .then((data) => {
          setCountries(data);
          hasFetched.current = true;
        })
        .catch((error) => {
          console.error("Failed to fetch countries:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search countries, currencies, and codes"
        className="inline-flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground dark:bg-muted/20 dark:border-border sm:w-64 sm:pr-2"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search countries...</span>
        </span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search countries, currencies, codes..." />
        <CommandList>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Countries">
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code} ${country.currencyCode} ${country.primaryLocale}`}
                    onSelect={() => {
                      runCommand(() => router.push(`/countries/${country.code}`));
                    }}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    <span className="mr-2 text-xl">{country.flagEmoji}</span>
                    <div className="flex flex-1 items-center justify-between">
                      <span>{country.name}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{country.code}</span>
                        <span>·</span>
                        <span>{country.currencyCode}</span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
