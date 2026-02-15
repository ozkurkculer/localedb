import Link from "next/link";
import { Globe } from "lucide-react";
import { siteConfig } from "@/config/site";
import { mainNav } from "@/config/navigation";
import { getCountryIndex } from "@/lib/countries";
import { SearchCommand } from "@/components/search-command";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";

export async function Header() {
  const countries = await getCountryIndex();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Mobile Navigation */}
        <MobileNav />

        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center space-x-2 md:mr-8">
          <Globe className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center space-x-6 text-sm font-medium md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                transition-colors hover:text-foreground/80
                ${item.disabled ? "cursor-not-allowed opacity-60" : ""}
              `}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right side - Search, GitHub & Theme toggle */}
        <div className="flex flex-1 items-center justify-end space-x-2 sm:flex-initial">
          <SearchCommand countries={countries} />
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block"
          >
            <div className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              GitHub
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
