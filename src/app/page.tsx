"use client";

import Link from "next/link";
import { ArrowRight, Globe2, Code2, Database } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  return (
    <div className="container relative">
      {/* Hero Section */}
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
          <span className="font-medium">Open Source Localization Data</span>
        </motion.div>

        <motion.h1
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          The{" "}
          <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Localization Encyclopedia
          </span>{" "}
          for Developers
        </motion.h1>

        <motion.p
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          {siteConfig.description}
        </motion.p>

        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link href="/countries">
              Browse Countries
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={siteConfig.links.github} target="_blank">
              <Code2 className="mr-2 h-4 w-4" />
              View on GitHub
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* Feature Cards */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="mx-auto max-w-5xl pb-24 md:pb-32"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Globe2 className="h-10 w-10" />}
            title="Currency Formats"
            description="Symbol position, separators, and patterns for every currency in the world."
          />
          <FeatureCard
            title="Countries"
            description="Browse localization data for 250+ countries including codes, currencies, and formatting."
            href="/countries"
          />
          <FeatureCard
            title="Languages"
            description="Explore processed data for world languages, including native names and countries."
            href="/languages"
          />
          <FeatureCard
            title="Currencies"
            description="Detailed currency information with symbols, formatting rules, and subunits."
            href="/currencies"
            disabled
          />
        </div>
      </motion.section>
    </div>
  );
}

interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
}

function FeatureCard({ icon, title, description, href, disabled }: FeatureCardProps) {
  const Content = (
    <div className={`group relative h-full overflow-hidden rounded-lg border border-border/40 bg-background p-6 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border hover:shadow-md'}`}>
      {icon && (
        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href}>
        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {Content}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div variants={fadeInUp} className="h-full">
      {Content}
    </motion.div>
  );
}
