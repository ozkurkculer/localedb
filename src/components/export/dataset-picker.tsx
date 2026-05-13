"use client";

import { useTranslations } from "next-intl";
import { Globe2, Coins, Languages, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DatasetKey } from "@/lib/export/field-schema";

interface DatasetPickerProps {
  value: DatasetKey;
  onChange: (value: DatasetKey) => void;
}

const OPTIONS: {
  key: DatasetKey;
  icon: typeof Globe2;
  activeBg: string;
  hoverBg: string;
  iconColor: string;
  iconHover: string;
  ring: string;
}[] = [
  {
    key: "countries",
    icon: Globe2,
    activeBg: "bg-gradient-to-br from-blue-500/15 to-blue-500/5",
    hoverBg: "group-hover:bg-gradient-to-br group-hover:from-blue-500/15 group-hover:to-blue-500/5",
    iconColor: "text-blue-500",
    iconHover: "group-hover:text-blue-500",
    ring: "ring-blue-500/50",
  },
  {
    key: "currencies",
    icon: Coins,
    activeBg: "bg-gradient-to-br from-amber-500/15 to-amber-500/5",
    hoverBg: "group-hover:bg-gradient-to-br group-hover:from-amber-500/15 group-hover:to-amber-500/5",
    iconColor: "text-amber-500",
    iconHover: "group-hover:text-amber-500",
    ring: "ring-amber-500/50",
  },
  {
    key: "languages",
    icon: Languages,
    activeBg: "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5",
    hoverBg: "group-hover:bg-gradient-to-br group-hover:from-emerald-500/15 group-hover:to-emerald-500/5",
    iconColor: "text-emerald-500",
    iconHover: "group-hover:text-emerald-500",
    ring: "ring-emerald-500/50",
  },
  {
    key: "airports",
    icon: Plane,
    activeBg: "bg-gradient-to-br from-rose-500/15 to-rose-500/5",
    hoverBg: "group-hover:bg-gradient-to-br group-hover:from-rose-500/15 group-hover:to-rose-500/5",
    iconColor: "text-rose-500",
    iconHover: "group-hover:text-rose-500",
    ring: "ring-rose-500/50",
  },
];

export function DatasetPicker({ value, onChange }: DatasetPickerProps) {
  const t = useTranslations("export.datasets");

  return (
    <div
      role="radiogroup"
      aria-label={t("ariaLabel")}
      className="grid grid-cols-2 gap-3 md:grid-cols-4"
    >
      {OPTIONS.map(({ key, icon: Icon, activeBg, hoverBg, iconColor, iconHover, ring }) => {
        const selected = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(key)}
            className={cn(
              "group relative flex flex-col items-start gap-2 rounded-xl border-0 p-4 text-left text-foreground",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? cn(activeBg, "ring-2 ring-offset-2 ring-offset-background shadow-sm", ring)
                : cn(
                    "!bg-muted/80 dark:bg-muted/30 hover:scale-[1.03] hover:shadow-md",
                    hoverBg
                  )
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-colors duration-200",
                selected ? iconColor : cn("text-muted-foreground", iconHover)
              )}
              aria-hidden
            />
            <span className="text-sm font-semibold text-foreground">{t(`${key}.title`)}</span>
            <span className="text-xs text-muted-foreground">{t(`${key}.description`)}</span>
          </button>
        );
      })}
    </div>
  );
}
