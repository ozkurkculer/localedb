"use client";

import { useTranslations } from "next-intl";
import { FileJson, FileSpreadsheet, FileArchive, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/lib/export/serialize";

interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (value: ExportFormat) => void;
}

const FORMATS: { key: ExportFormat; icon: typeof FileJson }[] = [
  { key: "json", icon: FileJson },
  { key: "json-min", icon: FileCode },
  { key: "csv", icon: FileSpreadsheet },
  { key: "zip", icon: FileArchive },
];

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  const t = useTranslations("export.formats");

  return (
    <div
      role="radiogroup"
      aria-label={t("ariaLabel")}
      className="grid grid-cols-2 gap-2 md:grid-cols-4"
    >
      {FORMATS.map(({ key, icon: Icon }) => {
        const selected = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(key)}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left text-sm text-foreground transition-all",
              "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border/60"
            )}
          >
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="font-semibold text-foreground">{t(`${key}.title`)}</span>
            <span className="text-xs text-muted-foreground">
              {t(`${key}.description`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
