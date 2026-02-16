"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { UpdateEntry } from "@/lib/updates";

interface UpdatesListProps {
  updates: UpdateEntry[];
}

export function UpdatesList({ updates }: UpdatesListProps) {
  if (updates.length === 0) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
        <p className="text-muted-foreground">No updates available yet.</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible defaultValue={`item-${updates[0].version}`}>
      {updates.map((update) => (
        <AccordionItem
          key={update.version}
          value={`item-${update.version}`}
          className="rounded-lg border border-border/40 bg-card px-4 mb-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col items-start gap-2 text-left sm:flex-row sm:items-center sm:gap-4">
              <span className="inline-flex rounded-md bg-primary/10 px-3 py-1 font-mono text-sm font-semibold text-primary">
                v{update.version}
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{update.releaseDate}</span>
                <span className="hidden sm:inline">•</span>
                <span>{update.totalCommits} commits</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <MarkdownContent content={update.content} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown parser for the known changelog format
  const sections = content.split(/(?=## )/g).filter(Boolean);

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => {
        const lines = section.trim().split("\n");
        const headingMatch = lines[0].match(/^## (.*)/);

        if (!headingMatch) return null;

        const heading = headingMatch[1];
        const body = lines.slice(1).join("\n").trim();

        // Check if section contains a code block (File Changes)
        const hasCodeBlock = body.includes("```");

        return (
          <div key={idx} className="space-y-2">
            <h3 className="text-lg font-semibold">{heading}</h3>
            {hasCodeBlock ? (
              <div className="overflow-x-auto rounded-lg bg-muted p-4">
                <pre className="text-sm">
                  <code>{body.replace(/```/g, "").trim()}</code>
                </pre>
              </div>
            ) : (
              <ul className="space-y-1 pl-5">
                {body
                  .split("\n")
                  .filter((line) => line.trim().startsWith("-"))
                  .map((line, i) => (
                    <li key={i} className="text-sm text-muted-foreground list-disc">
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
