import Link from "next/link";
import { siteConfig } from "@/config/site";
import { footerNav } from "@/config/navigation";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 md:py-16">
        <div className="grid container grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold">{siteConfig.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
            <ul className="space-y-3 text-sm">
              {footerNav.resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      text-muted-foreground transition-colors hover:text-foreground
                      ${item.disabled ? "cursor-not-allowed opacity-60" : ""}
                    `}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Community</h3>
            <ul className="space-y-3 text-sm">
              {footerNav.community.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      text-muted-foreground transition-colors hover:text-foreground
                      ${item.disabled ? "cursor-not-allowed opacity-60" : ""}
                    `}
                    {...(item.external && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border/40">
          <div className="container flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              Built with ❤️ by developers, for developers.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {footerNav.legal.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                  {...(item.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
    </footer>
  );
}
