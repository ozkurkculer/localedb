import type { Context } from "../context";
import { UsageError } from "../datasets";
import { printTable } from "../table";

export function search(ctx: Context, positionals: string[], options: { json?: boolean }): number {
  const query = positionals.join(" ");
  if (!query.trim()) throw new UsageError("Usage: localedb search <query>");
  const results = ctx.db.searchCountries(query);
  if (options.json) {
    ctx.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  } else if (results.length === 0) {
    ctx.stderr.write(`No countries match "${query}".\n`);
    return 1;
  } else {
    printTable(ctx.stdout, ["CODE", "ALPHA3", "NAME", "NATIVE", "LOCALE"],
      results.map((c) => [c.code, c.alpha3, c.name, c.nativeName, c.primaryLocale]));
  }
  return results.length ? 0 : 1;
}
