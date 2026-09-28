import { dirname, relative, resolve } from "node:path";
import pc from "picocolors";
import { CONFIG_FILE, readConfig } from "../config";
import type { Context } from "../context";
import { planExport, staleFiles, writeFiles, type PlannedFile } from "../export";

export function sync(ctx: Context, _positionals: string[], options: { config?: string; check?: boolean }): number {
  const configPath = resolve(ctx.cwd, options.config ?? CONFIG_FILE);
  const config = readConfig(configPath);
  const baseDir = dirname(configPath);

  const files: PlannedFile[] = config.exports.flatMap((job) => {
    const plan = planExport(ctx, job, baseDir);
    return plan.kind === "files" ? plan.files : [];
  });

  if (options.check) {
    const stale = staleFiles(files);
    if (stale.length) {
      ctx.stderr.write(`${pc.red("Out of date")} with LocaleDB data v${ctx.db.getMeta().version}:\n`);
      for (const file of stale) ctx.stderr.write(`  ${relative(ctx.cwd, file.path)}\n`);
      ctx.stderr.write(`Run \`localedb sync\` to update.\n`);
      return 1;
    }
    ctx.stderr.write(`${pc.green("Up to date")}: ${files.length} file${files.length === 1 ? "" : "s"}.\n`);
    return 0;
  }

  writeFiles(ctx, files);
  return 0;
}
