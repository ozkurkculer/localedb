import { createRequire } from "node:module";
import { dataDir, createLocaleDB } from "@localedb/core";
import { run } from "./run";

const { version } = createRequire(import.meta.url)("../package.json") as { version: string };

const code = await run(process.argv.slice(2), {
  db: createLocaleDB(dataDir),
  stdout: process.stdout,
  stderr: process.stderr,
  cwd: process.cwd(),
  interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
  version,
});
process.exitCode = code;
