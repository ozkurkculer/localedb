"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UpdateEntry } from "@/lib/updates";

interface ChangelogAccordionProps {
  updates: UpdateEntry[];
}

const APPLE_EASE = [0.32, 0.72, 0, 1] as const;

export function ChangelogAccordion({ updates }: ChangelogAccordionProps) {
  const [openVersion, setOpenVersion] = useState<string | null>(
    updates[0]?.version ?? null
  );

  if (updates.length === 0) {
    return (
      <div className="rounded-lg border border-border/40 p-6 sm:p-8 text-center">
        <p className="text-muted-foreground">No updates available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {updates.map((update) => {
        const isOpen = openVersion === update.version;
        return (
          <ChangelogItem
            key={update.version}
            update={update}
            isOpen={isOpen}
            onToggle={() =>
              setOpenVersion(isOpen ? null : update.version)
            }
          />
        );
      })}
    </div>
  );
}

interface ChangelogItemProps {
  update: UpdateEntry;
  isOpen: boolean;
  onToggle: () => void;
}

function ChangelogItem({ update, isOpen, onToggle }: ChangelogItemProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        "transition-all duration-300",
        "!bg-transparent"
      )}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "changelog-trigger flex w-full h-auto !justify-between whitespace-normal border items-center gap-3 sm:gap-4 px-4 py-3.5 sm:px-5 sm:py-4 text-left rounded-xl",
          isOpen && "border-b border-t-0 border-x-0 rounded-b-none",
          "transition-[border-radius,background-color,border-color] duration-200"
        )}
      >
        <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3 md:gap-4">
          <span className="font-mono text-xs sm:text-sm font-semibold text-primary">
            v{update.version}
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
            <span>{update.releaseDate}</span>
            <span className="hidden sm:inline">•</span>
            <span>{update.totalCommits} commits</span>
          </div>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.35, ease: APPLE_EASE }}
          className="text-muted-foreground shrink-0"
        >
          <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </motion.span>
      </Button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.42, ease: APPLE_EASE },
              opacity: { duration: 0.28, ease: APPLE_EASE },
            }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
              <MarkdownContent content={update.content} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const sections = content.split(/(?=## )/g).filter(Boolean);

  return (
    <div className="space-y-4 sm:space-y-6">
      {sections.map((section, idx) => {
        const lines = section.trim().split("\n");
        const headingMatch = lines[0].match(/^## (.*)/);

        if (!headingMatch) return null;

        const heading = headingMatch[1];
        const body = lines.slice(1).join("\n").trim();
        const hasCodeBlock = body.includes("```");

        return (
          <div key={idx} className="space-y-2 sm:space-y-3">
            <h3 className="text-sm sm:text-base font-semibold tracking-tight">
              {heading}
            </h3>
            {hasCodeBlock ? (
              <div className="overflow-x-auto rounded-lg border border-border/40 bg-muted/20 p-3 sm:p-4">
                <pre className="text-xs sm:text-sm leading-relaxed">
                  <code>{body.replace(/```/g, "").trim()}</code>
                </pre>
              </div>
            ) : (
              <ul className="space-y-1.5 sm:space-y-2 pl-4 sm:pl-5">
                {body
                  .split("\n")
                  .filter((line) => line.trim().startsWith("-"))
                  .map((line, i) => (
                    <li
                      key={i}
                      className="list-disc text-xs sm:text-sm leading-relaxed text-muted-foreground"
                    >
                      {line.replace(/^-\s*/, "")}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
