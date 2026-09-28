import { pickFields } from "@localedb/core";
import type { Context } from "../context";
import { UsageError, getRecord, resolveDataset, resolveFields } from "../datasets";

export function get(ctx: Context, [datasetName, code]: string[], options: { fields?: string }): number {
  const dataset = resolveDataset(datasetName);
  if (!code) throw new UsageError("Usage: localedb get <dataset> <code>");
  const found = getRecord(ctx.db, dataset, code);
  if (!found) throw new UsageError(`Not found in ${dataset}: ${code}.`);
  const record = options.fields ? pickFields(found.record, resolveFields(dataset, options.fields)) : found.record;
  ctx.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
  return 0;
}
