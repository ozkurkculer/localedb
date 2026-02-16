import { Link } from "@/i18n/routing";
import NextLink from "next/link";
import { ArrowRight, Globe2, Code2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export async function Hero() {
  const t = await getTranslations();

  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 py-24 text-center md:py-32 lg:py-40">
      <div className="flex items-center gap-2 rounded-full border border-border/40 bg-muted/50 px-4 py-1.5 text-sm animate-fade-in-up">
        <Globe2 className="h-4 w-4" />
        <span className="font-medium">{t("home.badge")}</span>
      </div>

      <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up-delay-1">
        {t("home.title.the")}{" "}
        <span className="bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent">
          {t("home.title.localization")}
        </span>{" "}
        {t("home.title.forDevelopers")}
      </h1>

      <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in-up-delay-2">
        {t("site.description")}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-up-delay-3">
        <Button size="lg" asChild>
          <Link href="/countries">
            {t("home.cta.browseCountries")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <NextLink href={siteConfig.links.github} target="_blank">
            <Code2 className="mr-2 h-4 w-4" />
            {t("home.cta.viewOnGitHub")}
          </NextLink>
        </Button>
      </div>
    </section>
  );
}
