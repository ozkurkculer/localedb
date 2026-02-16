"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  GitPullRequest,
  FileJson,
  Globe,
  BookOpen,
  MessageSquare,
  Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function ContributingPage() {
  const t = useTranslations("contributing");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container py-12 md:py-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-4xl"
      >
        <motion.div variants={item} className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </motion.div>

        {/* Contribution Type Cards */}
        <motion.section variants={item} className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            {
              title: t("cards.fixData.title"),
              icon: FileJson,
              desc: t("cards.fixData.description"),
              color: "text-blue-500",
              bg: "bg-blue-500/10"
            },
            {
              title: t("cards.addCountry.title"),
              icon: Globe,
              desc: t("cards.addCountry.description"),
              color: "text-green-500",
              bg: "bg-green-500/10"
            },
            {
              title: t("cards.improveCode.title"),
              icon: GitPullRequest,
              desc: t("cards.improveCode.description"),
              color: "text-purple-500",
              bg: "bg-purple-500/10"
            }
          ].map((card, i) => (
            <div key={i} className="p-6 rounded-xl border bg-card hover:shadow-lg transition-all">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </motion.section>

        {/* Workflow Steps */}
        <motion.section variants={item} className="mb-20">
          <h2 className="text-2xl font-bold mb-10 text-center">{t("workflow.title")}</h2>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 md:before:ml-8 before:-translate-x-px before:h-full before:w-0.5 before:bg-border before:z-0">
            {/* Step 1 */}
            <div className="relative pl-16 md:pl-24">
              <div className="absolute left-0 md:left-2 top-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-blue-500 text-white font-bold z-10">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">{t("workflow.step1.title")}</h3>
              <p className="text-muted-foreground mb-4">
                {t.rich("workflow.step1.description", {
                  link: (chunks) => <Link href={siteConfig.links.github} target="_blank" className="text-foreground hover:underline">{chunks}</Link>
                })}
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative pl-16 md:pl-24">
              <div className="absolute left-0 md:left-2 top-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-blue-500 text-white font-bold z-10">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">{t("workflow.step2.title")}</h3>
              <p className="text-muted-foreground mb-4">
                {t.rich("workflow.step2.description", {
                  strong: (chunks) => <strong>{chunks}</strong>,
                  code: (chunks) => <code>{chunks}</code>
                })}
              </p>
              <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 shadow-inner overflow-x-auto">
                <pre className="text-xs md:text-sm text-zinc-300 font-mono">
                  {`// data/overrides/TR.json
{
  "currency": {
    "symbolPosition": "before"
  }
}`}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-16 md:pl-24">
              <div className="absolute left-0 md:left-2 top-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-blue-500 text-white font-bold z-10">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">{t("workflow.step3.title")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("workflow.step3.description")}
              </p>
              <div className="flex gap-2">
                <code className="px-2 py-1 rounded bg-muted">npm run build:data</code>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Guidelines Grid */}
        <motion.section variants={item} className="mb-20">
          <h2 className="text-2xl font-bold mb-8">{t("guidelines.title")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border bg-muted/30">
              <h3 className="font-semibold mb-4 flex items-center">
                <GitPullRequest className="w-5 h-5 mr-2" />
                {t("guidelines.pullRequests.title")}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  t("guidelines.pullRequests.items.0"),
                  t("guidelines.pullRequests.items.1"),
                  t("guidelines.pullRequests.items.2"),
                ].map((item, i) => (
                  <li key={i} className="flex items-center">• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl border bg-muted/30">
              <h3 className="font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                {t("guidelines.resources.title")}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  • {t.rich("guidelines.resources.items.0", {
                    linkCLDR: (chunks) => <Link href="https://cldr.unicode.org/" target="_blank" className="hover:underline">{chunks}</Link>
                  })}
                </li>
                <li className="flex items-center">
                  • {t.rich("guidelines.resources.items.1", {
                    linkMledoze: (chunks) => <Link href="https://github.com/mledoze/countries" target="_blank" className="hover:underline">{chunks}</Link>
                  })}
                </li>
                <li className="flex items-center">
                  • {t("guidelines.resources.items.2")}
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Help CTA */}
        <motion.section variants={item} className="text-center bg-card border rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-4">{t("help.title")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("help.description")}
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link href={`${siteConfig.links.github}/discussions`} target="_blank">
              <MessageSquare className="mr-2 h-5 w-5" />
              {t("help.button")}
            </Link>
          </Button>
        </motion.section>

      </motion.div>
    </div>
  );
}
