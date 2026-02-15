"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Globe2, 
  Database, 
  Code2, 
  Github, 
  BookOpen, 
  AlertTriangle, 
  Calendar, 
  Coins, 
  MapPin, 
  Plane 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function AboutPage() {
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
        className="mx-auto max-w-5xl"
      >
        {/* Header */}
        <motion.div variants={item} className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Global Data for Modern Apps
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {siteConfig.description}
          </p>
        </motion.div>

        {/* The Problem */}
        <motion.section variants={item} className="mb-24">
          <div className="flex items-center justify-center mb-10">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl font-bold ml-4">The Challenge</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Coins, text: "Currency symbol placement (before or after?)" },
              { icon: Calendar, text: "Date format differences (DD/MM vs MM/DD)" },
              { icon: Code2, text: "Number separators (1,250.00 vs 1.250,00)" },
              { icon: MapPin, text: "Address formatting conventions" },
              { icon: Globe2, text: "Time zones and calendar systems" },
              { icon: Database, text: "Scattered documentation & heavy libraries" },
            ].map((problem, idx) => (
              <div key={idx} className="flex items-start p-6 rounded-xl border bg-card/50 backdrop-blur-sm">
                <problem.icon className="w-6 h-6 text-muted-foreground mr-4 shrink-0" />
                <p className="font-medium text-muted-foreground">{problem.text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Our Solution */}
        <motion.section variants={item} className="mb-24">
          <div className="flex items-center justify-center mb-10">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold ml-4">Our Solution</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/50">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Globe2 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Comprehensive Data
              </h3>
              <ul className="space-y-3">
                {[
                  "Structured JSON for every country",
                  "Ready-to-use formatting rules",
                  "CLDR-based accuracy",
                  "Global Airport Database (IATA/ICAO)"
                ].map((feat, i) => (
                    <li key={i} className="flex items-center text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3" />
                        {feat}
                    </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/50">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Code2 className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                Developer Experience
              </h3>
              <ul className="space-y-3">
                {[
                  "Fast, static generation",
                  "No server required",
                  "Open source (MIT Licensed)",
                  "Community contributions"
                ].map((feat, i) => (
                    <li key={i} className="flex items-center text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3" />
                        {feat}
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Data Sources */}
        <motion.section variants={item} className="mb-24 text-center">
          <h2 className="text-2xl font-bold mb-8">Trusted Data Sources</h2>
          <div className="flex flex-wrap justify-center gap-4">
             {[
                 "CLDR (Common Locale Data Repository)",
                 "mledoze/countries",
                 "IP2Location Airports",
                 "Google libaddressinput",
                 "Community Contributions"
             ].map((source, i) => (
                 <span key={i} className="px-4 py-2 rounded-full bg-muted text-sm font-medium">
                     {source}
                 </span>
             ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section variants={item} className="text-center">
           <div className="p-12 rounded-3xl bg-card border shadow-lg">
               <h2 className="text-3xl font-bold mb-4">Open Source & Community Driven</h2>
               <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                 LocaleDB is MIT licensed and welcomes contributions. Whether you're fixing a typo, 
                 adding a missing country, or improving the UI, we'd love your help.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button size="lg" asChild>
                   <Link href={siteConfig.links.github} target="_blank">
                     <Github className="mr-2 h-5 w-5" />
                     View on GitHub
                   </Link>
                 </Button>
                 <Button size="lg" variant="outline" asChild>
                   <Link href="/contributing">
                     <BookOpen className="mr-2 h-5 w-5" />
                     Contributing Guide
                   </Link>
                 </Button>
               </div>
           </div>
        </motion.section>

      </motion.div>
    </div>
  );
}
