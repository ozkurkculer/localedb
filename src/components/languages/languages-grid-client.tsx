"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LanguageIndexEntry } from "@/types/language";

interface LanguagesGridClientProps {
  languages: LanguageIndexEntry[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function LanguagesGridClient({ languages }: LanguagesGridClientProps) {
  const [search, setSearch] = React.useState("");

  // Filter languages
  const filteredLanguages = React.useMemo(() => {
    return languages.filter((language) => {
      const matchesSearch =
        search === "" ||
        language.name.toLowerCase().includes(search.toLowerCase()) ||
        language.nativeName.toLowerCase().includes(search.toLowerCase()) ||
        language.code.toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [languages, search]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, native name..."
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
        Showing {filteredLanguages.length} of {languages.length} languages
      </div>

      {/* Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredLanguages.map((language, index) => (
          <motion.div
            key={language.code}
            variants={fadeInUp}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
            className="h-full"
          >
            <LanguageCard language={language} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredLanguages.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No languages found.</p>
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

interface LanguageCardProps {
  language: LanguageIndexEntry;
}

function LanguageCard({ language }: LanguageCardProps) {
  return (
    <Link
      href={`/languages/${language.code}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/40 bg-card p-5 transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Language Name */}
      <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">
        {language.name}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">{language.nativeName}</p>

      {/* Meta Info */}
      <div className="mt-auto space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-2">
          <code className="text-xs font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
            {language.code}
          </code>
          <span className="text-xs">
            {language.countriesCount} countries
          </span>
        </div>
      </div>
    </Link>
  );
}
