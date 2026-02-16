"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNav } from "@/config/navigation";
import { ThemeToggle } from "./theme-toggle";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>{t("common.menu")}</SheetTitle>
        </SheetHeader>
        <nav className="ps-5 mt-8 flex flex-col space-y-4">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`
                text-lg font-medium transition-colors hover:text-primary
                ${item.disabled ? "cursor-not-allowed opacity-60" : ""}
              `}
            >
              {t(item.title as any)}
            </Link>
          ))}
        </nav>
        <div className="ps-5 mt-8 flex items-center gap-4 border-t pt-4">
          <span className="text-sm text-muted-foreground">{t("common.theme")}:</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
