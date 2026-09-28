import type { Context } from "../context";
import { UsageError, resolveDataset } from "../datasets";
import { planExport, writeFiles } from "../export";
import { resolveFormat } from "../formats";

export interface ExportOptions {
  fields?: string;
  format?: string;
  out?: string;
  split?: boolean;
  all?: boolean;
}

export function exportCommand(ctx: Context, [datasetName, ...rest]: string[], options: ExportOptions): number {
  const dataset = resolveDataset(datasetName);
  const codes = rest.flatMap((arg) => arg.split(",")).map((c) => c.trim()).filter(Boolean);
  if (options.all && codes.length) throw new UsageError("Pass either codes or --all, not both.");

  const plan = planExport(ctx, {
    dataset,
    codes: options.all || codes[0] === "all" ? "all" : codes,
    fields: options.fields as never,
    format: resolveFormat(options.format),
    out: options.out,
    split: options.split,
  });

  if (plan.kind === "stdout") ctx.stdout.write(plan.content);
  else writeFiles(ctx, plan.files);
  return 0;
}
