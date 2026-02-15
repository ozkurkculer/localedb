"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CurrencyIndexEntry } from "@/types/currency";

interface CurrenciesGridClientProps {
  currencies: CurrencyIndexEntry[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function CurrenciesGridClient({ currencies }: CurrenciesGridClientProps) {
  const [search, setSearch] = React.useState("");

  // Filter currencies
  const filteredCurrencies = React.useMemo(() => {
    return currencies.filter((currency) => {
      const matchesSearch =
        search === "" ||
        currency.name.toLowerCase().includes(search.toLowerCase()) ||
        currency.code.toLowerCase().includes(search.toLowerCase()) ||
        currency.symbol.toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [currencies, search]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, symbol..."
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
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCurrencies.length} of {currencies.length} currencies
      </div>

      {/* Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredCurrencies.map((currency, index) => (
          <motion.div
            key={currency.code}
            variants={fadeInUp}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
            className="h-full"
          >
            <CurrencyCard currency={currency} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredCurrencies.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No currencies found.</p>
          <Button
            variant="link"
            onClick={() => setSearch("")}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

interface CurrencyCardProps {
  currency: CurrencyIndexEntry;
}

function CurrencyCard({ currency }: CurrencyCardProps) {
  return (
    <Link
      href={`/currencies/${currency.code}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-card p-5 transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5"
    >
        <div className="mb-4 flex items-center justify-between">
             <div className="text-2xl font-bold bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">{currency.symbol}</div>
             <div className="rounded bg-muted px-2 py-1 font-mono text-xs font-medium">{currency.code}</div>
        </div>

      {/* Currency Name */}
      <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">
        {currency.name}
      </h3>
      
      {/* Meta Info */}
      <div className="mt-auto pt-4 text-sm text-muted-foreground">
         Used in <span className="font-medium text-foreground">{currency.countriesCount}</span> countries
      </div>
    </Link>
  );
}
