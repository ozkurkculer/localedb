"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "completed" | "in-progress" | "planned";

interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  status: Status;
  date?: string;
}

const roadmapData: RoadmapItem[] = [
  {
    id: "1",
    title: "Project Initiation & Data Population",
    description: "Initial setup of the Next.js project and population of core data for countries, currencies, and languages.",
    status: "completed",
    date: "Q1 2026",
  },
  {
    id: "2",
    title: "Bug Fixes & Contribution System",
    description: "Resolving initial issues and establishing a robust workflow for community contributions via overrides.",
    status: "in-progress",
    date: "Q1 2026",
  },
  {
    id: "3",
    title: "Data Export Interface",
    description: "A user interface allowing users to select specific countries and export their data in custom JSON formats.",
    status: "planned",
    date: "Q2 2026",
  },
  {
    id: "4",
    title: "npm Package & CLI Tool",
    description: "A dedicated npm package and CLI tool for developers to download and integrate locale data directly into their projects.",
    status: "planned",
    date: "Q2 2026",
  },
  {
    id: "5",
    title: "Public API Launch",
    description: "Development and deployment of a RESTful API to serve locale data dynamically.",
    status: "planned",
    date: "Q3 2026",
  },
];

const statusConfig = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  "in-progress": {
    label: "In Progress",
    icon: Loader2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  planned: {
    label: "Planned",
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border/50",
  },
};

export default function RoadmapPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Project Roadmap
        </h1>
        <p className="text-xl text-muted-foreground">
          LocaleDB's development journey and future plans.
        </p>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {roadmapData.map((item, index) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
            >
              {/* Icon Marker */}
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10",
                config.color,
                config.border
              )}>
                <Icon className={cn("w-5 h-5", item.status === "in-progress" && "animate-spin")} />
              </div>

              {/* Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:bg-card">
                 <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        config.bg,
                        config.color,
                        config.border
                    )}>
                        {config.label}
                    </span>
                    {item.date && (
                        <span className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.date}
                        </span>
                    )}
                 </div>
                 <h3 className="text-lg font-semibold leading-tight">
                    {item.title}
                 </h3>
                 {item.description && (
                     <p className="mt-2 text-muted-foreground text-sm">
                         {item.description}
                     </p>
                 )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
