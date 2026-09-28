import { parseArgs } from "node:util";
import pc from "picocolors";
import { exportCommand } from "./commands/export";
import { get } from "./commands/get";
import { init } from "./commands/init";
import { list } from "./commands/list";
import { search } from "./commands/search";
import { sync } from "./commands/sync";
import type { Context } from "./context";
import { UsageError } from "./datasets";
import { HELP } from "./help";

const COMMANDS = { get, export: exportCommand, list, search, init, sync } as const;

/** Runs the CLI and resolves to the process exit code. Never throws for user errors. */
export async function run(argv: string[], ctx: Context): Promise<number> {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        fields: { type: "string" },
        format: { type: "string", short: "f" },
        out: { type: "string", short: "o" },
        split: { type: "boolean" },
        all: { type: "boolean" },
        json: { type: "boolean" },
        config: { type: "string", short: "c" },
        check: { type: "boolean" },
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
      },
    });

    if (values.version) {
      const meta = ctx.db.getMeta();
      ctx.stdout.write(`@localedb/cli ${ctx.version}\ndata ${meta.version} (built ${meta.buildDate.slice(0, 10)})\n`);
      return 0;
    }

    const [name, ...rest] = positionals;
    if (!name || name === "help") {
      ctx.stdout.write(`${HELP[rest[0] ?? "main"] ?? HELP.main}\n`);
      return name ? 0 : values.help ? 0 : 1;
    }
    if (!(name in COMMANDS)) throw new UsageError(`Unknown command "${name}". Run \`localedb --help\`.`);
    if (values.help) {
      ctx.stdout.write(`${HELP[name]}\n`);
      return 0;
    }
    return await COMMANDS[name as keyof typeof COMMANDS](ctx, rest, values);
  } catch (error) {
    if (error instanceof UsageError || (error as { code?: string }).code?.startsWith("ERR_PARSE_ARGS")) {
      ctx.stderr.write(`${pc.red("error")} ${(error as Error).message}\n`);
      return 2;
    }
    throw error;
  }
}
