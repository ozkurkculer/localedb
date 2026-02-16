"use client";

import { Link } from "@/i18n/routing";
import NextLink from "next/link";
import { ArrowRight, Globe2, Code2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations();

  const fadeInUp = {
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: shouldReduceMotion ? 0 : 0.5 },
  };

  return (
    <motion.section
      initial="initial"
      animate="animate"
      className="mx-auto flex max-w-5xl flex-col items-center gap-8 py-24 text-center md:py-32 lg:py-40"
    >
      <motion.div
        {...fadeInUp}
        className="flex items-center gap-2 rounded-full border border-border/40 bg-muted/50 px-4 py-1.5 text-sm"
      >
        <Globe2 className="h-4 w-4" />
        <span className="font-medium">{t("home.badge")}</span>
      </motion.div>

      <motion.h1
        {...fadeInUp}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
      >
        {t("home.title.the")}{" "}
        <span className="bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent">
          {t("home.title.localization")}
        </span>{" "}
        {t("home.title.forDevelopers")}
      </motion.h1>

      <motion.p
        {...fadeInUp}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
      >
        {t("site.description")}
      </motion.p>

      <motion.div
        {...fadeInUp}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
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
      </motion.div>
    </motion.section>
  );
}
