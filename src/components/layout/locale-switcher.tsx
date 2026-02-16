"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routing } from "@/i18n/routing";

const localeNames: Record<string, { native: string; flag: string }> = {
  en: { native: "English", flag: "🇬🇧" },
  tr: { native: "Türkçe", flag: "🇹🇷" },
  zh: { native: "中文", flag: "🇨🇳" },
  hi: { native: "हिन्दी", flag: "🇮🇳" },
  es: { native: "Español", flag: "🇪🇸" },
  fr: { native: "Français", flag: "🇫🇷" },
  ar: { native: "العربية", flag: "🇸🇦" },
  bn: { native: "বাংলা", flag: "🇧🇩" },
  pt: { native: "Português", flag: "🇵🇹" },
  ru: { native: "Русский", flag: "🇷🇺" },
  ja: { native: "日本語", flag: "🇯🇵" },
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`flex items-center gap-2 ${
              locale === loc ? "bg-accent" : ""
            }`}
          >
            <span className="text-lg">{localeNames[loc].flag}</span>
            <span>{localeNames[loc].native}</span>
            {locale === loc && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
