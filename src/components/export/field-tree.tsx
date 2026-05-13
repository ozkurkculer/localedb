"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type FieldNode,
  collectAllPaths,
} from "@/lib/export/field-schema";

interface FieldTreeProps {
  nodes: FieldNode[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

function leafPaths(node: FieldNode): string[] {
  if (!node.children?.length) return [node.path];
  return collectAllPaths(node.children);
}

function GroupRow({
  node,
  selected,
  onToggle,
  children,
}: {
  node: FieldNode;
  selected: Set<string>;
  onToggle: (paths: string[], checked: boolean) => void;
  children?: React.ReactNode;
}) {
  const paths = useMemo(() => leafPaths(node), [node]);
  const allOn = paths.every((p) => selected.has(p));
  const someOn = !allOn && paths.some((p) => selected.has(p));

  return (
    <details className="group rounded-lg border bg-card/30 open:bg-card/50" open>
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent/40">
        <ChevronRight
          aria-hidden
          className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90"
        />
        <Checkbox
          checked={allOn ? true : someOn ? "indeterminate" : false}
          onCheckedChange={(v) => onToggle(paths, v === true)}
          onClick={(e) => e.stopPropagation()}
          aria-label={node.key}
        />
        <span className="text-sm font-semibold">{node.key}</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {paths.filter((p) => selected.has(p)).length}/{paths.length}
        </span>
      </summary>
      <div className="space-y-1 px-3 pb-3 pl-10">{children}</div>
    </details>
  );
}

function LeafRow({
  node,
  checked,
  onToggle,
}: {
  node: FieldNode;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
        "hover:bg-accent/40"
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onToggle} aria-label={node.path} />
      <span className="font-mono text-xs">{node.key}</span>
      <span className="ml-auto truncate font-mono text-[10px] text-muted-foreground">
        {node.path}
      </span>
    </label>
  );
}

export function FieldTree({ nodes, selected, onChange }: FieldTreeProps) {
  const t = useTranslations("export.fields");

  const allPaths = useMemo(() => collectAllPaths(nodes), [nodes]);

  const togglePaths = (paths: string[], on: boolean) => {
    const next = new Set(selected);
    for (const p of paths) {
      if (on) next.add(p);
      else next.delete(p);
    }
    onChange(next);
  };

  const selectAll = () => onChange(new Set(allPaths));
  const clearAll = () => onChange(new Set());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p
          aria-live="polite"
          className="text-xs text-muted-foreground"
        >
          {t("selectedCount", { selected: selected.size, total: allPaths.length })}
        </p>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={selectAll}>
            {t("selectAll")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearAll}
            disabled={selected.size === 0}
          >
            {t("clear")}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {nodes.map((node) =>
          node.children?.length ? (
            <GroupRow
              key={node.path}
              node={node}
              selected={selected}
              onToggle={togglePaths}
            >
              {node.children.map((child) => (
                <LeafRow
                  key={child.path}
                  node={child}
                  checked={selected.has(child.path)}
                  onToggle={() => togglePaths([child.path], !selected.has(child.path))}
                />
              ))}
            </GroupRow>
          ) : (
            <div
              key={node.path}
              className="flex items-center rounded-lg border bg-card/30 px-3 py-2"
            >
              <LeafRow
                node={node}
                checked={selected.has(node.path)}
                onToggle={() => togglePaths([node.path], !selected.has(node.path))}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
