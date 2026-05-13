"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export interface EntityOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface EntityGridProps {
  options: EntityOption[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  pageSize?: number;
}

export function EntityGrid({
  options,
  selected,
  onChange,
  pageSize = 60,
}: EntityGridProps) {
  const t = useTranslations("export.entities");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.label.toLowerCase().includes(q) ||
        (o.sublabel?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  const visible = filtered.slice(0, visibleCount);

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selected);
    for (const o of filtered) next.add(o.id);
    onChange(next);
  };

  const clearAll = () => onChange(new Set());

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(pageSize);
            }}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={selectAllFiltered}
          >
            {t("selectAllFiltered", { count: filtered.length })}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearAll}
            disabled={selected.size === 0}
          >
            {t("clear")}
          </Button>
        </div>
      </div>

      <div
        aria-live="polite"
        className="text-xs text-muted-foreground"
      >
        {t("selectedCount", { selected: selected.size, total: options.length })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          {t("noResults")}
        </p>
      ) : (
        <div
          role="group"
          aria-label={t("listLabel")}
          className="grid max-h-[420px] grid-cols-1 gap-1 overflow-y-auto rounded-lg border bg-card/30 p-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((opt) => {
            const checked = selected.has(opt.id);
            return (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/60"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleOne(opt.id)}
                  aria-label={opt.label}
                />
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate font-medium">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {opt.sublabel}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {visibleCount < filtered.length && (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((v) => v + pageSize)}
          >
            {t("loadMore", { remaining: filtered.length - visibleCount })}
          </Button>
        </div>
      )}
    </div>
  );
}
