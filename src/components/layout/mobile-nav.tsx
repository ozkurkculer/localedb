"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
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
          <SheetTitle>Menu</SheetTitle>
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
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="ps-5 mt-8 flex items-center gap-4 border-t pt-4">
          <span className="text-sm text-muted-foreground">Theme:</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
